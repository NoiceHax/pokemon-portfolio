'use client'

import { useEffect, useRef } from 'react'
import { useVisitTracker } from '@/hooks/useVisitTracker'
import { useAudio } from '@/providers/AudioProvider'
import { ReturnToAdventure } from '@/recruiter/layout/ReturnToAdventure'
import { AdventureModeNotice } from '@/recruiter/layout/AdventureModeNotice'

/**
 * Client-side chrome for Recruiter Mode: runs the visit tracker, shows the floating
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
        document.removeEventListener('click', startMusic)
        document.removeEventListener('keydown', startMusic)
        document.removeEventListener('touchstart', startMusic)
      }
    }

    const timer = setTimeout(() => {
      stopAll()
      play('pokemonCenter', { volume: 0.2, loop: true })
      playedMusic.current = true
    }, 100)

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
      <ReturnToAdventure />
      <AdventureModeNotice />
    </>
  )
}
