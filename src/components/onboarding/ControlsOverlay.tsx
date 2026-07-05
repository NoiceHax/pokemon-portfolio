'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { KeyCap } from './KeyCap'

/**
 * The global controls hint. A small, unobtrusive card in the corner that lists the core
 * inputs (move / run / interact) when an experience begins, then fades out on its own
 * after a few seconds. Feels like the control legend a game shows on a new screen.
 *
 * Auto-dismisses after `duration` ms; can be dismissed early by any keypress (once the
 * player uses a control, they've learned it). Purely visual - never captures input.
 */

interface ControlLine {
  label: string
  keys: string[]
}

const CONTROLS: ControlLine[] = [
  { label: 'Move', keys: ['↑↓←→', 'WASD'] },
  { label: 'Run', keys: ['Shift'] },
  { label: 'Interact', keys: ['Enter'] },
]

export function ControlsOverlay({
  onDone,
  duration = 6000,
}: {
  onDone?: () => void
  duration?: number
}) {
  const [visible, setVisible] = useState(true)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const hide = () => setVisible(false)
    const timer = window.setTimeout(hide, duration)
    // Any interaction means the player is engaging - retire the legend early.
    window.addEventListener('keydown', hide, { once: true })
    window.addEventListener('pointerdown', hide, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', hide)
      window.removeEventListener('pointerdown', hide)
    }
  }, [duration])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible ? (
        <motion.aside
          role="note"
          aria-label="Controls"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed bottom-4 right-4 z-[70] w-max max-w-[90vw] rounded-card border-2 border-edge bg-surface-raised/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
        >
          <p className="mb-1.5 font-display text-[0.55rem] uppercase tracking-widest text-poke-red">
            Controls
          </p>
          <ul className="flex flex-col gap-1.5">
            {CONTROLS.map((c) => (
              <li key={c.label} className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-ink-soft">{c.label}</span>
                <span className="flex items-center gap-1">
                  {c.keys.map((k, i) => (
                    <span key={k} className="flex items-center gap-1">
                      {i > 0 ? (
                        <span className="font-mono text-[0.6rem] text-ink-faint">/</span>
                      ) : null}
                      <KeyCap>{k}</KeyCap>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
