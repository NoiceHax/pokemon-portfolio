import type { Speaker } from '@/engine/dialogue/types'

/**
 * Speaker portrait shown alongside dialogue. Renders nothing if the speaker has no
 * portrait, so text-only dialogue collapses cleanly.
 */
export function DialoguePortrait({ speaker }: { speaker: Speaker | undefined }) {
  if (!speaker?.portrait) return null
  return (
    <div className="shrink-0">
      <img
        src={speaker.portrait.src}
        alt={speaker.portrait.alt}
        className="h-12 w-12 rounded-lg border border-edge bg-surface-sunken object-contain [image-rendering:pixelated] sm:h-16 sm:w-16"
      />
    </div>
  )
}
