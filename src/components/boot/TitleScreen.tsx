'use client'

import { useEffect } from 'react'
import { PixelText } from '@/components/ui/PixelText'

/**
 * Phase 3 - Fire Red-style title screen. Sky gradient, the unpacked Charizard mascot,
 * a "TRAINER CHANDAN / VERSION" logo treatment, and a blinking PRESS START. Waits for
 * the player to press start (any key / click / tap), like the games.
 *
 * Original text and layout inspired by the FireRed title - no copied logo.
 */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])

  return (
    <button
      type="button"
      onClick={onStart}
      aria-label="Press Start"
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 focus:outline-none"
    >
      {/* Logo treatment - pinned near the top, drawn in the real FireRed bitmap font
          (PixelText) at ~1.6x the previous size. */}
      <div className="boot-logo-in absolute top-[12%] flex flex-col items-center gap-2 text-center">
        <PixelText size={52} tone="red" className="drop-shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
          TRAINER
        </PixelText>
        <PixelText size={52} tone="red" className="drop-shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
          CHANDAN
        </PixelText>
        <PixelText size={20} tone="ink" letterSpacing={3} className="mt-2">
          FIRE RED VERSION
        </PixelText>
      </div>

      {/* Charizard mascot - centered. */}
      <img
        src="/assets/sprites/charizard.png"
        alt="Charizard"
        className="mt-8 h-32 w-auto [image-rendering:pixelated] sm:mt-16 sm:h-56"
        draggable={false}
      />

      {/* Blinking PRESS START near the bottom. */}
      <span className="boot-blink absolute bottom-[14%]">
        <PixelText size={28} tone="ink">
          PRESS START
        </PixelText>
      </span>

      <span className="absolute bottom-4 opacity-60">
        <PixelText size={12} tone="ink">
          CHANDAN. ORIGINAL PORTFOLIO.
        </PixelText>
      </span>
    </button>
  )
}
