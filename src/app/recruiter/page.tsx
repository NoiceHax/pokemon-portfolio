import { getProfile, getFeaturedProjects } from '@/lib/content'
import { Panel } from '@/recruiter/ui'
import { TrainerHeader, TrainerStats, ProjectParty, QuickActions } from '@/recruiter/trainer-card'

export const metadata = {
  title: 'Trainer Card',
  description: 'Who is Chandan? Class, region, current quest, stats and featured projects.',
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
