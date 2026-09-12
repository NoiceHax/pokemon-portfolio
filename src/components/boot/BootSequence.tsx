'use client'

import { AnimatePresence } from 'framer-motion'
import { useEmulatorBoot } from '@/engine/emulator/useEmulatorBoot'
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
 * and wires skip + press-start.
 *
 * The boot is silent on purpose. It is the first thing a visitor sees, often with the
 * tab in the background or in a room where sound is not welcome, and a theme starting
 * unannounced there is the kind of thing people close a tab over. Music begins once
 * they have chosen a mode - see `useAudioEnabled`.
 */
export function BootSequence() {
  const { phase, isBooting, skip, canSkip, pressStart } = useEmulatorBoot()

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
