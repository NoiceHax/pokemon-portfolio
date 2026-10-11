import { GraduationCap, MapPin } from 'lucide-react'
import type { Experience, ExperienceMilestone } from '@/content/schema'
import { Panel } from '@/recruiter/ui'

/**
 * Journey Timeline - the "Journey So Far" route rendered as a vertical, scrollable
 * Pokémon-style trail. Milestones are shown LATEST-FIRST (newest on top), so scrolling
 * down walks back through the journey. A dotted route line connects the town markers
 * (Poké Ball nodes), and the current stage is highlighted like the player's position on
 * a region map.
 *
 * Milestones sharing a `group` (e.g. a degree and the programme it runs alongside) form a
 * single stop: one node, one card, members in their authored order.
 *
 * Pure data consumer: driven entirely by the shared `experience` content (no duplication).
 */

/** One stop on the route: a lone milestone, or a group of adjacent ones. */
interface Stop {
  key: string
  label?: string
  members: ExperienceMilestone[]
}

function toStops(milestones: Experience): Stop[] {
  const stops: Stop[] = []
  for (const m of milestones) {
    const last = stops[stops.length - 1]
    if (m.group && last?.label === m.group) last.members.push(m)
    else stops.push({ key: m.slug, label: m.group, members: [m] })
  }
  // Content is authored oldest → newest; show newest first (latest on top). Members of a
  // group keep their authored order.
  return stops.reverse()
}

export function JourneyTimeline({ milestones }: { milestones: Experience }) {
  const stops = toStops(milestones)

  return (
    <ol className="relative ml-2 space-y-6 border-l-2 border-dashed border-poke-red/40 pl-6 sm:ml-3 sm:pl-8">
      {stops.map((stop) => {
        const current = stop.members.some((m) => m.current)
        return (
          <li key={stop.key} className="relative">
            {/* Route node - a Poké Ball marker sitting on the trail line. */}
            <span
              aria-hidden
              className={`absolute -left-[2rem] top-1 grid h-6 w-6 place-items-center rounded-full border-2 sm:-left-[2.6rem] ${
                current
                  ? 'border-poke-red bg-gradient-to-b from-poke-red from-50% to-surface-raised to-50%'
                  : 'border-ink/60 bg-gradient-to-b from-ink/40 from-50% to-surface-raised to-50%'
              }`}
            >
              <span className="h-2 w-2 rounded-full border border-ink/60 bg-surface-raised" />
            </span>

            <Panel brackets={current} className={`p-4 ${current ? 'border-poke-red' : ''}`}>
              {stop.label && stop.members.length > 1 ? (
                <p className="mb-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-poke-red">
                  <GraduationCap aria-hidden className="h-3.5 w-3.5" />
                  {stop.label}
                </p>
              ) : null}
              <div className="divide-y divide-edge">
                {stop.members.map((m) => (
                  <MilestoneBody key={m.slug} m={m} />
                ))}
              </div>
            </Panel>
          </li>
        )
      })}
    </ol>
  )
}

function MilestoneBody({ m }: { m: ExperienceMilestone }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-soft">
          <MapPin aria-hidden className="h-3.5 w-3.5 text-poke-red" />
          {m.location}
        </span>
        <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-xs uppercase text-ink-faint">
          {m.year}
          {m.current ? ' · Now' : ''}
        </span>
      </div>
      <p className="mt-2 font-display text-base font-bold uppercase text-ink">{m.role}</p>
      <p className="mt-1 font-mono text-sm text-ink-soft">{m.description}</p>
    </div>
  )
}
