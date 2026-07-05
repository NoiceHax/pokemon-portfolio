'use client'

import { useMemo, useState } from 'react'
import type { Badge, BadgeCategory } from '@/content/schema'
import { BadgeCard } from './BadgeCard'

type Tab = BadgeCategory | 'all'

const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  exploration: 'Exploration',
  learning: 'Learning',
  projects: 'Projects',
  hidden: 'Hidden',
}

/**
 * Badge grid with category tabs (mockup). Unlock state is passed in as a set of
 * unlocked slugs; until BadgeProvider (M9) that set is empty, so everything renders
 * locked / silhouetted.
 */
export function BadgeGrid({
  badges,
  unlockedSlugs,
}: {
  badges: Badge[]
  unlockedSlugs: ReadonlySet<string>
}) {
  const [tab, setTab] = useState<Tab>('all')

  const categories = useMemo(() => {
    const present = new Set(badges.map((b) => b.category))
    return (Object.keys(CATEGORY_LABEL) as BadgeCategory[]).filter((c) => present.has(c))
  }, [badges])

  const visible = tab === 'all' ? badges : badges.filter((b) => b.category === tab)

  return (
    <div>
      <div
        className="mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter badges by category"
      >
        <Tab active={tab === 'all'} onClick={() => setTab('all')}>
          All
        </Tab>
        {categories.map((category) => (
          <Tab key={category} active={tab === category} onClick={() => setTab(category)}>
            {CATEGORY_LABEL[category]}
          </Tab>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((badge) => (
          <li key={badge.slug}>
            <BadgeCard badge={badge} unlocked={unlockedSlugs.has(badge.slug)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 items-center rounded-full border px-3 py-2 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red ${
        active
          ? 'border-poke-red bg-poke-red/5 text-poke-red'
          : 'border-edge text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
