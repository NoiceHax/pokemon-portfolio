import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/content/schema'
import { Panel, TypePill, StatusDot } from '@/recruiter/ui'
import { ProjectCover } from './ProjectCover'

/**
 * A single Pokédex card (mockup: No., status, cover, title, type pills, View Entry).
 * Links to the full entry.
 */
export function PokedexCard({ project }: { project: Project }) {
  const dexLabel = `No. ${String(project.dexNumber).padStart(3, '0')}`
  return (
    <Panel brackets={false} className="flex h-full flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-poke-red-dark">{dexLabel}</span>
        <StatusDot status={project.status} />
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-edge bg-surface-sunken">
        {/* Card width: the Pokedex grid runs 3-up from xl and 2-up from sm; the same card
            also appears in the Adventure preview modal, which is narrower than either. */}
        <ProjectCover
          project={project}
          className="h-36"
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 90vw"
        />
      </div>

      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-ink-faint">Project Title</p>
      <p className="font-display text-lg font-bold text-ink">{project.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs text-ink-faint">Type</span>
        {project.types.map((type) => (
          <TypePill key={type} type={type} />
        ))}
      </div>

      {project.problemSolved ? (
        <div className="mt-3 border-t border-edge pt-3">
          <p className="font-mono text-xs uppercase tracking-wide text-poke-red-dark">
            Problem Solved
          </p>
          <p className="mt-1 line-clamp-3 font-sans text-xs leading-relaxed text-ink-soft">
            {project.problemSolved}
          </p>
        </div>
      ) : null}

      <Link
        href={`/home/pokedex/${project.slug}`}
        className="mt-4 flex min-h-11 items-center justify-between rounded-md border border-edge px-3 py-3 font-mono text-sm text-poke-red-dark transition-colors hover:border-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
      >
        View Entry
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </Panel>
  )
}
