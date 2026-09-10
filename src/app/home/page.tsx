import type { Metadata } from 'next'
import { getProfile, getFeaturedProjects } from '@/lib/content'
import { Panel } from '@/recruiter/ui'
import { TrainerHeader, TrainerStats, ProjectParty, QuickActions } from '@/recruiter/trainer-card'

export const metadata: Metadata = {
  // This is the canonical URL for the Trainer Card - `/` points here - so it carries the
  // title and description a search result should show. `absolute` opts out of the Home
  // layout's "%s - Trainer Chandan" template, which would append a second copy of a name
  // this title already carries.
  title: { absolute: 'Chandan - Software Engineer Portfolio' },
  description:
    'Chandan, a software engineer in India: Pokédex projects, the journey so far, field notes and contact - a Pokémon-inspired interactive portfolio.',
  alternates: { canonical: '/home' },
}

/**
 * Trainer Card - "Who is Chandan?" (DESIGN.md). The Recruiter landing page.
 * Fully content-driven via getProfile + getFeaturedProjects.
 */
export default function TrainerCardPage() {
  const profile = getProfile()
  const featured = getFeaturedProjects()

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <TrainerHeader profile={profile} />
        <div className="mt-6">
          <TrainerStats stats={profile.stats} />
        </div>
        <div className="mt-6 border-t border-edge pt-6">
          <ProjectParty projects={featured} />
        </div>
      </Panel>

      <QuickActions />
    </div>
  )
}
