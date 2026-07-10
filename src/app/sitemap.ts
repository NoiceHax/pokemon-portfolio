import type { MetadataRoute } from 'next'
import { getProjects, getJournalEntries } from '@/lib/content'

const SITE_URL = 'https://trainer-chandan.vercel.app'

/**
 * Sitemap generated from the shared content layer, so new projects/journal entries are
 * indexed automatically - no manual list to keep in sync.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/home',
    '/home/pokedex',
    '/home/experience',
    '/home/journal',
    '/home/pokemon-center',
    '/adventure',
    '/hall-of-fame',
  ]
  const projectPaths = getProjects().map((p) => `/home/pokedex/${p.slug}`)
  const journalPaths = getJournalEntries().map((e) => `/home/journal/${e.frontmatter.slug}`)

  return [...staticPaths, ...projectPaths, ...journalPaths].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date('2026-07-02'),
  }))
}
