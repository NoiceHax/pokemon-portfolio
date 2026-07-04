import type { Variants, Transition } from 'framer-motion'

/**
 * Shared Framer Motion variants + timing. Defined once so animations across the app
 * share the same pacing (CLAUDE.md: consistent, purposeful, never flashy).
 *
 * Note: global `prefers-reduced-motion` CSS neutralizes CSS transitions/animations,
 * but Framer Motion runs in JS - components should additionally gate motion with the
 * reduced-motion hooks where the animation conveys nothing without movement.
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/** A quick, subtle default transition. */
export const quickTransition: Transition = {
  duration: 0.4,
  ease: 'easeInOut',
}
