import { sql, isDbConfigured } from './client'

/**
 * Who's That Pokémon? persistence: run sequence checks and the leaderboard.
 *
 * Every game move turns run token `seq = n` into `seq = n + 1`. `advanceRun` is a
 * compare-and-swap on that number, so a token the client already spent (an older copy kept
 * to re-roll a round or shed a hint) is rejected. Without a database there's nothing to
 * check against, so it allows the move - the leaderboard is off then anyway.
 */

export async function advanceRun(runId: string, fromSeq: number, toSeq: number): Promise<boolean> {
  if (!sql) return true
  if (fromSeq === 0) {
    void sql`DELETE FROM wtp_runs WHERE updated_at < now() - interval '2 days'`.catch(() => {})
    const rows = (await sql`
      INSERT INTO wtp_runs (run_id, seq) VALUES (${runId}, ${toSeq})
      ON CONFLICT (run_id) DO NOTHING
      RETURNING 1
    `) as unknown[]
    return rows.length === 1
  }
  const rows = (await sql`
    UPDATE wtp_runs SET seq = ${toSeq}, updated_at = now()
    WHERE run_id = ${runId} AND seq = ${fromSeq} AND NOT ended
    RETURNING 1
  `) as unknown[]
  return rows.length === 1
}

export interface WtpLeaderboardEntry {
  name: string
  score: number
  bestStreak: number
  correct: number
  createdAt: string
}

/** Highest scores first. Returns [] when the DB isn't configured or on a hiccup. */
export async function getWtpLeaderboard(limit = 10): Promise<WtpLeaderboardEntry[]> {
  if (!sql) return []
  try {
    const rows = (await sql`
      SELECT name, score, best_streak, correct, created_at
      FROM wtp_leaderboard
      ORDER BY score DESC, created_at ASC
      LIMIT ${limit}
    `) as Record<string, unknown>[]
    return rows.map((r) => ({
      name: String(r.name),
      score: Number(r.score),
      bestStreak: Number(r.best_streak),
      correct: Number(r.correct),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }))
  } catch {
    return []
  }
}

/**
 * End the run at `seq` and record its score. Returns false if the run was already ended,
 * has moved on, or the DB isn't configured.
 */
export async function submitWtpScore(input: {
  runId: string
  seq: number
  name: string
  score: number
  bestStreak: number
  correct: number
}): Promise<boolean> {
  if (!sql) return false
  const ended = (await sql`
    UPDATE wtp_runs SET ended = true, updated_at = now()
    WHERE run_id = ${input.runId} AND seq = ${input.seq} AND NOT ended
    RETURNING 1
  `) as unknown[]
  if (ended.length !== 1) return false
  await sql`
    INSERT INTO wtp_leaderboard (run_id, name, score, best_streak, correct)
    VALUES (${input.runId}, ${input.name}, ${input.score}, ${input.bestStreak}, ${input.correct})
    ON CONFLICT (run_id) DO NOTHING
  `
  return true
}

export { isDbConfigured }
