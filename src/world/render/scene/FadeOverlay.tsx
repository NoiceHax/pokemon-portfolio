'use client'

import { useEffect, useRef, useState } from 'react'
import type { WorldEngine } from '@/world/engine/WorldEngine'

/**
 * Fade - a full-screen black veil driven by the engine's `FadeRequested` events
 * (fade `out` to black, fade `in` to clear). Distinct from MapTransition (which is the
 * quick auto-flash on area change): this is the general-purpose fade a cutscene or a
 * scripted moment can request for any duration. Never blocks input.
 */
export function FadeOverlay({ engine }: { engine: WorldEngine }) {
  const [opacity, setOpacity] = useState(0)
  const [duration, setDuration] = useState(200)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    return engine.bus.on('FadeRequested', ({ to, durationMs }) => {
      setDuration(durationMs)
      // Ensure the transition duration applies before flipping opacity.
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => setOpacity(to === 'out' ? 1 : 0))
    })
  }, [engine])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 bg-black"
      style={{ opacity, transition: `opacity ${duration}ms ease` }}
    />
  )
}
