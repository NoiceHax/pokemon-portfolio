'use client'

import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'

/**
 * Stands in for a project link that points at this very site (the portfolio's own
 * "Live Site"). Instead of reopening the page you're on, it flashes a warning banner -
 * "Team Rocket is not far... (YOU ARE HERE)" - that clears itself after a few seconds.
 * Nothing to click: Esc or a click anywhere dismisses it early.
 */
export function YouAreHereButton({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  // A counter rather than a boolean, so clicking again replays the shake.
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!shown) return
    const hide = () => setShown(0)
    const timer = window.setTimeout(hide, 3500)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    // Deferred a tick so the click that opened the banner doesn't close it.
    const arm = window.setTimeout(() => window.addEventListener('pointerdown', hide), 0)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(arm)
      window.removeEventListener('pointerdown', hide)
      window.removeEventListener('keydown', onKey)
    }
  }, [shown])

  return (
    <>
      <button type="button" onClick={() => setShown((n) => n + 1)} className={className}>
        {children}
      </button>
      {shown ? (
        <div
          key={shown}
          role="alert"
          className="error-shake pointer-events-none fixed inset-x-4 top-20 z-[95] mx-auto flex max-w-md items-start gap-3 rounded-card border-2 border-amber-500 bg-amber-50 px-4 py-3 shadow-xl"
        >
          <TriangleAlert aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <p className="font-display text-xs uppercase tracking-wider text-amber-700">Warning!</p>
            <p className="mt-1.5 font-mono text-base leading-snug text-ink">
              Team Rocket is not far&hellip;{' '}
              <span className="font-bold text-poke-red">(YOU ARE HERE)</span>
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
