'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Subtle boot-sequence prompts. Only ever shows the ONE prompt that applies to the
 * current phase, so guidance appears exactly when it's actionable and vanishes otherwise:
 *   - during the timed intro (Power / Game Freak): "Press Esc to skip animations"
 *   - on the title screen: "Press Space or Enter to continue"
 *
 * Rendered over the CRT frame, low-contrast, never interactive.
 */
export function BootHints({ phase }: { phase: 'power' | 'gamefreak' | 'title' | 'oak' }) {
  const reducedMotion = usePrefersReducedMotion()

  const text =
    phase === 'title'
      ? 'Press Space or Enter to continue'
      : phase === 'power' || phase === 'gamefreak'
        ? 'Press Esc to skip animations'
        : null

  if (!text) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center">
      <motion.p
        key={phase}
        role="note"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="whitespace-nowrap rounded-full bg-white/70 px-3 py-1 text-center font-mono text-xs uppercase tracking-widest text-black shadow-sm backdrop-blur-sm"
      >
        {text}
      </motion.p>
    </div>
  )
}
