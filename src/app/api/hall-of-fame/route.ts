import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addHallOfFameEntry, getHallOfFame, isDbConfigured } from '@/lib/db'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Hall of Fame leaderboard API.
 * - GET  → recent finders (newest first).
 * - POST → add a finder (validated). Requires DATABASE_URL to be configured.
 */

export const dynamic = 'force-dynamic' // always read fresh from the DB

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(40),
  handle: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().max(160).optional().or(z.literal('')),
  linksFound: z.number().int().min(0).max(50).optional(),
})

export async function GET() {
  const entries = await getHallOfFame()
  return NextResponse.json({ entries, configured: isDbConfigured })
}

export async function POST(request: Request) {
  // 5 sign-ins / 10 min per IP.
  const rl = await rateLimit(`hof:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  if (!isDbConfigured) {
    return NextResponse.json(
      { error: 'Leaderboard is not configured yet.' },
      { status: 503 },
    )
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const parsed = submissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }
  const { name, handle, message, linksFound } = parsed.data
  await addHallOfFameEntry({
    name,
    handle: handle || null,
    message: message || null,
    linksFound: linksFound ?? 0,
  })
  return NextResponse.json({ ok: true }, { status: 201 })
}
