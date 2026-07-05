'use client'

import { useState } from 'react'

/**
 * Small "add yourself to the Hall of Fame" form. Anyone who found the hidden links can
 * leave their name (+ optional handle/message) on the leaderboard. Posts to
 * /api/hall-of-fame and refreshes the page so the new entry appears at the top.
 */
export function HallOfFameForm() {
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('saving')
    setError(null)
    try {
      const res = await fetch('/api/hall-of-fame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, handle, message }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Could not save. Try again.')
      }
      setStatus('done')
      setName('')
      setHandle('')
      setMessage('')
      // Show the fresh entry (server component re-reads the DB).
      setTimeout(() => window.location.reload(), 700)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const inputClass =
    'w-full rounded-md border border-surface/25 bg-white/5 px-3 py-2.5 font-mono text-sm text-surface placeholder:text-surface/40 focus:border-amber-300 focus:outline-none'

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 text-left">
      <p className="font-display text-sm text-amber-300">Sign the wall</p>
      <p className="font-mono text-xs text-surface/60">
        Found the hidden links? Leave your mark on the leaderboard.
      </p>
      <input
        className={inputClass}
        placeholder="Name *"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className={inputClass}
        placeholder="@handle or site (optional)"
        value={handle}
        maxLength={60}
        onChange={(e) => setHandle(e.target.value)}
      />
      <textarea
        className={`${inputClass} resize-none`}
        placeholder="A short message (optional)"
        rows={3}
        value={message}
        maxLength={160}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        type="submit"
        disabled={status === 'saving' || !name.trim()}
        className="min-h-11 rounded-md border border-amber-300 px-3 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-amber-300 transition-colors hover:bg-amber-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'saving' ? 'Saving…' : status === 'done' ? 'Added! ✓' : 'Add me'}
      </button>
      {error ? <p className="font-mono text-xs text-red-300">{error}</p> : null}
    </form>
  )
}
