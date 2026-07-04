'use client'

import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AudioManager, type SoundKey } from '@/engine/audio/AudioManager'
import { useSettings } from '@/providers/SettingsProvider'

interface AudioContextValue {
  play: (key: SoundKey, opts?: { loop?: boolean; volume?: number }) => void
  stop: (key: SoundKey) => void
  stopAll: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

/**
 * Thin React binding over the AudioManager. It keeps a single manager instance for
 * the app lifetime and syncs its mute flag with SettingsProvider, so all playback
 * everywhere honors the global mute (CLAUDE.md: Audio must respect mute settings).
 *
 * Depends on SettingsProvider, so it must be nested inside it.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { muted } = useSettings()
  const managerRef = useRef<AudioManager | null>(null)
  if (managerRef.current === null) {
    managerRef.current = new AudioManager()
  }
  const manager = managerRef.current

  useEffect(() => {
    manager.setMuted(muted)
  }, [manager, muted])

  useEffect(() => {
    return () => manager.stopAll()
  }, [manager])

  const value = useMemo<AudioContextValue>(
    () => ({
      play: (key, opts) => manager.play(key, opts),
      stop: (key) => manager.stop(key),
      stopAll: () => manager.stopAll(),
    }),
    [manager],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

/** Play sounds through the shared manager. Throws if used outside AudioProvider. */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext)
  if (context === null) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
