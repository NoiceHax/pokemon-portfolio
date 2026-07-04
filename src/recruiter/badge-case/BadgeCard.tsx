import { Lock } from 'lucide-react'
import type { Badge } from '@/content/schema'
import { Panel } from '@/recruiter/ui'

/**
 * A single badge tile. Locked badges are dimmed; hidden+locked badges are shown as a
 * silhouette with their details concealed (DESIGN.md: hidden badges stay silhouetted,
 * invisible to recruiters). Unlocked badges show their icon and description.
 */
export function BadgeCard({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  const concealed = badge.hidden && !unlocked

  return (
    <Panel brackets={false} className={`p-4 text-center ${unlocked ? '' : 'opacity-70'}`}>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface-sunken">
        {concealed ? (
          <Lock aria-hidden className="h-6 w-6 text-ink-faint" />
        ) : (
          <img
            src={badge.icon.src}
            alt={badge.icon.alt}
            className={`h-12 w-12 object-contain [image-rendering:pixelated] ${
              unlocked ? '' : 'grayscale'
            }`}
          />
        )}
      </div>

      <p className="mt-2 font-display text-sm font-bold text-ink">
        {concealed ? '???' : badge.name}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-soft">
        {concealed ? 'A hidden badge awaits discovery.' : badge.description}
      </p>
    </Panel>
  )
}
