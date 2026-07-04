'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Contact form ("Send Transmission"). Client-side validated, then POSTed to
 * /api/contact which emails the submission to Chandan via SMTP. Kept accessible:
 * labelled fields, inline errors tied via aria-describedby.
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(values.email)) next.email = 'Please enter a valid email.'
    if (values.message.trim().length < 10)
      next.message = 'Message should be at least 10 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Could not send. Try again.')
      }
      setSent(true)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-poke-red/40 bg-poke-red/5 p-6 text-center">
        <p className="font-display text-lg font-bold text-poke-red">Transmission sent!</p>
        <p className="mt-2 font-mono text-sm text-ink-soft">
          Thanks, {values.name || 'trainer'} - your message is on its way to Chandan. He&apos;ll
          reply to {values.email}.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        id="name"
        label="Trainer Name"
        value={values.name}
        error={errors.name}
        onChange={(v) => setValues((s) => ({ ...s, name: v }))}
      />
      <Field
        id="email"
        label="Frequency (Email)"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(v) => setValues((s) => ({ ...s, email: v }))}
      />
      <div>
        <label
          htmlFor="message"
          className="font-mono text-xs uppercase tracking-wide text-poke-red"
        >
          Transmission Data
        </label>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          onChange={(e) => setValues((s) => ({ ...s, message: e.target.value }))}
          className="mt-1 w-full rounded-md border border-edge bg-surface-raised px-3 py-2 font-mono text-sm text-ink focus:border-poke-red focus:outline-none focus:ring-1 focus:ring-poke-red"
          placeholder="Enter your message here..."
        />
        {errors.message ? (
          <p id="message-error" className="mt-1 font-mono text-xs text-poke-red">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center gap-2 rounded-md bg-poke-red px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-poke-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send aria-hidden className="h-4 w-4" />
        {sending ? 'Transmitting…' : 'Transmit Data'}
      </button>
      {sendError ? (
        <p role="alert" className="font-mono text-xs text-poke-red">
          {sendError}
        </p>
      ) : null}
    </form>
  )
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wide text-poke-red">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-edge bg-surface-raised px-3 py-2 font-mono text-sm text-ink focus:border-poke-red focus:outline-none focus:ring-1 focus:ring-poke-red"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 font-mono text-xs text-poke-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}
