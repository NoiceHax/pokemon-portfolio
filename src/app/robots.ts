import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Backlink/keyword crawlers that mine the site for databases they resell. They send no
 * visitors back and every pass burns Vercel bandwidth, so they get nothing.
 */
const SCRAPER_BOTS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'Barkrowler',
  'serpstatbot',
]

/**
 * AI crawlers are allowed on purpose. Answer engines are increasingly where someone looks up
 * a name, and being quotable there is worth more than withholding the content. Listed
 * explicitly rather than left to the `*` rule so the decision is on the record.
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
]

/**
 * JSON endpoints have nothing to rank and each crawl is a billed function invocation; the
 * control room is unlisted by design (it also sends its own noindex, see its page metadata).
 */
const PRIVATE_PATHS = ['/api/', '/control-room']

export default function robots(): MetadataRoute.Robots {
  // Preview deploys serve production's content on a *.vercel.app subdomain. Vercel already
  // sends X-Robots-Tag: noindex there, but matching robots.txt keeps a branch alias from ever
  // competing with the real site for the same queries.
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    // A crawler obeys only the most specific group matching it, so the shared disallows are
    // repeated in the AI group rather than inherited from `*`.
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: SCRAPER_BOTS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
