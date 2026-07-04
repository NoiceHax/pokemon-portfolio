import { NextResponse } from 'next/server'
import { getJournalFrontmatter } from '@/lib/content/journal'

/**
 * Public, read-only Journal list. Returns published post frontmatter (DB-first, MDX
 * fallback) - the SAME source the Journal page uses - so client surfaces like the
 * Adventure "peek inside" preview can show real, up-to-date posts.
 *
 * `force-dynamic` so a freshly published post appears immediately (no static snapshot).
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const entries = await getJournalFrontmatter()
    return NextResponse.json({ entries })
  } catch {
    // Never break the caller - an empty list just yields an empty preview.
    return NextResponse.json({ entries: [] })
  }
}
