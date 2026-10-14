'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { MuteButton } from '@/components/ui/MuteButton'
import { ControlsBar, InteractionHint } from '@/components/onboarding'
import { hasShownHint, markHintShown } from '@/components/onboarding/hintState'
import { stepCoord, type WorldSnapshot } from '@/world/engine/types'

const TUTORIAL_ID = 'adventureWalkthroughV1'

/** Teach through actual movement and door interactions, without capturing game input. */
export function AdventureOnboarding({
  snapshot,
  overlayOpen,
}: {
  snapshot: WorldSnapshot
  overlayOpen: boolean
}) {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(() => hasShownHint(TUTORIAL_ID))
  const origin = useRef(snapshot.player.position)
  const facingDoor = isFacingPortal(snapshot)

  useEffect(() => {
    if (dismissed) return
    if (overlayOpen) setStep(3)
    else if (facingDoor) setStep((current) => Math.max(current, 2))
    else if (
      snapshot.player.position.x !== origin.current.x ||
      snapshot.player.position.y !== origin.current.y
    ) {
      setStep((current) => Math.max(current, 1))
    }
  }, [dismissed, overlayOpen, facingDoor, snapshot.player.position.x, snapshot.player.position.y])

  const dismiss = () => {
    markHintShown(TUTORIAL_ID)
    setDismissed(true)
  }
  const titles = ['Move around', 'Find a house', 'Open the door', 'Keep exploring']

  return (
    <>
      {!overlayOpen ? <ControlsBar /> : null}
      {!overlayOpen ? (
        <div
          className="absolute right-4 top-4 z-40 flex items-center gap-2"
          onKeyDown={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="How to play"
            title="How to play"
            aria-expanded={!dismissed}
            aria-controls="adventure-tutorial"
            onClick={() => {
              if (!dismissed) dismiss()
              else {
                origin.current = snapshot.player.position
                setStep(0)
                setDismissed(false)
              }
            }}
            className="flex h-10 items-center gap-2 rounded-md border border-ink/40 bg-surface-raised/90 px-3 font-mono text-xs text-ink-soft transition-colors hover:border-poke-red hover:text-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
          >
            <CircleHelp className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">How to play</span>
          </button>
          <MuteButton className="border-ink/40 bg-surface-raised/90" />
        </div>
      ) : null}
      {!overlayOpen && !dismissed ? (
        <aside
          id="adventure-tutorial"
          aria-label="Adventure tutorial"
          onKeyDown={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
          className="absolute right-4 top-16 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-card border-2 border-edge bg-surface-raised/95 p-3 text-ink shadow-lg backdrop-blur-sm"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Getting started - {step + 1}/4
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="font-mono text-xs text-ink-soft underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
            >
              Hide
            </button>
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h2 className="font-display text-xs leading-relaxed text-poke-red">{titles[step]}</h2>
            <div className="mt-2 font-mono text-sm leading-snug text-ink-soft">
              {step === 0 ? (
                <>
                  <p className="hidden md:block">
                    Use the arrow keys or WASD to walk. Hold Shift to run. Try moving a few steps.
                  </p>
                  <p className="md:hidden">
                    Hold a direction on the D-pad at the bottom left to walk. Try moving a few
                    steps.
                  </p>
                </>
              ) : null}
              {step === 1 ? (
                <p>
                  Walk up to a house and face its door. Each building opens a section of
                  Chandan&apos;s portfolio: projects, experience, writing, or contact.
                </p>
              ) : null}
              {step === 2 ? (
                <>
                  <p className="hidden md:block">
                    {facingDoor
                      ? 'You are at a door. Press Enter or Space to look inside.'
                      : 'Face a house door and press Enter or Space to look inside.'}
                  </p>
                  <p className="md:hidden">
                    {facingDoor
                      ? 'You are at a door. Tap the red button at the bottom right to look inside.'
                      : 'Face a house door and tap the red button to look inside.'}
                  </p>
                </>
              ) : null}
              {step === 3 ? (
                <p>
                  Visit other houses to see more of the portfolio. You can also face people and
                  signs, then interact to read them.
                </p>
              ) : null}
            </div>
          </div>
          {step === 3 ? (
            <button
              type="button"
              onClick={dismiss}
              className="mt-3 rounded-card bg-poke-red px-3 py-2 font-mono text-xs text-white focus-visible:outline focus-visible:outline-2"
            >
              Got it
            </button>
          ) : null}
        </aside>
      ) : null}
      <InteractionHint visible={facingDoor && !overlayOpen} keyLabel="Enter" action="Go in" />
    </>
  )
}

function isFacingPortal(snapshot: WorldSnapshot): boolean {
  const ahead = stepCoord(snapshot.player.position, snapshot.player.direction)
  return snapshot.entities.some(
    (e) => e.kind === 'portal' && !e.hidden && e.position.x === ahead.x && e.position.y === ahead.y,
  )
}
