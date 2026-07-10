'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useSettings } from '@/providers/SettingsProvider'

/**
 * Global mute toggle. Persists via SettingsProvider so Recruiter and Adventure share
 * one mute state, and AudioProvider keeps the AudioManager in sync.
 */
export function MuteButton({ className = '' }: { className?: string }) {
  const { muted, setMuted } = useSettings()

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      title={muted ? 'Unmute' : 'Mute'}
      className={`grid h-10 w-10 place-items-center rounded-md border border-edge bg-surface-raised/90 text-ink-soft transition-colors hover:border-poke-red hover:text-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red ${className}`}
    >
      {muted ? (
        <VolumeX className="h-4 w-4" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
    </button>
  )
}
