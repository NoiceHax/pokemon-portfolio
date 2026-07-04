import { sql } from '@/lib/db/client'

/**
 * Neon-backed fixed-window rate limiter (durable + shared across serverless instances).
 *
 * Each call buckets by `key` (typically ip+route) into the current time window and does an
 * atomic upsert-increment, returning the running hit count. Over the limit → blocked with
 * a Retry-After. When the DB isn't configured it fails OPEN (no limiting) so local/dev
 * without a DB still works - production always has DATABASE_URL set.
 */

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number
  /** Window length in ms. */
  windowMs: number
}

export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  if (!sql) return { ok: true, remaining: limit, retryAfterSeconds: 0 }

  const now = Date.now()
  const windowStart = now - (now % windowMs)
  try {
    const rows = (await sql`
      INSERT INTO rate_limits (bucket_key, window_start, hits)
      VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT (bucket_key, window_start)
      DO UPDATE SET hits = rate_limits.hits + 1
      RETURNING hits
    `) as { hits: number }[]
    const hits = Number(rows[0]?.hits ?? 1)

    // Opportunistic prune of stale windows (cheap, keeps the table small).
    if (hits === 1) {
      void sql`DELETE FROM rate_limits WHERE window_start < ${windowStart - windowMs * 4}`.catch(
        () => {},
      )
    }

    if (hits > limit) {
      const retryAfterSeconds = Math.ceil((windowStart + windowMs - now) / 1000)
      return { ok: false, remaining: 0, retryAfterSeconds }
    }
    return { ok: true, remaining: Math.max(0, limit - hits), retryAfterSeconds: 0 }
  } catch {
    // DB hiccup: fail open rather than lock everyone out.
    return { ok: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

/** Best-effort client IP from proxy headers (Vercel/most hosts set these). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') ?? '0.0.0.0'
}

/** Build a 429 Response with Retry-After, for use when `rateLimit` returns !ok. */
export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(Math.max(1, retryAfterSeconds)),
    },
  })
}
