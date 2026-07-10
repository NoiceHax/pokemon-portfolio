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
            {/* Full-body Oak on the lecture stage, standing on a soft platform. */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <img
                src={sprites.professorOak}
                alt="Professor Oak"
                className="h-48 w-auto drop-shadow-[0_6px_0_rgba(0,0,0,0.15)] [image-rendering:pixelated] sm:h-56"
                draggable={false}
              />
              {/* Platform shadow, echoing the opening-lecture stage. */}
              <div className="mt-1 h-4 w-40 rounded-[100%] bg-teal-200/50 blur-[1px]" />
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
