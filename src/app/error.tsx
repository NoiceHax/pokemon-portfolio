'use client'

import { useEffect } from 'react'

/**
 * Route-level error boundary. Fails gracefully with a friendly, on-brand message and a
 * recovery action (CLAUDE.md: never crash the interface; provide meaningful errors).
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-surface px-6 text-center">
      <div>
        <p className="font-display text-2xl text-poke-red">A wild error appeared!</p>
        <p className="mt-3 font-mono text-sm text-ink-soft">
          Something went wrong on this screen. Your progress is safe.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-poke-red px-4 py-2 font-display text-xs text-white hover:bg-poke-red-dark"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
