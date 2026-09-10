import { SITE_URL, absoluteUrl } from './config'

/**
 * IndexNow ping - tells a search engine a URL changed instead of waiting for its next
 * crawl. Journal posts are written at runtime in the Control Room while container
 * deploys are manual and infrequent, so without this a new post is only discovered
 * whenever a crawler next happens to re-read the sitemap.
 *
 * IndexNow covers Bing, Yandex and Seznam. Google is deliberately NOT pinged: it
 * retired its sitemap ping endpoint in June 2023 and that URL is now a no-op. Google
 * discovery comes from the `Sitemap:` line in robots.txt plus Search Console.
 */

const ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Ownership proof. The engine fetches `keyLocation` and expects the file's contents to
 * be exactly this string, so the constant and public/<key>.txt must stay in lockstep.
 */
const KEY = 'a7f3c9e10b4d42f8ab6e5c2d81f094b7'
const KEY_LOCATION = absoluteUrl(`/${KEY}.txt`)

/**
 * Only the canonical origin may submit: a preview deploy serves the same content from a
 * *.vercel.app host, and IndexNow rejects a submission whose URLs are not on `host`.
 */
function isProductionOrigin(): boolean {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== 'production') return false
  return process.env.NODE_ENV === 'production'
}

/**
 * Submit absolute URLs for recrawl. Best-effort by design - every failure is swallowed:
 * the sitemap still carries the URL, so a rejected ping costs discovery speed and
 * nothing else.
 *
 * A non-2xx IS logged. IndexNow answers 403 on a key mismatch and 422 on a host
 * mismatch, and both are permanent misconfigurations rather than transient failures -
 * without a line in the log, a key that has silently stopped working looks identical to
 * one that works.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0 || !isProductionOrigin()) return
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
      cache: 'no-store',
      // Callers await this on a request path, so the bound is also the worst case a
      // Control Room save can wait on an unresponsive endpoint.
      signal: AbortSignal.timeout(2_500),
    })
    if (!response.ok) {
      console.error(`[indexnow] submission rejected: ${response.status} ${response.statusText}`)
    }
  } catch {
    // Intentionally silent - a network failure is transient and costs nothing.
  }
}
