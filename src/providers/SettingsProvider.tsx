'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage/localStorage'

/**
 * The three viewer experiences. Recruiter → Recruiter Mode; Developer and Friend
 * both enter the shared Adventure world (see docs/DECISIONS.md, decision C).
 */
export type ChosenExperience = 'recruiter' | 'developer' | 'friend' | null

interface SettingsState {
  /** True once the boot sequence has been seen; lets returning visitors skip it. */
  hasVisited: boolean
  /** Global audio mute. All sound playback must respect this (CLAUDE.md: Audio). */
  muted: boolean
  /** User-forced reduced motion (in addition to the OS `prefers-reduced-motion`). */
  reducedMotion: boolean
  /** Which experience the visitor chose at Viewer Selection. */
  chosenExperience: ChosenExperience
}

interface SettingsContextValue extends SettingsState {
  setHasVisited: (value: boolean) => void
  setMuted: (value: boolean) => void
  setReducedMotion: (value: boolean) => void
  setChosenExperience: (value: ChosenExperience) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

/**
 * Cross-cutting settings shared by BOTH experiences. This is intentionally one of
 * the very few Contexts in the app (CLAUDE.md: avoid unnecessary global state).
 *
 * State starts from deterministic defaults so server and first client render match;
 * persisted values are hydrated in an effect after mount to avoid hydration
 * mismatches.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [hasVisited, setHasVisitedState] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [reducedMotion, setReducedMotionState] = useState(false)
  const [chosenExperience, setChosenExperienceState] = useState<ChosenExperience>(null)

  useEffect(() => {
    setHasVisitedState(readStorage(STORAGE_KEYS.hasVisited, false))
    setMutedState(readStorage(STORAGE_KEYS.muted, false))
    setReducedMotionState(readStorage(STORAGE_KEYS.reducedMotion, false))
    setChosenExperienceState(readStorage<ChosenExperience>(STORAGE_KEYS.chosenExperience, null))
  }, [])

  const setHasVisited = useCallback((value: boolean) => {
    setHasVisitedState(value)
    writeStorage(STORAGE_KEYS.hasVisited, value)
  }, [])

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value)
    writeStorage(STORAGE_KEYS.muted, value)
  }, [])

  const setReducedMotion = useCallback((value: boolean) => {
    setReducedMotionState(value)
    writeStorage(STORAGE_KEYS.reducedMotion, value)
  }, [])

  const setChosenExperience = useCallback((value: ChosenExperience) => {
    setChosenExperienceState(value)
    writeStorage(STORAGE_KEYS.chosenExperience, value)
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      hasVisited,
      muted,
      reducedMotion,
      chosenExperience,
      setHasVisited,
      setMuted,
      setReducedMotion,
      setChosenExperience,
    }),
    [
      hasVisited,
      muted,
      reducedMotion,
      chosenExperience,
      setHasVisited,
      setMuted,
      setReducedMotion,
      setChosenExperience,
    ],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
