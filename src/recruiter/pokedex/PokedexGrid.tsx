import type { Project } from '@/content/schema'
import { PokedexCard } from './PokedexCard'

/**
 * Responsive grid of Pokédex cards. Renders an empty state if there are no projects
 * (CLAUDE.md: empty states should always exist).
 */
export function PokedexGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-edge p-8 text-center font-mono text-sm text-ink-faint">
        No entries catalogued yet.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug} className="h-full">
          <PokedexCard project={project} />
        </li>
      ))}
    </ul>
  )
}
