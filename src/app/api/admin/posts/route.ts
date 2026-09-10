import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hasValidSession } from '@/lib/admin/auth'
import { getAllDbBlogPosts, upsertDbBlogPost, deleteDbBlogPost } from '@/lib/db/blogPosts'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'
import { absoluteUrl } from '@/lib/seo'
import { pingIndexNow } from '@/lib/seo/indexnow'

/**
 * Admin blog CRUD. Every method requires a valid admin session AND is rate-limited.
 * Writes go to the Neon `blog_posts` table (which the public Journal reads).
 *
 * A successful write also nudges IndexNow (Bing/Yandex/Seznam) so a post published here
 * is discoverable without waiting for the next manual container deploy. The ping IS
 * awaited: on a serverless host nothing keeps a function alive past the response, and
 * neither `waitUntil` nor Next 15's `after()` is available in this stack, so work left
 * running after the return is not guaranteed to finish at all. The 2.5s AbortSignal
 * inside pingIndexNow bounds what this can add to a Control Room save.
 */

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only'),
  entryNumber: z.number().int().positive().max(99999),
  type: z.enum(['field-note', 'build-log', 'research', 'learning', 'thought', 'article']),
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().min(1).max(400),
  bodyMdx: z.string().max(100_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readMinutes: z.number().int().positive().max(999),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  draft: z.boolean(),
})

/** Submit the changed entry plus the sitemap that now lists (or no longer lists) it. */
async function notifySearchEngines(slug: string): Promise<void> {
  await pingIndexNow([absoluteUrl(`/home/journal/${slug}`), absoluteUrl('/sitemap.xml')])
}

async function guard(request: Request): Promise<Response | null> {
  const rl = await rateLimit(`admin-posts:${clientIp(request)}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)
  if (!hasValidSession()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  const posts = await getAllDbBlogPosts()
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid post.', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  try {
    await upsertDbBlogPost(parsed.data)
    // Ping either way. Publishing announces a new URL; UNPUBLISHING makes that URL 404 for
    // the public (the draft guard in home/journal/[slug] returns null), which is exactly the
    // condition the DELETE branch below submits for - a crawler needs the same nudge to drop
    // a withdrawn entry as a deleted one. Skipping drafts meant an unpublished post kept
    // being served from Bing/Yandex indefinitely.
    await notifySearchEngines(parsed.data.slug)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save post.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const blocked = await guard(request)
  if (blocked) return blocked
  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 })
  try {
    await deleteDbBlogPost(slug)
    // The URL is now a 404; submitting it is how a crawler learns to drop it.
    await notifySearchEngines(slug)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete post.' }, { status: 500 })
  }
}
