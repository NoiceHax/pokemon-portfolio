import Link from 'next/link'
import {
  BookOpen,
  Trophy,
  Map,
  NotebookPen,
  HeartPulse,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { Panel } from '@/recruiter/ui'

/**
 * Quick-action navigation cards on the Trainer Card (mockup: Open Pokédex, View Gym
 * Badges, Journey So Far, Scout Journal, Pokémon Center). Each is a two-click-max
 * shortcut into the rest of the portfolio (DESIGN.md: everything within two clicks).
 */
interface Action {
  tag: string
  title: string
  description: string
  href: string
  cta: string
  icon: LucideIcon
}

const ACTIONS: Action[] = [
  {
    tag: 'No.001',
    title: 'Open Pokédex',
    description: 'Explore my projects in the research lab.',
    href: '/recruiter/pokedex',
    cta: 'View Projects',
    icon: BookOpen,
  },
  {
    tag: 'Gym 00',
    title: 'View Gym Badges',
    description: 'Achievements, certifications and milestones.',
    href: '/recruiter/badges',
    cta: 'View Badges',
    icon: Trophy,
  },
  {
    tag: 'Route Map',
    title: 'Journey So Far',
    description: 'My experience and achievements across different routes.',
    href: '/recruiter/experience',
    cta: 'View Experience',
    icon: Map,
  },
  {
    tag: 'No.007',
    title: 'Scout Journal',
    description: 'Thoughts, learnings and field notes.',
    href: '/recruiter/journal',
    cta: 'Read Journal',
    icon: NotebookPen,
  },
  {
    tag: 'Pokémon Center',
    title: 'Pokémon Center',
    description: "Let's connect and start a new adventure.",
    href: '/recruiter/pokemon-center',
    cta: 'Contact / Heal Up',
    icon: HeartPulse,
  },
]

export function QuickActions() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ACTIONS.map((action) => (
        <li key={action.title}>
          <Link
            href={action.href}
            className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
          >
            <Panel
              brackets={false}
              className="flex h-full flex-col p-4 transition-colors hover:border-poke-red"
            >
              <div className="flex items-start justify-between">
                <action.icon aria-hidden className="h-7 w-7 text-poke-red" strokeWidth={2} />
                <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-ink-faint">
                  {action.tag}
                </span>
              </div>
              <p className="mt-3 font-display text-base font-bold uppercase text-ink">
                {action.title}
              </p>
              <p className="mt-1 flex-1 font-mono text-sm text-ink-soft">{action.description}</p>
              <span className="mt-3 flex items-center gap-1 font-mono text-xs font-semibold uppercase text-poke-red">
                {action.cta}
                <ArrowRight aria-hidden className="h-3 w-3" />
              </span>
            </Panel>
          </Link>
        </li>
      ))}
    </ul>
  )
}
