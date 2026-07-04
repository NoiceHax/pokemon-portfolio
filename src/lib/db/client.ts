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

export const sql: NeonQueryFunction<false, false> | null = isDbConfigured
  ? neon(process.env.DATABASE_URL as string)
  : null
