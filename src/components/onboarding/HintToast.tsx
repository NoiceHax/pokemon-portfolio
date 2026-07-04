'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * A small, self-dismissing notice toast (bottom-left, matching BadgeToast placement but
 * offset so they don't collide). Used for one-off contextual messages such as "You
 * entered through Adventure Mode - use Return to Adventure to keep exploring."
 *
 * Auto-dismisses after `duration` ms; also closable via the × button.
 */
export function HintToast({
  title,
  lines,
  duration = 8000,
  onDone,
  /** Tailwind bottom offset, e.g. 'bottom-6' or 'bottom-20' (to clear a nearby button). */
  bottomClass = 'bottom-6',
}: {
  title?: string
  lines: string[]
  duration?: number
  onDone?: () => void
  bottomClass?: string
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
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${bottomClass} left-6 z-[75] w-[min(90vw,20rem)] rounded-card border-2 border-poke-red bg-surface-raised/95 px-4 py-3 shadow-lg backdrop-blur-sm`}
        >
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded p-0.5 text-ink-faint transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          {title ? (
            <p className="mb-1 pr-4 font-display text-[0.6rem] uppercase tracking-widest text-poke-red">
              {title}
            </p>
          ) : null}
          {lines.map((line) => (
            <p key={line} className="pr-4 font-mono text-xs leading-snug text-ink-soft">
              {line}
            </p>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
