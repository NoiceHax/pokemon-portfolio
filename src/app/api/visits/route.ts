import { NextResponse } from 'next/server'
import { getVisits, incrementVisits } from '@/lib/db/counters'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Visit counter.
 * - GET  → current total.
 * - POST → increment once (client calls this only on a browser's first-ever visit,
 *          gated by localStorage). Rate-limited so it can't be spammed.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ visits: await getVisits() })
}

export async function POST(request: Request) {
  // At most a few counts per IP per hour (defends the counter from inflation).
  const rl = await rateLimit(`visits:${clientIp(request)}`, { limit: 3, windowMs: 60 * 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)
  return NextResponse.json({ visits: await incrementVisits() })
}
