'use client'

import { useEffect } from 'react'
import { useVisitTracker } from '@/hooks/useVisitTracker'
import { useAudio, useAudioEnabled } from '@/providers/AudioProvider'
import { MUSIC_VOLUME } from '@/engine/audio/volumes'
import { ReturnToAdventure } from '@/recruiter/layout/ReturnToAdventure'
import { AdventureModeNotice } from '@/recruiter/layout/AdventureModeNotice'

/**
 * Client-side chrome for Recruiter Mode: runs the visit tracker, shows the floating
 * "Return to Adventure" button, and plays Pokémon Center BGM.
 *
 * Asking for the track once is enough. If the browser refuses it for want of a user
 * activation, the AudioManager holds it and starts it on the visitor's first click or
 * keypress. This used to be handled here with gesture listeners plus a 100ms timer, but
 * the timer always won the race: it called play(), autoplay rejected it, and it still
 * marked the music as started - so the listeners were removed and the refused track was
 * never retried. Recruiter Mode was silent for anyone whose browser enforces the policy.
 */
export function RecruiterChrome() {
  useVisitTracker()
  useAudioEnabled()
  const { play } = useAudio()

  useEffect(() => {
    play('pokemonCenter', { volume: MUSIC_VOLUME, loop: true })
  }, [play])

  return (
    <>
      <ReturnToAdventure />
      <AdventureModeNotice />
    </>
  )
}
