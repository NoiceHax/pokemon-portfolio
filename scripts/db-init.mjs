/**
 * Applies src/lib/db/schema.sql to the Neon database in DATABASE_URL. Idempotent
 * (CREATE TABLE IF NOT EXISTS). Run: node scripts/db-init.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

// Minimal .env loader (strips quotes) so this works without dotenv.
for (const f of ['.env.local', '.env']) {
  const p = new URL('../' + f, import.meta.url)
  if (!existsSync(p)) continue
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env / your shell and retry.')
  process.exit(1)
}
const sql = neon(url)
const ddl = readFileSync(new URL('../src/lib/db/schema.sql', import.meta.url), 'utf8')

// Strip full-line comments first, then split on ';' and run each statement.
const withoutComments = ddl
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
const statements = withoutComments
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

for (const stmt of statements) {
  await sql.query(stmt)
  console.log('ok:', stmt.split('\n')[0].slice(0, 70))
}
console.log('\nSchema applied.')
