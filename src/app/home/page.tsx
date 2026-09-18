import type { Metadata } from 'next'
import { getProfile, getFeaturedProjects } from '@/lib/content'
import { Panel } from '@/recruiter/ui'
import { TrainerHeader, TrainerStats, ProjectParty, QuickActions } from '@/recruiter/trainer-card'

/**
 * The Trainer Card shows a years-of-experience figure derived from the current date
 * (see content/data/profile.ts). This page is otherwise fully static, so without a
 * revalidate the number would be frozen at whatever the last manual deploy computed -
 * and deploys here are manual. One day is far finer than the annual granularity of the
 * value, and the page has no other time-dependent content.
 */
export const revalidate = 86400

export const metadata: Metadata = {
  // `/` is the canonical URL for the Trainer Card and this route is the alternate, so
  // the two deliberately carry identical title and description text: it is one page on
  // two URLs, and a crawler that reaches this one should see nothing that contradicts
  // what `/` claims. `absolute` opts out of the Home layout's "%s - Trainer Chandan"
  // template, which would append a second copy of a name this title already carries.
  title: { absolute: 'Chandan - Software Engineer Portfolio' },
  description:
    'Chandan, a software engineer in India: Pokédex projects, the journey so far, field notes and contact - a Pokémon-inspired interactive portfolio.',
  alternates: { canonical: '/' },
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
