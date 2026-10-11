import { NextResponse } from 'next/server'
import { advanceRun } from '@/lib/db'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'
import { isOver, openRun, publicRun, sealRun, type RunState } from './game'
import { isWtpConfigured } from './token'

/** Shared plumbing for the /api/wtp/* move endpoints (round, hint, guess). */

export function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Rate-limit, parse the JSON body and open its run token. Returns the run and body, or a
 * Response to send back as-is.
 */
export async function readMove(
  request: Request,
  route: string,
  { allowNew = false } = {},
): Promise<{ run: RunState | null; body: Record<string, unknown> } | Response> {
  if (!isWtpConfigured()) return error("Who's That Pokémon? isn't configured yet.", 503)
  // A fast player makes ~3 requests a round; this is generous for people, not scripts.
  const rl = await rateLimit(`wtp:${route}:${clientIp(request)}`, { limit: 90, windowMs: 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    return error('Invalid JSON.', 400)
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return error('Invalid request.', 400)
  }
  const body = parsed as Record<string, unknown>
  if (body.token == null && allowNew) return { run: null, body }
  const run = openRun(body.token)
  if (!run) return error('Invalid game token.', 400)
  if (isOver(run)) return error('This run is over. Start a new one.', 409)
  return { run, body }
}

/**
 * Record the move (fromSeq → run.seq), then reply with the new token and public state.
 * `extra` may be a function of the new token, for fields that point back at it.
 */
export async function commit(
  run: RunState,
  fromSeq: number,
  extra: object | ((token: string) => object),
) {
  // A DB hiccup fails open (like rateLimit): the game keeps working, the replay check skips.
  const ok = await advanceRun(run.runId, fromSeq, run.seq).catch(() => true)
  if (!ok) return error('That game token was already used. Start a new run.', 409)
  const token = sealRun(run)
  const fields = typeof extra === 'function' ? extra(token) : extra
  return NextResponse.json({ token, run: publicRun(run), ...fields })
}
