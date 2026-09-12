'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { DialogueScene } from '@/components/ui/DialogueBox'
import { Fade } from '@/components/ui/transitions/Fade'
import { createOakScript } from '@/content/dialogue/oak'
import { routeForExperience } from '@/engine/emulator/routing'
import { useSettings, type ChosenExperience } from '@/providers/SettingsProvider'
import { useAudio } from '@/providers/AudioProvider'
import { sprites } from '@/lib/assets/registry'

/**
 * Professor Oak + Viewer Selection.
 *
 * Flow: Oak asks "What kind of trainer are you?"; the visitor picks one of the three
 * canonical choices. We record the choice, let Oak deliver a short confirmation line,
 * then fade out and route to the chosen experience (M5 deliverable: correct
 * experience launches).
 *
 * Recruiter → /home; Developer & Friend → /adventure (same world, different
 * presentation - decision C).
 */
export function OakLanding() {
  const router = useRouter()
  const { setChosenExperience } = useSettings()
  const { play, stop } = useAudio()

  const chosenRef = useRef<ChosenExperience>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleChoose = useCallback(
    (experience: ChosenExperience) => {
      chosenRef.current = experience
      setChosenExperience(experience)
      play('obtainedPokemon', { volume: 0.3 })
    },
    [setChosenExperience, play],
  )

  // Oak's confirmation line has finished - transition to the chosen experience.
  const handleFinish = useCallback(() => {
    const destination = routeForExperience(chosenRef.current)
    if (!destination) return
    setIsLeaving(true)
  }, [])

  const script = useMemo(() => createOakScript(handleChoose), [handleChoose])

  // After the fade-out completes, perform the actual navigation.
  const handleExitComplete = useCallback(() => {
    const destination = routeForExperience(chosenRef.current)
    if (destination) {
      stop('professorOakLab')
      router.push(destination)
    }
  }, [router, stop])

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-teal-700 via-teal-500 to-teal-300">
      <AnimatePresence onExitComplete={handleExitComplete}>
        {!isLeaving ? (
          <Fade key="oak" motionKey="oak" className="flex h-full w-full flex-col items-center">
            {/* Full-body Oak on the lecture stage, standing on a soft platform.

                Three things about the sprite, all of which showed up as him looking a few
                pixels off top and bottom:

                1. It is 63x88, so the height is pinned to whole multiples of 88 (2x, then
                   3x). At a fractional scale `image-rendering: pixelated` rounds each
                   source row independently - some rows land on two device pixels, others
                   on three - which shaved a pixel off his hair and shoes.
                2. No drop-shadow on the sprite: the filter traces the alpha channel, and
                   the art has no transparent padding, so it drew a dark rim around his
                   outline instead of a shadow on the ground. The ellipse below is the
                   shadow now.
                3. Rows 85-87 of the source PNG are a solid white strip left over from the
                   rip, and read on screen as a bright bar under his feet. Oak's own art
                   ends at row 81, so the last 6 rows are cropped off here rather than by
                   editing the asset - the file is shared, and this keeps it untouched.
                   The crop is why the box is sized in 82nds and shifted up by the
                   difference. */}
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
              <div className="h-[164px] overflow-hidden sm:h-[246px]">
                <img
                  src={sprites.professorOak}
                  alt="Professor Oak"
                  className="h-[176px] w-auto max-w-none [image-rendering:pixelated] sm:h-[264px]"
                  draggable={false}
                />
              </div>
              {/* Platform shadow, echoing the opening-lecture stage. */}
              <div className="mt-2 h-3 w-32 rounded-[100%] bg-teal-950/25 blur-[4px]" />
            </div>

            {/* Dialogue box pinned to the bottom, like the games. */}
            <div className="w-full px-4 pb-6">
              <div className="mx-auto flex max-w-2xl justify-center">
                <DialogueScene script={script} onFinish={handleFinish} />
              </div>
            </div>
          </Fade>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
