'use client'

import { useEffect, useRef } from 'react'
import { useVisitTracker } from '@/hooks/useVisitTracker'
import { useAudio } from '@/providers/AudioProvider'
import { BadgeToast } from '@/components/ui/BadgeToast'
import { ReturnToAdventure } from '@/recruiter/layout/ReturnToAdventure'
import { AdventureModeNotice } from '@/recruiter/layout/AdventureModeNotice'

/**
 * Client-side chrome for Recruiter Mode: runs the visit tracker (auto-unlocks
 * exploration badges), renders the badge-unlock toast, shows the floating
 * "Return to Adventure" button, and plays Pokémon Center BGM.
 */
export function RecruiterChrome() {
  useVisitTracker()
  const { play, stopAll } = useAudio()
  const playedMusic = useRef(false)

  useEffect(() => {
    if (playedMusic.current) return

    const startMusic = () => {
      if (!playedMusic.current) {
        playedMusic.current = true
        stopAll()
        play('pokemonCenter', { volume: 0.2, loop: true })
        // Remove listener after first interaction
        document.removeEventListener('click', startMusic)
        document.removeEventListener('keydown', startMusic)
        document.removeEventListener('touchstart', startMusic)
      }
    }

    // Try autoplay first
    const timer = setTimeout(() => {
      stopAll()
      play('pokemonCenter', { volume: 0.2, loop: true })
      playedMusic.current = true
    }, 100)

    // Fallback: play on first user interaction if autoplay fails
    document.addEventListener('click', startMusic)
    document.addEventListener('keydown', startMusic)
    document.addEventListener('touchstart', startMusic)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', startMusic)
      document.removeEventListener('keydown', startMusic)
      document.removeEventListener('touchstart', startMusic)
    }
  }, [play, stopAll])

  return (
    <>
      <BadgeToast />
      <ReturnToAdventure />
      <AdventureModeNotice />
    </>
  )
}
