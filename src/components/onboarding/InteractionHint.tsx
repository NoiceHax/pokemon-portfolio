'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { KeyCap } from './KeyCap'

/**
 * A contextual interaction prompt, e.g. `[Enter] → Go in`. Rendered only while the player is
 * in range of something interactable (a house door, an NPC). Sits just above the dialogue
 * zone at the bottom of the screen and gently bobs to draw the eye. Non-interactive.
 *
 * Controlled by `visible` - the caller decides range/eligibility; this only animates.
 */
export function InteractionHint({
  visible,
  keyLabel = 'Enter',
  action = 'Go in',
}: {
  visible: boolean
  keyLabel?: string
  action?: string
}) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="note"
          aria-label={`${keyLabel === 'Enter' ? 'Press Enter or tap the red button' : `Press ${keyLabel}`} to ${action}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 md:bottom-24"
        >
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
            transition={
              reducedMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            }
            className="flex items-center gap-2 rounded-full border-2 border-edge bg-surface-raised/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"
          >
            <span className="hidden items-center gap-2 md:flex" aria-hidden>
              <KeyCap>{keyLabel}</KeyCap>
              <span className="font-mono text-xs text-ink">→ {action}</span>
            </span>
            <span className="font-mono text-xs text-ink md:hidden" aria-hidden>
              Tap the red button to {action.toLowerCase()}
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
