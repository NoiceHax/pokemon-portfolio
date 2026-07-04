import { sql, isDbConfigured } from './client'

/** A leaderboard entry - someone who found the hidden links. */
export interface HallOfFameEntry {
  id: number
  name: string
  handle: string | null
  message: string | null
  linksFound: number
  createdAt: string
}

/** Newest finders first. Returns [] when the DB isn't configured yet. */
export async function getHallOfFame(limit = 100): Promise<HallOfFameEntry[]> {
  if (!sql) return []
  try {
    const rows = (await sql`
      SELECT id, name, handle, message, links_found, created_at
      FROM hall_of_fame
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[]
    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      handle: r.handle == null ? null : String(r.handle),
      message: r.message == null ? null : String(r.message),
      linksFound: Number(r.links_found),
      createdAt: (r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)),
    }))
  } catch {
    return [] // never crash the page on a DB hiccup
  }
}

/** Add a finder to the leaderboard. Returns false if the DB isn't configured. */
export async function addHallOfFameEntry(input: {
  name: string
  handle?: string | null
  message?: string | null
  linksFound?: number
}): Promise<boolean> {
  if (!sql) return false
  await sql`
    INSERT INTO hall_of_fame (name, handle, message, links_found)
    VALUES (
      ${input.name},
      ${input.handle ?? null},
      ${input.message ?? null},
      ${input.linksFound ?? 0}
    )
  `
  return true
}

export { isDbConfigured }
