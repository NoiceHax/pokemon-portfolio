#!/usr/bin/env node
/**
 * Build (optionally), serve, and screenshot the site — one command, no manual setup.
 *
 * Why this exists: verifying a visual change meant hand-running `next build`, starting a
 * server on a free port, driving a browser, and cleaning up the process afterwards. Every
 * step is easy to get subtly wrong (a stale build, a port left listening, a screenshot
 * taken before fonts load), and a half-finished run leaves a server holding a port.
 *
 * Usage:
 *   node scripts/screenshot.mjs                        # build + shoot every route, desktop
 *   node scripts/screenshot.mjs --no-build             # reuse the existing .next
 *   node scripts/screenshot.mjs --dev                  # drive `next dev` instead of a prod build
 *   node scripts/screenshot.mjs --routes /home,/privacy
 *   node scripts/screenshot.mjs --viewport mobile      # desktop | tablet | mobile | all
 *   node scripts/screenshot.mjs --full                 # full-page instead of viewport-height
 *   node scripts/screenshot.mjs --out shots/before     # output directory
 *   node scripts/screenshot.mjs --boot                 # let the boot animation play out on /
 *   node scripts/screenshot.mjs --dark                 # emulate prefers-color-scheme: dark
 *
 * Exits non-zero if any route fails to load or logs a page error, so it doubles as a smoke
 * test in CI.
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'

const ROOT = process.cwd()

/** Routes worth a picture by default: every distinct layout in the app. */
const DEFAULT_ROUTES = [
  '/',
  '/home',
  '/home/pokedex',
  '/home/pokedex/aasrah',
  '/home/experience',
  '/home/journal',
  '/home/pokemon-center',
  '/hall-of-fame',
  '/privacy',
  '/adventure',
]

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180, hasTouch: true, isMobile: true },
  mobile: { width: 390, height: 844, hasTouch: true, isMobile: true },
}

/**
 * Undo MSYS/Git-Bash path mangling.
 *
 * Git Bash on Windows rewrites an argument that looks like a POSIX path before Node ever
 * sees it, so `--routes /home` arrives as `C:/Program Files/Git/home`. Without this, the
 * single most useful route in this app silently becomes an invalid URL. We strip any
 * absolute prefix ending in `/Git` and put the leading slash back.
 */
function unmangleRoute(raw) {
  const r = raw.trim()
  if (r.startsWith('/')) return r
  const m = r.match(/^[A-Za-z]:[\\/].*?[\\/]Git(?:[\\/](.*))?$/)
  if (m) return '/' + (m[1] ?? '').replace(/\\/g, '/')
  // A bare `home` or `home/pokedex` (mangling can also drop the prefix entirely).
  if (/^[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/.test(r)) return '/' + r
  return r
}

function parseArgs(argv) {
  const opts = {
    build: true,
    dev: false,
    routes: DEFAULT_ROUTES,
    viewports: ['desktop'],
    full: false,
    out: 'screenshots',
    boot: false,
    dark: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    if (a === '--no-build') opts.build = false
    else if (a === '--dev') { opts.dev = true; opts.build = false }
    else if (a === '--full') opts.full = true
    else if (a === '--boot') opts.boot = true
    else if (a === '--dark') opts.dark = true
    else if (a === '--routes')
      opts.routes = next().split(',').map(unmangleRoute).filter(Boolean)
    else if (a === '--out') opts.out = next()
    else if (a === '--viewport') {
      const v = next()
      opts.viewports = v === 'all' ? Object.keys(VIEWPORTS) : v.split(',').map((s) => s.trim())
    } else if (a === '--help' || a === '-h') {
      console.log(readHelp())
      process.exit(0)
    } else {
      console.error(`Unknown flag: ${a}\n\n${readHelp()}`)
      process.exit(2)
    }
  }
  const bad = opts.viewports.filter((v) => !VIEWPORTS[v])
  if (bad.length) {
    console.error(`Unknown viewport(s): ${bad.join(', ')}. Choose from ${Object.keys(VIEWPORTS).join(', ')}, or "all".`)
    process.exit(2)
  }
  return opts
}

function readHelp() {
  return `Usage: node scripts/screenshot.mjs [options]

  --no-build            Reuse the existing .next build
  --dev                 Drive \`next dev\` instead of a production build
  --routes a,b,c        Comma-separated routes (default: every distinct layout)
  --viewport NAME       desktop | tablet | mobile | all  (default: desktop)
  --full                Capture the full scrollable page, not just the viewport
  --out DIR             Output directory (default: screenshots)
  --boot                Let the boot animation finish on / instead of skipping it
  --dark                Emulate prefers-color-scheme: dark
`
}

/** An OS-assigned free port, so parallel runs never collide. */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

function run(cmd, args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      shell: process.platform === 'win32',
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    let tail = ''
    if (quiet) {
      const keep = (chunk) => { tail = (tail + chunk).slice(-4000) }
      child.stdout.on('data', keep)
      child.stderr.on('data', keep)
    }
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}\n${tail}`)),
    )
  })
}

/** Start the server and resolve once it answers, so we never shoot a cold page. */
async function startServer({ dev, port }) {
  const args = dev ? ['next', 'dev', '-p', String(port)] : ['next', 'start', '-p', String(port)]
  const child = spawn('npx', args, {
    cwd: ROOT,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let log = ''
  child.stdout.on('data', (c) => { log += c })
  child.stderr.on('data', (c) => { log += c })

  const base = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Server exited early (${child.exitCode}):\n${log}`)
    try {
      const res = await fetch(base, { signal: AbortSignal.timeout(3000) })
      if (res.status < 500) return { child, base }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`Server did not become ready within 120s:\n${log}`)
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => resolve()
    child.once('exit', done)
    // On Windows a detached `next` survives SIGTERM; taskkill takes the whole tree.
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
    setTimeout(() => { try { child.kill('SIGKILL') } catch {} resolve() }, 5000)
  })
}

/** Pick a browser Playwright can actually drive — playwright-core ships no binaries. */
async function launchBrowser() {
  const attempts = [{ channel: 'msedge' }, { channel: 'chrome' }, {}]
  const errors = []
  for (const opts of attempts) {
    try {
      return await chromium.launch({ ...opts, args: ['--hide-scrollbars'] })
    } catch (err) {
      errors.push(`${opts.channel ?? 'bundled chromium'}: ${err.message.split('\n')[0]}`)
    }
  }
  throw new Error(
    `Could not launch a browser. playwright-core has no bundled binary, so it needs an ` +
      `installed Chrome or Edge.\nTried:\n  ${errors.join('\n  ')}`,
  )
}

const slug = (route) => (route === '/' ? 'root' : route.replace(/^\//, '').replace(/\//g, '-'))

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  if (opts.build) {
    console.log('› building (next build)…')
    await run('npx', ['next', 'build'], { quiet: true })
  } else if (!opts.dev && !existsSync(path.join(ROOT, '.next'))) {
    console.error('No .next directory found. Run without --no-build, or use --dev.')
    process.exit(2)
  }

  const outDir = path.resolve(ROOT, opts.out)
  await mkdir(outDir, { recursive: true })
  // Clear only our own PNGs, so an --out pointing at a real directory can't nuke it.
  for (const f of await readdir(outDir).catch(() => [])) {
    if (f.endsWith('.png')) await rm(path.join(outDir, f), { force: true })
  }

  const port = await freePort()
  console.log(`› starting ${opts.dev ? 'next dev' : 'next start'} on :${port}…`)
  const { child, base } = await startServer({ dev: opts.dev, port })

  const failures = []
  const written = []
  let browser

  try {
    browser = await launchBrowser()

    for (const vp of opts.viewports) {
      const { width, height, ...rest } = VIEWPORTS[vp]
      const context = await browser.newContext({
        viewport: { width, height },
        ...rest,
        colorScheme: opts.dark ? 'dark' : 'light',
        // Skipping the intro is the default: otherwise every shot of `/` is a black screen
        // mid-animation. --boot opts back in.
        reducedMotion: opts.boot ? 'no-preference' : 'reduce',
      })

      for (const route of opts.routes) {
        const page = await context.newPage()
        const pageErrors = []
        page.on('pageerror', (e) => pageErrors.push(String(e).split('\n')[0]))

        const label = `${route} [${vp}]`
        try {
          const res = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60_000 })
          const status = res?.status() ?? 0
          if (status >= 400) failures.push(`${label} → HTTP ${status}`)

          // Fonts settle after networkidle; an unsettled pixel font makes every diff noisy.
          await page.evaluate(() => document.fonts?.ready).catch(() => {})
          if (opts.boot && route === '/') await page.waitForTimeout(6000)
          await page.waitForTimeout(600)

          const file = path.join(outDir, `${slug(route)}--${vp}.png`)
          await page.screenshot({ path: file, fullPage: opts.full })
          written.push(path.relative(ROOT, file))

          const flag = pageErrors.length ? ` ⚠ ${pageErrors.length} JS error(s)` : ''
          if (pageErrors.length) failures.push(`${label} → ${pageErrors[0]}`)
          console.log(`  ${String(status).padEnd(3)} ${label}${flag}`)
        } catch (err) {
          failures.push(`${label} → ${err.message.split('\n')[0]}`)
          console.log(`  ERR ${label}`)
        } finally {
          await page.close()
        }
      }
      await context.close()
    }

    await writeFile(
      path.join(outDir, 'index.html'),
      buildGallery(written.map((f) => path.basename(f))),
      'utf8',
    )
  } finally {
    if (browser) await browser.close().catch(() => {})
    await stopServer(child)
  }

  console.log(`\n› ${written.length} screenshot(s) in ${path.relative(ROOT, outDir) || '.'}`)
  console.log(`› gallery: ${path.join(path.relative(ROOT, outDir), 'index.html')}`)
  if (failures.length) {
    console.error(`\n${failures.length} problem(s):`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

/** A plain contact sheet, so a run is reviewable in one browser tab. */
function buildGallery(files) {
  const cards = files
    .map(
      (f) => `  <figure>
    <a href="${f}" target="_blank" rel="noreferrer"><img src="${f}" alt="${f}" loading="lazy"></a>
    <figcaption>${f.replace(/\.png$/, '')}</figcaption>
  </figure>`,
    )
    .join('\n')
  return `<!doctype html>
<meta charset="utf-8">
<title>Screenshots</title>
<style>
  body { margin: 0; padding: 24px; background: #14161a; color: #e8e6e3;
         font: 14px/1.5 ui-monospace, monospace; }
  h1 { font-size: 15px; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
  .grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  figure { margin: 0; }
  img { width: 100%; display: block; border: 1px solid #2c3038; border-radius: 8px; background: #fff; }
  figcaption { margin-top: 6px; font-size: 12px; opacity: .65; word-break: break-all; }
</style>
<h1>${files.length} screenshot${files.length === 1 ? '' : 's'}</h1>
<div class="grid">
${cards}
</div>
`
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
