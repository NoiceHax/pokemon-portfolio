'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useEmulatorBoot } from '@/engine/emulator/useEmulatorBoot'
import { useAudio } from '@/providers/AudioProvider'
import { CrtScreen } from '@/components/ui/CrtScreen/CrtScreen'
import { Fade } from '@/components/ui/transitions/Fade'
import { PowerScreen } from './PowerScreen'
import { GameFreakScreen } from './GameFreakScreen'
import { TitleScreen } from './TitleScreen'
import { OakLanding } from './OakLanding'
import { SkipControl } from './SkipControl'
import { BootHints } from './BootHints'

/**
 * Orchestrates the Emulator Boot: Power → Game Freak-style logo → Fire Red-style title
 * (PRESS START) → Professor Oak.
 *
 * Phase logic lives in the emulator machine; this component maps a phase to a screen
 * and wires sound + skip + press-start. The title screen music plays when the title
 * appears and stops when the player starts the game.
 */
export function BootSequence() {
  const { phase, isBooting, skip, canSkip, pressStart, awaitingStart } = useEmulatorBoot()
  const { play, stopAll } = useAudio()
  const playedTitle = useRef(false)

  useEffect(() => {
    if (awaitingStart && !playedTitle.current) {
      playedTitle.current = true
      stopAll()
      play('titleScreen', { volume: 0.5, loop: true })
    }
    if (phase === 'oak') {
      stopAll()
      play('professorOakLab', { volume: 0.5, loop: true })
    }
  }, [awaitingStart, phase, play, stopAll])

  const screen = {
    power: <PowerScreen />,
    gamefreak: <GameFreakScreen />,
    title: <TitleScreen onStart={pressStart} />,
    oak: <OakLanding />,
  }[phase]

  // The CRT frame wraps the animated intro + title; Oak sits on a warm surface but we
  // keep the frame so the whole experience reads as "inside the handheld".
  return (
    <CrtScreen flicker={isBooting} className="fixed inset-0">
      <AnimatePresence mode="wait">
        <Fade key={phase} motionKey={phase} className="absolute inset-0">
          {screen}
        </Fade>
      </AnimatePresence>
      {canSkip ? <SkipControl onSkip={skip} /> : null}
      <BootHints phase={phase} />
    </CrtScreen>
  )
}
