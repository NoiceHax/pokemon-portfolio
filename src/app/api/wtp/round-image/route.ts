import { readFile } from 'fs/promises'
import crypto from 'crypto'
import sharp from 'sharp'
import { getPokemon, silhouetteFile } from '@/lib/wtp/data'
import { openRun } from '@/lib/wtp/game'
import { error } from '@/lib/wtp/http'
import { isWtpConfigured } from '@/lib/wtp/token'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * GET ?t=<run token> → the current round's silhouette. The answer comes from the token, so
 * the URL is new every round, and each response is re-encoded with a random transparent
 * margin and quality so the bytes never repeat either: neither the URL nor a byte hash of
 * the image can be looked up in a table built from earlier runs.
 */

export const dynamic = 'force-dynamic'

const MAX_PAD = 4

export async function GET(request: Request) {
  if (!isWtpConfigured()) return error("Who's That Pokémon? isn't configured yet.", 503)
  const rl = await rateLimit(`wtp:image:${clientIp(request)}`, { limit: 90, windowMs: 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  const run = openRun(new URL(request.url).searchParams.get('t'))
  if (!run) return error('Invalid game token.', 400)
  const p = run.current ? getPokemon(run.current.id) : undefined
  if (!p) return error('No round in progress.', 409)

  let source: Buffer
  try {
    source = await readFile(silhouetteFile(p))
  } catch {
    return error('Silhouette not found.', 404)
  }
  const pad = () => crypto.randomInt(MAX_PAD + 1)
  const image = await sharp(source)
    .extend({
      top: pad(),
      bottom: pad(),
      left: pad(),
      right: pad(),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 + crypto.randomInt(11) })
    .toBuffer()

  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'no-store' },
  })
}
