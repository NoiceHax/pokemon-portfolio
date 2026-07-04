'use client'

import { useEffect, useState } from 'react'
import type { WorldEngine } from '@/world/engine/WorldEngine'

/**
 * A brief black fade whenever the area changes (the reference engine's MapTransition).
 * Listens for AreaChanged and flashes an opacity overlay. Respects reduced motion by
 * simply being brief; it never blocks interaction (pointer-events-none).
 */
export function MapTransition({ engine }: { engine: WorldEngine }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    return engine.bus.on('AreaChanged', () => {
      setFading(true)
      const t = window.setTimeout(() => setFading(false), 260)
      return () => window.clearTimeout(t)
    })
  }, [engine])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-200"
      style={{ opacity: fading ? 1 : 0 }}
    />
  )
}
