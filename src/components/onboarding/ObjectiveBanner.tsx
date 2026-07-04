'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * A classic-Pokémon "Objective" banner. Slides in from the top, shows a short goal, then
 * fades away on its own. Used to nudge the player when they first reach a new area (e.g.
 * entering Cerulean City) without a modal or a tutorial wall.
 *
 * Auto-dismisses after `duration` ms. Pointer-events are disabled so it never blocks play.
 */
export function ObjectiveBanner({
  title = 'Objective',
  lines,
  duration = 6500,
  onDone,
}: {
  title?: string
  lines: string[]
  duration?: number
  onDone?: () => void
}) {
  const [visible, setVisible] = useState(true)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible ? (
        <motion.div
          role="status"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed left-1/2 top-4 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 rounded-card border-2 border-poke-red bg-surface-raised/95 px-4 py-3 shadow-lg backdrop-blur-sm"
        >
          <p className="mb-1 font-display text-[0.6rem] uppercase tracking-widest text-poke-red">
            {title}
          </p>
          {lines.map((line) => (
            <p key={line} className="font-mono text-sm leading-snug text-ink">
              {line}
            </p>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
