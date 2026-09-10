import { NextResponse } from 'next/server'
import { getVisits, incrementVisits } from '@/lib/db/counters'

/**
 * Visit counter.
 * - GET  → current total.
 * - POST → increment once (client calls this only on a browser's first-ever visit,
 *          gated by localStorage).
 *
 * Deliberately NOT rate-limited by IP. The previous 3-per-hour-per-IP cap silently
 * undercounted anyone behind CGNAT, where hundreds of real people share one public
 * address: the 4th visitor in an hour got a 429 and was never counted. Since the
 * counter is a public vanity number rather than analytics, an accurate count for real
 * visitors is worth more than resistance to someone deliberately inflating it - and
 * anyone who wants to inflate it can just clear localStorage and reload either way.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ visits: await getVisits() })
}

export async function POST() {
  return NextResponse.json({ visits: await incrementVisits() })
}
