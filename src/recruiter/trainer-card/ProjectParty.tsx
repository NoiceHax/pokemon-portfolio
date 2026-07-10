import Link from 'next/link'
import { Circle } from 'lucide-react'
import type { Project } from '@/content/schema'

/**
 * "Current Party (Featured Projects)" - the featured projects rendered as a party of
 * Poké Balls, matching the Trainer Card mockup. Each links to its Pokédex entry.
 */
export function ProjectParty({ projects }: { projects: Project[] }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink-soft">
        <Circle aria-hidden className="h-4 w-4 fill-poke-red text-poke-red" />
        Current Party (Featured Projects)
      </p>
      <ul className="flex flex-wrap gap-4">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/home/pokedex/${project.slug}`}
              className="group flex w-16 flex-col items-center gap-1 focus:outline-none"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink/70 bg-gradient-to-b from-poke-red from-50% to-surface-raised to-50% transition-transform duration-500 ease-out group-hover:rotate-180 group-focus-visible:rotate-180 group-focus-visible:ring-2 group-focus-visible:ring-poke-red">
                <span className="h-3 w-3 rounded-full border-2 border-ink/70 bg-surface-raised" />
              </span>
              <span className="w-full truncate text-center font-mono text-xs text-ink-soft group-hover:text-ink">
                {project.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
