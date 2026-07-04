'use client'

import { getBadges } from '@/lib/content'
import { useBadges } from '@/providers/BadgeProvider'

/** Sidebar badge rail - live unlock state; locked badges are dimmed/grayscale. */
export function SidebarBadgeRail() {
  const badges = getBadges()
  const { isUnlocked, unlockedCount, totalCount } = useBadges()

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const unlocked = isUnlocked(badge.slug)
          return (
            <img
              key={badge.slug}
              src={badge.icon.src}
              alt={badge.icon.alt}
              title={unlocked ? badge.name : `${badge.name} (locked)`}
              className={`h-6 w-6 object-contain [image-rendering:pixelated] ${
                unlocked ? '' : 'opacity-30 grayscale'
              }`}
            />
          )
        })}
      </div>
      <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {unlockedCount} / {totalCount} badges earned
      </p>
    </div>
  )
}
