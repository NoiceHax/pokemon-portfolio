import { Map } from 'lucide-react'
import { getExperience } from '@/lib/content'
import { PageHeader } from '@/recruiter/ui'
import { JourneyTimeline } from '@/recruiter/experience'

export const metadata = {
  title: 'Journey So Far',
  description:
    "Chandan's experience and achievements - a route map of milestones, latest first.",
}

/**
 * Experience - "Journey So Far" (the route map / achievements). Renders the shared
 * experience milestones as a scrollable Pokémon-style timeline, newest on top.
 */
export default function ExperiencePage() {
  const milestones = getExperience()
  return (
    <div>
      <PageHeader
        icon={Map}
        title="Journey So Far"
        subtitle="Experience and achievements across the route - latest first."
      />
      <JourneyTimeline milestones={milestones} />
    </div>
  )
}
