'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '@/providers/SettingsProvider'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  FIRST_PHASE,
  PHASE_DURATIONS_MS,
  TERMINAL_PHASE,
  TITLE_PHASE,
  isTimedPhase,
  nextPhase,
  type BootPhase,
} from './phases'

interface EmulatorBoot {
  phase: BootPhase
  /** True while the animated intro is playing (before the title/Oak). */
  isBooting: boolean
  /** Skip straight to Professor Oak. */
  skip: () => void
  /** Whether a skip affordance should be offered (during the timed intro). */
  canSkip: boolean
  /** Advance from the title screen (PRESS START). No-op unless on the title phase. */
  pressStart: () => void
  /** True when the title screen is showing and waiting for PRESS START. */
  awaitingStart: boolean
}

/**
 * Drives the boot: power → gamefreak → title (waits for PRESS START) → Oak.
 *
 * Rules:
 * - First-time visitors watch the intro, then press start on the title.
 * - Returning visitors and reduced-motion users bypass the animated intro but still
 *   land on the title screen (a recognizable, low-motion resting point) rather than
 *   being thrown straight into dialogue. From the title, PRESS START → Oak.
 * - `skip()` jumps the animated intro to the title.
 * - Reaching Oak marks the visit as seen.
 */
export function useEmulatorBoot(): EmulatorBoot {
  const { hasVisited, setHasVisited, reducedMotion } = useSettings()
  const prefersReducedMotion = usePrefersReducedMotion()
  const bypassIntro = hasVisited || reducedMotion || prefersReducedMotion

  const [phase, setPhase] = useState<BootPhase>(FIRST_PHASE)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Boot only STARTS once the page has actually mounted and painted a frame. Without this
   * gate the phase timers begin on the very first render - while the JS bundle, fonts and
   * boot art are still loading - so the ~4s intro elapses off-screen and the visitor lands
   * mid-sequence (or past it) the moment the page becomes visible. We also wait for this so
   * settings (`hasVisited`, reduced-motion) have hydrated before deciding whether to bypass
   * the intro, avoiding a flicker. Held on the Power phase until then.
   */
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Two rAFs ⇒ the first paint is committed before we let timers run.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const skip = useCallback(() => {
    clearTimer()
    setPhase(TITLE_PHASE)
  }, [clearTimer])

  const pressStart = useCallback(() => {
    setPhase((current) => (current === TITLE_PHASE ? TERMINAL_PHASE : current))
  }, [])

  // Skip the animated intro straight to the title for returning / reduced-motion users.
  // Waits for `ready` so `hasVisited`/reduced-motion have hydrated first (no flicker).
  useEffect(() => {
    if (ready && bypassIntro)
      setPhase((current) => (isTimedPhase(current) ? TITLE_PHASE : current))
  }, [ready, bypassIntro])

  // Auto-advance timed phases only - and only once the page is painted (`ready`), so the
  // intro isn't consumed during initial load. Title waits for input; Oak is terminal.
  useEffect(() => {
    if (!ready || !isTimedPhase(phase) || bypassIntro) return
    const duration = PHASE_DURATIONS_MS[phase]
    timerRef.current = setTimeout(() => setPhase((current) => nextPhase(current)), duration)
    return clearTimer
  }, [ready, phase, bypassIntro, clearTimer])

  // Persist first visit once the sequence reaches Oak.
  useEffect(() => {
    if (phase === TERMINAL_PHASE && !hasVisited) setHasVisited(true)
  }, [phase, hasVisited, setHasVisited])

  const isBooting = isTimedPhase(phase)
  return {
    phase,
    isBooting,
    skip,
    canSkip: isBooting,
    pressStart,
    awaitingStart: phase === TITLE_PHASE,
  }
}
