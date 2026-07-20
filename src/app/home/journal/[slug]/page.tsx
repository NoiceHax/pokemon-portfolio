import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { getJournalEntry } from '@/lib/content'
import { getDbBlogPost } from '@/lib/db/blogPosts'
import type { BlogFrontmatter } from '@/content/schema'
import { Panel } from '@/recruiter/ui'
import { ENTRY_TYPE_META } from '@/recruiter/journal'

// DB-backed content: render fresh per request so newly published/edited posts appear
// immediately rather than from a cached static render.
export const dynamic = 'force-dynamic'

interface EntryPageProps {
  params: { slug: string }
}

/** Load an entry from the DB first (rendering its stored MDX), else the bundled MDX. */
async function loadEntry(
  slug: string,
): Promise<{ fm: BlogFrontmatter; body: React.ReactNode } | null> {
  const dbPost = await getDbBlogPost(slug)
  if (dbPost) {
    try {
      const { content } = await compileMDX({ source: dbPost.bodyMdx })
      return { fm: dbPost.frontmatter, body: content }
    } catch (err) {
      // Malformed MDX in a DB post shouldn't crash the whole page - fall back to a
      // friendly notice instead of an uncaught Server Components render error.
      // eslint-disable-next-line no-console
      console.error(`Failed to compile journal post "${slug}":`, err)
      return {
        fm: dbPost.frontmatter,
        body: (
          <p className="text-sm text-ink-faint">
            This entry couldn&apos;t be rendered due to a formatting error. Edit it in the
            Control Room to fix it.
          </p>
        ),
      }
    }
  }
  const staticEntry = getJournalEntry(slug)
  if (staticEntry) {
    const Body = staticEntry.Body
    return { fm: staticEntry.frontmatter, body: <Body /> }
  }
  return null
}

export async function generateMetadata({ params }: EntryPageProps) {
  const entry = await loadEntry(params.slug)
  if (!entry) return { title: 'Unknown Entry' }
  return { title: entry.fm.title, description: entry.fm.excerpt }
}

/**
 * A single Journal entry. Renders a DB-stored MDX body when the post lives in NeonDB,
 * otherwise the bundled static MDX. Frontmatter drives the header.
 */
export default async function JournalEntryPage({ params }: EntryPageProps) {
  const entry = await loadEntry(params.slug)
  if (!entry) notFound()

  const { fm, body } = entry
  const meta = ENTRY_TYPE_META[fm.type]

  return (
    <article className="space-y-6">
      <Link
        href="/home/journal"
        className="inline-flex items-center gap-1 font-mono text-sm text-ink-soft hover:text-poke-red focus:outline-none focus-visible:text-poke-red"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Back to Journal
      </Link>

      <Panel className="p-6">
        <div className="flex items-center gap-2">
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-xs uppercase ${meta.classes}`}
          >
            {meta.label}
          </span>
          <span className="font-mono text-xs text-ink-faint">
            #{String(fm.entryNumber).padStart(2, '0')}
          </span>
        </div>

        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{fm.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-faint">
          <span className="flex items-center gap-1">
            <Calendar aria-hidden className="h-3 w-3" />
            {fm.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock aria-hidden className="h-3 w-3" />
            {fm.readMinutes} min read
          </span>
          {fm.tags.map((tag) => (
            <span key={tag} className="rounded bg-surface-sunken px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <div className="prose-journal mt-6 border-t border-edge pt-6 font-sans text-ink">
          {body}
        </div>
      </Panel>
    </article>
  )
}
