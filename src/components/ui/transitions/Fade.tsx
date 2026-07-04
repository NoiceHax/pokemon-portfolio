'use client'

import { motion } from 'framer-motion'
import { fadeVariants, quickTransition } from '@/components/ui/animations/variants'

interface FadeProps {
  children: React.ReactNode
  /** Framer Motion key controls enter/exit when used inside AnimatePresence. */
  motionKey?: string
  className?: string
}

/**
 * Fade in/out primitive. Use inside <AnimatePresence> for cross-fades between boot
 * phases and scenes. Reused by the boot sequence and, later, page/scene transitions.
 */
export function Fade({ children, motionKey, className }: FadeProps) {
  return (
    <motion.div
      key={motionKey}
      className={className}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={quickTransition}
    >
      {children}
    </motion.div>
  )
}
