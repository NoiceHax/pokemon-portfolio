/**
 * One-shot helper to mint a SPOTIFY_REFRESH_TOKEN for the "Now Playing" widget.
 *
 *   node scripts/gen-spotify-token.mjs
 *
 * Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from .env (or .env.local), runs the
 * authorization-code flow against a throwaway loopback server, and prints the refresh
 * token to paste back into .env.
 *
 * Before running, add this exact redirect URI to your app at
 * https://developer.spotify.com/dashboard -> your app -> Settings -> Redirect URIs:
 *
 *   http://127.0.0.1:8888/callback
 *
 * Spotify rejects `localhost` for loopback redirects — it must be the 127.0.0.1 form.
 */

import fs from 'node:fs'
import http from 'node:http'
import crypto from 'node:crypto'

const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const PORT = 8888
const SCOPES = 'user-read-currently-playing user-read-recently-played'

function readEnvFile() {
  const env = {}
  for (const file of ['.env', '.env.local']) {
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
  return env
}

const env = readEnvFile()
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || env.SPOTIFY_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in .env or .env.local.')
  process.exit(1)
}

const state = crypto.randomBytes(16).toString('hex')
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    show_dialog: 'true',
  })

async function exchange(code) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${body}`)
  return JSON.parse(body)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end('Not found')
    return
  }

  const err = url.searchParams.get('error')
  const code = url.searchParams.get('code')

  if (err || !code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Authorization failed: ${err ?? 'no code'}`)
    console.error(`\nAuthorization failed: ${err ?? 'no code returned'}`)
    server.close()
    process.exit(1)
  }
  if (url.searchParams.get('state') !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('State mismatch.')
    console.error('\nState mismatch — aborting.')
    server.close()
    process.exit(1)
  }

  try {
    const token = await exchange(code)
    res
      .writeHead(200, { 'Content-Type': 'text/plain' })
      .end('Done. Refresh token printed in your terminal — you can close this tab.')

    console.log('\nGranted scopes:', token.scope)
    console.log('\nPaste this into .env:\n')
    console.log(`SPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n`)
    console.log('Then restart the dev server (env vars are read at boot).')
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(e.message))
    console.error(`\n${e.message}`)
    server.close()
    process.exit(1)
  }
  server.close()
  process.exit(0)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on ${REDIRECT_URI}`)
  console.log('\nOpen this URL in the browser logged into the Spotify account you want to show:\n')
  console.log(authUrl + '\n')
})
