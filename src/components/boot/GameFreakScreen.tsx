import { PixelText } from '@/components/ui/PixelText'

/**
 * Phase 2 - Publisher logo. An original riff on the classic "Game Freak" logo reveal:
 * a star sweeps across a black screen, leaving a pixel wordmark. All original text
 * (PROJECT_BIBLE: familiarity, not imitation) - it evokes the ritual of a game booting
 * without copying the real logo.
 */
export function GameFreakScreen() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      {/* The sweeping star */}
      <span aria-hidden className="boot-star absolute text-2xl text-yellow-300">
        ✦
      </span>

      {/* Wordmark fades in behind the star - real FireRed bitmap font (PixelText). */}
      <div className="boot-logo-in flex flex-col items-center gap-3 text-center">
        <PixelText size={34} tone="white">
          CHANDAN WORKS
        </PixelText>
        <span className="opacity-60">
          <PixelText size={16} tone="white" letterSpacing={3}>
            PRESENTS
          </PixelText>
        </span>
      </div>
    </div>
  )
}
