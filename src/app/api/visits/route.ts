import { NextResponse } from 'next/server'
import { getVisits, incrementVisits, storeCloudflareDays } from '@/lib/db/counters'
import { getCloudflareDailyUniques } from '@/lib/analytics/cloudflare'

/**
 * Visit counter.
 * - GET  → current total.
 * - POST → also bump the local DB counter (client calls this only on a browser's
 *          first-ever visit, gated by localStorage).
 *
 * When Cloudflare analytics is configured (CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID) the
 * total shown is Cloudflare's unique-visitor count, which sees every visitor rather than
 * only browsers that rendered the /home sidebar. The DB counter keeps incrementing either
 * way and is the fallback whenever Cloudflare is unconfigured or unreachable.
 *
 * Deliberately NOT rate-limited by IP: the previous 3-per-hour-per-IP cap undercounted
 * anyone behind CGNAT. It's a public vanity number, not analytics.
 */
export const dynamic = 'force-dynamic'

async function total(dbCount: number): Promise<number> {
  const days = await getCloudflareDailyUniques()
  if (days === null) return dbCount
  return Math.max(await storeCloudflareDays(days), dbCount)
}

export async function GET() {
  return NextResponse.json({ visits: await total(await getVisits()) })
}

export async function POST() {
  return NextResponse.json({ visits: await total(await incrementVisits()) })
}
