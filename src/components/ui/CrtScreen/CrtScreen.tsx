'use client'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSettings } from '@/providers/SettingsProvider'

interface CrtScreenProps {
  children: React.ReactNode
  /** Adds the subtle flicker animation. Ignored when motion is reduced. */
  flicker?: boolean
  className?: string
}

/**
 * CRT screen frame - layers scanlines and a vignette over its children to evoke an
 * old handheld console display (DESIGN.md boot sequence).
 *
 * The scanline/vignette layers are decorative (`aria-hidden`) and
 * `pointer-events-none` so they never interfere with interaction or screen readers.
 * The flicker is suppressed when the user prefers reduced motion.
 */
export function CrtScreen({ children, flicker = true, className = '' }: CrtScreenProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { reducedMotion } = useSettings()
  const animate = flicker && !prefersReducedMotion && !reducedMotion

  // NOTE: no `relative` here - callers pass their own positioning (e.g. `fixed
  // inset-0` for the full-screen boot). Tailwind can't disambiguate two position
  // utilities on one element, so forcing `relative` would silently beat `fixed`.
  return (
    <div className={`overflow-hidden bg-black ${animate ? 'crt-flicker' : ''} ${className}`}>
      {/* Fill the CRT frame regardless of how the child sizes itself. */}
      <div className="absolute inset-0">{children}</div>
      <div aria-hidden className="crt-scanlines pointer-events-none absolute inset-0 z-10" />
      <div aria-hidden className="crt-vignette pointer-events-none absolute inset-0 z-10" />
    </div>
  )
}
