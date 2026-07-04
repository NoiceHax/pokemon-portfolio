import { MapPin } from 'lucide-react'
import type { Experience } from '@/content/schema'
import { Panel } from '@/recruiter/ui'

/**
 * Journey Timeline - the "Journey So Far" route rendered as a vertical, scrollable
 * Pokémon-style trail. Milestones are shown LATEST-FIRST (newest on top), so scrolling
 * down walks back through the journey. A dotted route line connects the town markers
 * (Poké Ball nodes), and the current stage is highlighted like the player's position on
 * a region map.
 *
 * Pure data consumer: driven entirely by the shared `experience` content (no duplication).
 */
export function JourneyTimeline({ milestones }: { milestones: Experience }) {
  // Content is authored oldest → newest; show newest first (latest on top).
  const ordered = [...milestones].reverse()

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-dashed border-poke-red/40 pl-8">
      {ordered.map((m) => (
        <li key={m.slug} className="relative">
          {/* Route node - a Poké Ball marker sitting on the trail line. */}
          <span
            aria-hidden
            className={`absolute -left-[2.6rem] top-1 grid h-6 w-6 place-items-center rounded-full border-2 ${
              m.current
                ? 'border-poke-red bg-gradient-to-b from-poke-red from-50% to-surface-raised to-50%'
                : 'border-ink/60 bg-gradient-to-b from-ink/40 from-50% to-surface-raised to-50%'
            }`}
          >
            <span className="h-2 w-2 rounded-full border border-ink/60 bg-surface-raised" />
          </span>

          <Panel
            brackets={m.current}
            className={`p-4 ${m.current ? 'border-poke-red' : ''}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-soft">
                <MapPin aria-hidden className="h-3.5 w-3.5 text-poke-red" />
                {m.location}
              </span>
              <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-ink-faint">
                {m.year}
                {m.current ? ' · Now' : ''}
              </span>
            </div>
            <p className="mt-2 font-display text-base font-bold uppercase text-ink">{m.role}</p>
            <p className="mt-1 font-mono text-sm text-ink-soft">{m.description}</p>
          </Panel>
        </li>
      ))}
    </ol>
  )
}
