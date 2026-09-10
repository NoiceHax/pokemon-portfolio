#!/usr/bin/env node
/**
 * Verify every outbound URL in the content layer actually resolves.
 *
 * A portfolio's credibility rests on the links: a hiring manager clicks through to the
 * code, and a 404 reads as "the project isn't real". Repos also flip private without
 * warning, and a private repo returns exactly the same 404 to a logged-out visitor as a
 * repo that never existed — so this checks anonymously, the way a recruiter sees it.
 *
 * Usage:
 *   node scripts/check-links.mjs           # exits 1 if any link is dead
 *   node scripts/check-links.mjs --quiet   # only print failures
 *
 * Reads the content data directly (no server needed), so it is cheap to run before a
 * deploy or in CI.
 */

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'src', 'content', 'data')
const TIMEOUT_MS = 15_000
const CONCURRENCY = 6

const quiet = process.argv.includes('--quiet')

/**
 * Pull every absolute URL out of the content sources.
 *
 * Deliberately a regex over the source rather than an import: these files are TypeScript
 * with path aliases, so importing them from a plain node script would need a build step,
 * and the point of this check is to be runnable at any moment.
 */
async function collectUrls() {
  const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith('.ts'))
  const found = new Map() // url -> Set<"file:line">

  for (const file of files) {
    const full = path.join(DATA_DIR, file)
    const text = await readFile(full, 'utf8')
    text.split('\n').forEach((line, i) => {
      // Skip commented-out entries: they render nothing, so a dead URL there is inert.
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return
      for (const m of line.matchAll(/https?:\/\/[^\s'"`)]+/g)) {
        const url = m[0].replace(/[.,;]+$/, '')
        if (!found.has(url)) found.set(url, new Set())
        found.get(url).add(`${file}:${i + 1}`)
      }
    })
  }
  return found
}

async function probe(url) {
  // HEAD first (cheap); some hosts answer 403/405 to HEAD, so fall back to GET.
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          // Anonymous, browser-shaped request: no token, so a private repo reads as 404
          // exactly as it would for a visitor.
          'User-Agent': 'Mozilla/5.0 (compatible; portfolio-link-check/1.0)',
          Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        },
      })
      if (res.status === 405 || res.status === 403) {
        if (method === 'HEAD') continue
      }
      // 999 is LinkedIn's anti-scraping response, not a broken link - the page is fine in
      // a browser. Treating it as dead would train the reader to ignore this report.
      const antiBot = res.status === 999 || res.status === 429
      return { status: res.status, ok: res.status < 400 || antiBot, antiBot }
    } catch (err) {
      if (method === 'GET') {
        return { status: 0, ok: false, error: err.name === 'TimeoutError' ? 'timeout' : err.message }
      }
    }
  }
  return { status: 0, ok: false, error: 'unreachable' }
}

/** Run probes with a small pool so we never hammer one host. */
async function mapPool(items, limit, fn) {
  const out = new Array(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++
        out[i] = await fn(items[i], i)
      }
    }),
  )
  return out
}

async function main() {
  const found = await collectUrls()
  const urls = [...found.keys()].sort()
  if (!urls.length) {
    console.log('No URLs found in src/content/data.')
    return
  }

  if (!quiet) console.log(`Checking ${urls.length} unique URL(s)…\n`)
  const results = await mapPool(urls, CONCURRENCY, async (url) => ({ url, ...(await probe(url)) }))

  const dead = results.filter((r) => !r.ok)
  for (const r of results) {
    if (r.ok && quiet) continue
    const code = r.error ? `ERR` : String(r.status)
    const mark = r.ok ? ' ' : '✗'
    const note = r.error ? `  (${r.error})` : r.antiBot ? '  (bot-blocked, not dead)' : ''
    console.log(`${mark} ${code.padEnd(3)} ${r.url}${note}`)
    if (!r.ok) for (const site of found.get(r.url)) console.log(`        ${site}`)
  }

  console.log(`\n${results.length - dead.length}/${results.length} OK`)
  if (dead.length) {
    console.error(
      `\n${dead.length} dead link(s). Note GitHub returns 404 for PRIVATE repos too — ` +
        `to a logged-out visitor those are indistinguishable from a repo that does not exist.`,
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
