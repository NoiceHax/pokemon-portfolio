import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Contact form → email. Delivers "Send Transmission" submissions to Chandan's inbox via
 * SMTP (Gmail app password recommended). Secrets stay server-side; the visitor's address
 * is set as Reply-To so replying goes straight back to them.
 *
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Optional CONTACT_TO overrides the
 * destination (defaults to chandanp24107@gmail.com). Returns 503 until configured.
 */

export const dynamic = 'force-dynamic'

const CONTACT_TO = process.env.CONTACT_TO ?? 'chandanp24107@gmail.com'

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(4000),
})

function isConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function POST(request: Request) {
  // 5 messages / 10 min per IP.
  const rl = await rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  if (!isConfigured()) {
    return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }
  const { name, email, message } = parsed.data

  const port = Number(process.env.SMTP_PORT ?? 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
  })

  try {
    // Fail fast with a clear reason if credentials/host are wrong, rather than
    // surfacing an opaque send-time error later.
    await transporter.verify()
    await transporter.sendMail({
      from: `"Trainer Portfolio" <${process.env.SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: `"${name}" <${email}>`,
      subject: `New transmission from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
             <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    // Log the real SMTP failure server-side (auth / TLS / connection) so a 502
    // is diagnosable instead of opaque.
    console.error('[contact] sendMail failed:', err)
    const code = (err as { code?: string; responseCode?: number } | null)?.code
    const responseCode = (err as { responseCode?: number } | null)?.responseCode
    const isAuth = code === 'EAUTH' || responseCode === 535
    return NextResponse.json(
      {
        error: isAuth
          ? 'Email service authentication failed. Please try another channel for now.'
          : 'Could not send right now. Please try again later.',
      },
      { status: 502 },
    )
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
