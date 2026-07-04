'use client'

import { useEffect } from 'react'

interface SkipControlProps {
  onSkip: () => void
}

/**
 * Skip affordance shown during the animated boot. Never waste the visitor's time
 * (CLAUDE.md) - anyone can bypass the intro immediately.
 *
 * Accessible: a real focusable button, plus Enter/Escape/Space as global shortcuts
 * while the control is mounted.
 */
export function SkipControl({ onSkip }: SkipControlProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSkip])

  return (
    <button
      type="button"
      onClick={onSkip}
      className="absolute bottom-6 right-6 z-20 rounded-full border border-surface/30 bg-black/40 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-surface/80 transition-colors hover:border-surface/60 hover:text-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
    >
      Skip ▸
    </button>
  )
}
