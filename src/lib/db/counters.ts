import { sql } from './client'

/**
 * Durable site counters (Neon). Used for the "trainers visited" analytics under the
 * sidebar. `incrementVisits` counts a unique-ish visit (the client only calls it once per
 * browser via localStorage), `getVisits` reads the total. Safe no-ops when DB is unset.
 */

const VISITS = 'visits'

export async function getVisits(): Promise<number> {
  if (!sql) return 0
  try {
    const rows = (await sql`SELECT value FROM counters WHERE name = ${VISITS}`) as {
      value: number
    }[]
    return Number(rows[0]?.value ?? 0)
  } catch {
    return 0
  }
}

const CF_DAY_PREFIX = 'cf_day:'

/**
 * Persist Cloudflare's per-day unique visitors and return the all-time sum.
 *
 * Each day is its own `counters` row (`cf_day:YYYY-MM-DD`), ratcheted with GREATEST so a
 * day's figure only grows as Cloudflare finalises it. Days that later fall outside the
 * plan's analytics retention keep their stored value, so the total never shrinks or
 * freezes. Without a DB it just sums what Cloudflare returned this time.
 */
export async function storeCloudflareDays(days: Record<string, number>): Promise<number> {
  const entries = Object.entries(days)
  const fetchedSum = entries.reduce((sum, [, v]) => sum + v, 0)
  if (!sql) return fetchedSum
  try {
    if (entries.length) {
      const names = entries.map(([d]) => CF_DAY_PREFIX + d)
      const values = entries.map(([, v]) => v)
      await sql`
        INSERT INTO counters (name, value)
        SELECT * FROM unnest(${names}::text[], ${values}::bigint[])
        ON CONFLICT (name) DO UPDATE SET value = GREATEST(counters.value, EXCLUDED.value)
      `
    }
    const rows = (await sql`
      SELECT COALESCE(SUM(value), 0) AS total FROM counters
      WHERE name LIKE ${CF_DAY_PREFIX + '%'}
    `) as { total: number | string }[]
    return Math.max(Number(rows[0]?.total ?? 0), fetchedSum)
  } catch (err) {
    console.error('[counters] storing Cloudflare days failed:', err)
    return fetchedSum
  }
}

/** Atomically bump the visit counter and return the new total. */
export async function incrementVisits(): Promise<number> {
  if (!sql) return 0
  try {
    const rows = (await sql`
      INSERT INTO counters (name, value) VALUES (${VISITS}, 1)
      ON CONFLICT (name) DO UPDATE SET value = counters.value + 1
      RETURNING value
    `) as { value: number }[]
    return Number(rows[0]?.value ?? 0)
  } catch {
    return 0
  }
}
