import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getWtpLeaderboard, isDbConfigured, submitWtpScore } from '@/lib/db'
import { openRun, plausiblePace } from '@/lib/wtp/game'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Who's That Pokémon? leaderboard.
 * - GET  → top 10 scores.
 * - POST { token, name } → submit the run in the token. Ends the run; once per run.
 */

export const dynamic = 'force-dynamic'

const submissionSchema = z.object({
  token: z.string().min(1).max(4096),
  name: z.string().trim().min(1).max(24),
})

export async function GET() {
  const entries = await getWtpLeaderboard()
  return NextResponse.json({ entries, configured: isDbConfigured })
}

export async function POST(request: Request) {
  const rl = await rateLimit(`wtp:lb:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'Leaderboard is not configured yet.' }, { status: 503 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const parsed = submissionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  const run = openRun(parsed.data.token)
  if (!run) return NextResponse.json({ error: 'Invalid game token.' }, { status: 400 })
  if (run.correct < 1) {
    return NextResponse.json({ error: 'Guess at least one Pokémon first.' }, { status: 400 })
  }
  if (!plausiblePace(run)) {
    return NextResponse.json({ error: 'That run was too fast to count.' }, { status: 422 })
  }
  let ok: boolean
  try {
    ok = await submitWtpScore({
      runId: run.runId,
      seq: run.seq,
      name: parsed.data.name,
      score: run.score,
      bestStreak: run.bestStreak,
      correct: run.correct,
    })
  } catch {
    return NextResponse.json({ error: 'Could not save the score. Try again.' }, { status: 500 })
  }
  if (!ok) {
    return NextResponse.json({ error: 'This run was already submitted.' }, { status: 409 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
