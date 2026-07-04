'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the OS `prefers-reduced-motion` setting. Combined with the app-level
 * `reducedMotion` toggle (SettingsProvider), this lets us honor accessibility
 * globally (CLAUDE.md: "Respect prefers-reduced-motion").
 *
 * Starts `false` so server and first client render agree; the real value is read
 * after mount to avoid hydration mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
