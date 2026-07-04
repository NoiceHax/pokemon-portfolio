import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  checkPassword,
  checkTotp,
  isAdminConfigured,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/admin/auth'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Admin login: password + TOTP. On success sets a signed HttpOnly session cookie.
 * Aggressively rate-limited (brute-force defense): 5 attempts / 15 min per IP.
 * Responses are deliberately vague ("Invalid credentials") to avoid oracles.
 */

export const dynamic = 'force-dynamic'

const schema = z.object({
  password: z.string().min(1).max(200),
  totp: z.string().min(6).max(8),
})

export async function POST(request: Request) {
  const rl = await rateLimit(`admin-login:${clientIp(request)}`, {
    limit: 5,
    windowMs: 15 * 60_000,
  })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin is not configured.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const passOk = checkPassword(parsed.data.password)
  const totpOk = checkTotp(parsed.data.totp)
  if (!passOk || !totpOk) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  setSessionCookie()
  return NextResponse.json({ ok: true })
}

/** Logout. */
export async function DELETE() {
  clearSessionCookie()
  return NextResponse.json({ ok: true })
}
