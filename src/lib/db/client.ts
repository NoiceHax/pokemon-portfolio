import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

/**
 * Neon (serverless Postgres) connection.
 *
 * The whole DB layer is OPTIONAL: if `DATABASE_URL` is unset (local dev before creds are
 * provided, or a preview build), `sql` is null and every caller falls back to a safe
 * empty/last-known result so the site still builds and runs. Once the env var is set, the
 * leaderboard and blog posts read/write live.
 *
 * Never import this from a Client Component - it's server-only (holds the connection).
 */
export const isDbConfigured = Boolean(process.env.DATABASE_URL)

/**
 * The Neon HTTP driver runs each query through `fetch`. Next.js patches `fetch` and will
 * store the response in its Data Cache — and a per-request cache setting overrides a
 * route's `dynamic = 'force-dynamic'`. Without opting out, reads like the Hall of Fame
 * leaderboard get served a stale (often empty, first-render) result even though the row is
 * in the database (Vercel logs it as "Using cache … /sql"). We force `no-store` so every
 * query hits Postgres live; writes/counters/rate-limits must never be cached anyway.
 */
export const sql: NeonQueryFunction<false, false> | null = isDbConfigured
  ? neon(process.env.DATABASE_URL as string, { fetchOptions: { cache: 'no-store' } })
  : null
