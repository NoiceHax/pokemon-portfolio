'use client'

import { HintToast, HINT_IDS, useOncePerSession } from '@/components/onboarding'
import { useAdventureTransition } from '@/lib/adventureTransition'

/**
 * A one-time notice shown when a recruiter page is opened FROM Adventure Mode. It tells
 * the visitor how they got here and that they can return anytime - then never appears
 * again for the rest of the session (they've learned it).
 *
 * Gated on the same transition state that renders the "Return to Adventure" button, so it
 * never shows for visitors who came to /recruiter directly.
 */
export function AdventureModeNotice() {
  const transition = useAdventureTransition()
  const { show, dismiss } = useOncePerSession(HINT_IDS.recruiterFromAdventure, transition !== null)

  if (!show) return null

  return (
    <HintToast
      title="Adventure Mode"
      lines={[
        'You entered through Adventure Mode.',
        'Use “Return to Adventure” anytime to keep exploring.',
      ]}
      onDone={dismiss}
      // Sit above the floating "Return to Adventure" button so both are visible.
      bottomClass="bottom-20"
    />
  )
}
