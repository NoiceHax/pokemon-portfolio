import crypto from 'crypto'
import { cookies } from 'next/headers'

/**
 * Admin authentication - password + TOTP 2FA, backed by an HMAC-signed session cookie.
 * No external dependencies (pure Node crypto). Server-only.
 *
 * Env:
 *   ADMIN_PASSWORD  - the login password (compared in constant time).
 *   TOTP_SECRET     - base32 secret shared with your authenticator app.
 *   SESSION_SECRET  - random 32+ char string used to sign the session cookie.
 */

export const SESSION_COOKIE = 'tc_admin'
const SESSION_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.TOTP_SECRET && process.env.SESSION_SECRET,
  )
}

// ---- constant-time compare -------------------------------------------------
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // Still do a compare to keep timing uniform, but result is false.
    crypto.timingSafeEqual(ab, ab)
    return false
  }
  return crypto.timingSafeEqual(ab, bb)
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(input, expected)
}

// ---- TOTP (RFC 6238, SHA-1, 6 digits, 30s step) ----------------------------
function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/\s/g, '')
  let bits = ''
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch)
    if (idx === -1) continue
    bits += idx.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest()
  const offset = hmac[hmac.length - 1]! & 0xf
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff)
  return (code % 1_000_000).toString().padStart(6, '0')
}

/** Verify a 6-digit TOTP code, allowing ±1 time step for clock drift. */
export function checkTotp(token: string): boolean {
  const secretB32 = process.env.TOTP_SECRET
  if (!secretB32) return false
  const clean = token.replace(/\s/g, '')
  if (!/^\d{6}$/.test(clean)) return false
  const secret = base32Decode(secretB32)
  const step = Math.floor(Date.now() / 1000 / 30)
  for (let w = -1; w <= 1; w++) {
    if (safeEqual(clean, hotp(secret, step + w))) return true
  }
  return false
}

// ---- signed session cookie -------------------------------------------------
function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET as string
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function makeToken(): string {
  const exp = Date.now() + SESSION_TTL_MS
  const payload = `admin.${exp}`
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !process.env.SESSION_SECRET) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [role, expStr, mac] = parts as [string, string, string]
  const payload = `${role}.${expStr}`
  if (!safeEqual(mac, sign(payload))) return false // tampered / wrong secret
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false // expired
  return role === 'admin'
}

/** Set the signed session cookie (HttpOnly, Secure, SameSite=Strict). */
export function setSessionCookie(): void {
  cookies().set(SESSION_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE)
}

/** True if the current request carries a valid admin session. */
export function hasValidSession(): boolean {
  return verifyToken(cookies().get(SESSION_COOKIE)?.value)
}
