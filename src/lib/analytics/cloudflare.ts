/**
 * Cloudflare-backed visitor total for the "Trainers visited" counter.
 *
 * Reads the zone's daily unique visitors (`httpRequests1dGroups.uniq.uniques`) from
 * CLOUDFLARE_ANALYTICS_SINCE up to today through the GraphQL Analytics API. Summed, this is
 * the same number the Cloudflare dashboard shows, so it counts everyone who reaches the
 * site (including people who only play the adventure and never open /home). Like the
 * dashboard, a returning visitor counts once per day they visit.
 *
 * Server-only: the API token never leaves the server. Results are cached in memory for
 * CACHE_TTL_MS so the counter costs at most one round of API calls per hour per process.
 */

const ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const CACHE_TTL_MS = 60 * 60 * 1000
const FAILURE_RETRY_MS = 5 * 60 * 1000
/** Days per GraphQL request. Kept small so no single query trips a plan's range limit. */
const CHUNK_DAYS = 30
const DEFAULT_SINCE = '2026-07-04'

const token = process.env.CLOUDFLARE_API_TOKEN
const zoneTag = process.env.CLOUDFLARE_ZONE_ID
const since = process.env.CLOUDFLARE_ANALYTICS_SINCE || DEFAULT_SINCE

export const isCloudflareAnalyticsConfigured = Boolean(token && zoneTag)

const QUERY = `
  query Uniques($zoneTag: string!, $since: Date!, $until: Date!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequests1dGroups(limit: 100, filter: { date_geq: $since, date_leq: $until }) {
          dimensions { date }
          uniq { uniques }
        }
      }
    }
  }
`

type GraphQlResponse = {
  data?: {
    viewer?: {
      zones?: {
        httpRequests1dGroups?: { dimensions?: { date?: string }; uniq?: { uniques?: number } }[]
      }[]
    }
  } | null
  errors?: { message: string }[] | null
}

const DAY_MS = 24 * 60 * 60 * 1000
const toDate = (d: Date) => d.toISOString().slice(0, 10)

/** Split [start, end] (inclusive, UTC days) into CHUNK_DAYS-sized windows. */
function windows(start: Date, end: Date): { since: string; until: string }[] {
  const out: { since: string; until: string }[] = []
  for (let t = start.getTime(); t <= end.getTime(); t += CHUNK_DAYS * DAY_MS) {
    const until = Math.min(t + (CHUNK_DAYS - 1) * DAY_MS, end.getTime())
    out.push({ since: toDate(new Date(t)), until: toDate(new Date(until)) })
  }
  return out
}

/** Unique visitors keyed by UTC day (YYYY-MM-DD). */
export type DailyUniques = Record<string, number>

async function fetchWindow(w: { since: string; until: string }): Promise<DailyUniques> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { zoneTag, ...w } }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as GraphQlResponse
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '))
  const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? []
  const days: DailyUniques = {}
  for (const g of groups) {
    if (g.dimensions?.date) days[g.dimensions.date] = g.uniq?.uniques ?? 0
  }
  return days
}

async function fetchDays(): Promise<DailyUniques | null> {
  const start = new Date(`${since}T00:00:00Z`)
  if (Number.isNaN(start.getTime())) {
    console.error(`[cloudflare] invalid CLOUDFLARE_ANALYTICS_SINCE: ${since}`)
    return null
  }
  const results = await Promise.allSettled(windows(start, new Date()).map(fetchWindow))
  const ok = results.filter((r): r is PromiseFulfilledResult<DailyUniques> => r.status === 'fulfilled')
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
  if (failed.length) {
    console.error(
      `[cloudflare] ${failed.length}/${results.length} analytics windows failed:`,
      String(failed[0].reason),
    )
  }
  // Windows older than the plan's retention fail on their own; the rest still count.
  // If every window failed (bad token, wrong zone) report "unknown" instead of 0.
  if (!ok.length) return null
  return Object.assign({}, ...ok.map((r) => r.value)) as DailyUniques
}

let cached: { value: DailyUniques | null; expires: number } | null = null
let inflight: Promise<DailyUniques | null> | null = null

/** Daily unique visitors per Cloudflare, or null when unconfigured / unreachable. */
export async function getCloudflareDailyUniques(): Promise<DailyUniques | null> {
  if (!isCloudflareAnalyticsConfigured) return null
  if (cached && cached.expires > Date.now()) return cached.value
  inflight ??= fetchDays()
    .catch((err) => {
      console.error('[cloudflare] analytics fetch failed:', err)
      return null
    })
    .then((value) => {
      cached = { value, expires: Date.now() + (value === null ? FAILURE_RETRY_MS : CACHE_TTL_MS) }
      return value
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
