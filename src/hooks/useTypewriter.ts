'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSettings } from '@/providers/SettingsProvider'

interface UseTypewriterOptions {
  /** Milliseconds per character. Lower = faster. */
  speed?: number
  /** Optional callback fired once the full text is revealed. */
  onComplete?: () => void
}

interface Typewriter {
  /** The portion of text revealed so far. */
  displayed: string
  /** True while characters are still being revealed. */
  isTyping: boolean
  /** Reveal the entire text immediately (used by the "advance/skip" action). */
  skip: () => void
}

/**
 * Reveals `text` one character at a time (Pokémon dialogue typing).
 *
 * Accessibility: when the user prefers reduced motion (OS or app setting), the full
 * text appears immediately - the animation conveys pacing, not information, so it is
 * safe to drop (CLAUDE.md: respect prefers-reduced-motion).
 *
 * The effect restarts cleanly whenever `text` changes (i.e. on each new line/node).
 */
export function useTypewriter(
  text: string,
  { speed = 28, onComplete }: UseTypewriterOptions = {},
): Typewriter {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { reducedMotion } = useSettings()
  const instant = prefersReducedMotion || reducedMotion

  const [displayed, setDisplayed] = useState(instant ? text : '')
  const [isTyping, setIsTyping] = useState(!instant && text.length > 0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (instant || text.length === 0) {
      setDisplayed(text)
      setIsTyping(false)
      onCompleteRef.current?.()
      return
    }

    setDisplayed('')
    setIsTyping(true)
    let index = 0
    const interval = setInterval(() => {
      index += 1
      setDisplayed(text.slice(0, index))
      if (index >= text.length) {
        clearInterval(interval)
        setIsTyping(false)
        onCompleteRef.current?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, instant])

  const skip = () => {
    setDisplayed(text)
    setIsTyping(false)
  }

  return { displayed, isTyping, skip }
}
