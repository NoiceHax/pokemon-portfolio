'use client'

import { useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useBadges } from '@/providers/BadgeProvider'
import { getBadges } from '@/lib/content'
import { useAudio } from '@/providers/AudioProvider'

/**
 * A small "badge unlocked!" toast, shown briefly whenever a new badge is earned -
 * anywhere in the app. Plays the gym-badge jingle (respecting mute).
 */
export function BadgeToast() {
  const { lastUnlocked, clearLastUnlocked } = useBadges()
  const { play } = useAudio()
  const badge = lastUnlocked ? getBadges().find((b) => b.slug === lastUnlocked) : undefined

  useEffect(() => {
    if (!lastUnlocked) return
    play('obtainedBadge', { volume: 0.4 })
    const t = window.setTimeout(clearLastUnlocked, 3500)
    return () => window.clearTimeout(t)
  }, [lastUnlocked, play, clearLastUnlocked])

  if (!badge) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-card border-2 border-poke-red bg-surface-raised px-4 py-3 shadow-lg"
    >
      <Trophy className="h-6 w-6 text-poke-red" aria-hidden />
      <div>
        <p className="font-display text-[0.7rem] uppercase tracking-wide text-poke-red">
          Badge unlocked!
        </p>
        <p className="font-mono text-sm text-ink">{badge.name}</p>
      </div>
    </div>
  )
}
