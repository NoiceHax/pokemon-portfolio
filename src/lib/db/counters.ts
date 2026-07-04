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
