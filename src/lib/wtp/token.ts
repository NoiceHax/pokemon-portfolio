import crypto from 'crypto'

/**
 * Signed (and optionally encrypted) tokens for Who's That Pokémon. The run token holds the
 * whole run - score, used ids and the current answer - so it lives with the client, but it
 * can't be read for the answer or edited without the server noticing: the payload is JSON,
 * AES-256-GCM sealed when `encrypt` is set, then HMAC-signed. Server-only.
 *
 * Env: WTP_SECRET - random 32+ char string. In development a fixed fallback is used so the
 * game works out of the box; in production the game is off without it.
 */

const DEV_SECRET = 'wtp-dev-secret-not-for-production'

function secret(): string | null {
  const s = process.env.WTP_SECRET
  if (s) return s
  return process.env.NODE_ENV === 'production' ? null : DEV_SECRET
}

export function isWtpConfigured(): boolean {
  return secret() !== null
}

function key(purpose: string): Buffer {
  return crypto
    .createHmac('sha256', secret() ?? '')
    .update(purpose)
    .digest()
}

function sign(data: string): string {
  return crypto.createHmac('sha256', key('sign')).update(data).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

/** Serialize + sign. With `encrypt`, the payload is AES-256-GCM sealed first. */
export function seal(payload: object, { encrypt = false } = {}): string {
  let body = Buffer.from(JSON.stringify(payload))
  if (encrypt) {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key('encrypt'), iv)
    body = Buffer.concat([iv, cipher.update(body), cipher.final(), cipher.getAuthTag()])
  }
  const data = (encrypt ? 'e.' : 'p.') + body.toString('base64url')
  return `${data}.${sign(data)}`
}

/** Verify + parse. Returns null for anything tampered, malformed or unsigned. */
export function open<T>(token: unknown): T | null {
  if (typeof token !== 'string' || token.length > 4096 || !secret()) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [mode, body, sig] = parts as [string, string, string]
  const data = `${mode}.${body}`
  if (!safeEqual(sig, sign(data))) return null
  try {
    let raw = Buffer.from(body, 'base64url')
    if (mode === 'e') {
      const iv = raw.subarray(0, 12)
      const tag = raw.subarray(raw.length - 16)
      const decipher = crypto.createDecipheriv('aes-256-gcm', key('encrypt'), iv)
      decipher.setAuthTag(tag)
      raw = Buffer.concat([decipher.update(raw.subarray(12, raw.length - 16)), decipher.final()])
    } else if (mode !== 'p') {
      return null
    }
    return JSON.parse(raw.toString('utf8')) as T
  } catch {
    return null
  }
}

export function randomId(): string {
  return crypto.randomBytes(9).toString('base64url')
}
