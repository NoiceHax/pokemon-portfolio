import type { BlogFrontmatter, Profile, Project } from '@/content/schema'
import { getContact } from '@/lib/content'
import { AUTHOR_NAME, SITE_NAME, SITE_URL, absoluteUrl } from './config'
import { journalOgImage, projectOgImage } from './ogImage'

/**
 * JSON-LD builders. These return plain objects (not React) so a page can compose or
 * inspect them before handing one to <JsonLd />.
 *
 * Every builder drops keys it cannot fill: a `null` or `""` in structured data makes
 * the whole block invalid to a crawler, whereas an absent key is simply less detail.
 */

type JsonLdObject = Record<string, unknown>

/** Drop keys with no value so we never emit nulls or empty arrays into the graph. */
function compact(data: Record<string, unknown>): JsonLdObject {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

function nonEmpty(values: string[]): string[] | undefined {
  return values.length > 0 ? values : undefined
}

/**
 * Real profile URLs only - `sameAs` is an identity claim, so it is built from the
 * contact channels rather than guessed, and `mailto:`/relative hrefs are excluded.
 */
function profileLinks(): string[] {
  return getContact()
    .channels.map((channel) => channel.href)
    .filter((href) => href.startsWith('https://') || href.startsWith('http://'))
}

export function personSchema(profile: Profile): JsonLdObject {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url: SITE_URL,
    image: absoluteUrl(profile.avatar.src),
    description: profile.currentQuest,
    sameAs: nonEmpty(profileLinks()),
  })
}

export function webSiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

/**
 * No `dateModified`: `blog_posts` stores only `post_date`, so the only value available is
 * `datePublished` again - a last-modified claim the data cannot back.
 */
export function blogPostingSchema(fm: BlogFrontmatter): JsonLdObject {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    author: { '@type': 'Person', name: AUTHOR_NAME, url: SITE_URL },
    url: absoluteUrl(`/home/journal/${fm.slug}`),
    image: absoluteUrl(journalOgImage(fm)),
    keywords: nonEmpty(fm.tags),
  })
}

export function projectSchema(project: Project): JsonLdObject {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/home/pokedex/${project.slug}`),
    image: absoluteUrl(projectOgImage(project)),
    keywords: nonEmpty(project.stack),
  })
}
