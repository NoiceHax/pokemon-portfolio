'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAudio } from '@/providers/AudioProvider'
import { useAdventureTransition } from '@/lib/adventureTransition'

/**
 * Floating "Return to Adventure" button.
 *
 * Only rendered when the recruiter site was opened FROM Adventure Mode (a transition is
 * stashed in sessionStorage). Visitors who navigate to /recruiter directly have no
 * transition → no button. Clicking navigates back to /adventure, where the WorldRenderer
 * restores the exact building/position/facing/camera from the saved snapshot.
 */
export function ReturnToAdventure() {
  const transition = useAdventureTransition()
  const router = useRouter()
  const { stopAll } = useAudio()

  if (!transition) return null

  const handleReturn = () => {
    stopAll()
    router.push('/adventure')
  }

  return (
    <button
      type="button"
      onClick={handleReturn}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border-2 border-poke-red bg-surface/95 px-4 py-2.5 font-mono text-sm font-semibold text-poke-red shadow-lg backdrop-blur transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
      aria-label="Return to Adventure Mode"
    >
      <ArrowLeft aria-hidden className="h-4 w-4" />
      Return to Adventure
    </button>
  )
}
