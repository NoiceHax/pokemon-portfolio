/**
 * SEO constants - the single source of truth for the canonical origin and the
 * identity strings that appear in metadata, JSON-LD, sitemap and robots. These were
 * previously duplicated as literals across layout/robots/sitemap; duplicating an
 * origin is how a domain change silently half-lands.
 */

export const SITE_URL = 'https://noicehax.dev'
export const SITE_NAME = 'Trainer Chandan'
export const AUTHOR_NAME = 'Chandan'
export const DEFAULT_OG_IMAGE = '/og.png'

/**
 * Absolute URL for a site path. Accepts a path with or without a leading slash, and
 * returns the bare origin (no trailing slash) for the home path so canonical URLs
 * never differ by a stray '/'. An already-absolute URL passes through - `urlSchema`
 * permits external hrefs, and prefixing one would produce a dead link.
 */
export function absoluteUrl(path: string): string {
  const trimmed = path.trim()
  if (trimmed === '' || trimmed === '/') return SITE_URL
  if (/^https?:\/\//.test(trimmed)) return trimmed
  return `${SITE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`
}
