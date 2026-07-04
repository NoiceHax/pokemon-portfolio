'use client'

import { Trophy } from 'lucide-react'
import { getBadges } from '@/lib/content'
import { useBadges } from '@/providers/BadgeProvider'
import { PageHeader } from '@/recruiter/ui'
import { BadgeGrid } from './BadgeGrid'
import { CompletionBar } from './CompletionBar'

/**
 * Badge Case content - reads live unlock state from BadgeProvider so badges earned
 * anywhere (Recruiter or Adventure) appear here. Badge definitions come from the
 * shared content layer.
 */
export function BadgeCaseView() {
  const badges = getBadges()
  const { unlockedSlugs, unlockedCount, totalCount } = useBadges()

  return (
    <div>
      <PageHeader
        icon={Trophy}
        title="Badge Case"
        subtitle="Every badge tells a story. What's yours?"
      />
      <div className="mb-6">
        <CompletionBar unlocked={unlockedCount} total={totalCount} />
        <p className="mt-2 font-mono text-xs text-ink-faint">
          Badges unlock as you explore the portfolio and the Adventure world.
        </p>
      </div>
      <BadgeGrid badges={badges} unlockedSlugs={unlockedSlugs} />
    </div>
  )
}
