import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/content'
import { getJournalFrontmatter } from '@/lib/content/journal'
import { SITE_URL } from '@/lib/seo'

/**
 * Sitemap generated from the shared content layer, so new projects/journal entries are
 * indexed automatically - no manual list to keep in sync.
 *
 * `force-dynamic` because Journal posts are authored at runtime in the Control Room
 * while container deploys are manual: a build-time snapshot would omit every post
 * written since the last deploy, which is exactly what it did before.
 *
 * No changeFrequency/priority: Google ignores both outright and Bing treats them as a
 * weak hint, so they would be per-URL noise with nothing to show for it.
 */

export const dynamic = 'force-dynamic'

/**
 * `lastModified` is optional, and a URL with no real timestamp (the static routes, and
 * projects whose optional `date` is unset) simply omits it. A fixed stand-in date would
 * keep asserting the same never-advancing value after content actually changed, which is
 * worse than saying nothing: a lastmod inconsistent with what a crawler observes gets the
 * whole file's lastmod ignored.
 */
function lastModified(date: string | undefined): Date | undefined {
  if (!date) return undefined
  // `new Date` yields an Invalid Date rather than throwing, and Next calls .toISOString()
  // on it while serializing - outside this function, where a try/catch here cannot help.
  // That RangeError takes down the entire sitemap, not just the one <url>.
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

// `/adventure` is omitted on purpose: it is a client-only page loaded with `ssr: false`,
// so a crawler receives nothing but the "Loading world…" fallback.
// `/home` is omitted: it is the alternate URL for the Trainer Card and canonicals to
// `''` (the bare domain), and submitting a URL that points its canonical elsewhere is
// what puts it in Search Console's "Alternate page with proper canonical tag" bucket.
const STATIC_PATHS = [
  '',
  '/home/pokedex',
  '/home/experience',
  '/home/journal',
  '/home/pokemon-center',
  '/hall-of-fame',
  '/privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...getProjects().map((project) => ({
      url: `${SITE_URL}/home/pokedex/${project.slug}`,
      lastModified: lastModified(project.date),
    })),
  ]

  try {
    const journal = await getJournalFrontmatter()
    entries.push(
      ...journal.map((fm) => ({
        url: `${SITE_URL}/home/journal/${fm.slug}`,
        lastModified: lastModified(fm.date),
      })),
    )
  } catch {
    // A sitemap missing its Journal section still lists everything else; one that throws
    // returns a 500 and costs the crawler the whole file.
  }

  return entries
}
