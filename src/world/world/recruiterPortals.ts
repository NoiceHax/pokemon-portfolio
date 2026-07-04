/**
 * Recruiter portal destinations - the single, data-driven mapping from a house-door
 * `destination` id to the recruiter page it previews + opens. Adding a new recruiter
 * section later = adding one entry here (and one preview renderer); no engine changes.
 *
 * Shared between the Adventure engine (which only knows ids), the preview overlay, and
 * the recruiter return flow.
 */

export type RecruiterDestinationId =
  | 'trainer-card'
  | 'pokedex'
  | 'journal'
  | 'pokemon-center'
  | 'journey'

export interface RecruiterDestination {
  id: RecruiterDestinationId
  /** Building-facing label ("looking inside…"). */
  label: string
  /** The full recruiter route the preview's CTA opens. */
  href: string
  /** CTA button text on the preview overlay. */
  cta: string
}

export const RECRUITER_DESTINATIONS: Record<RecruiterDestinationId, RecruiterDestination> = {
  'trainer-card': {
    id: 'trainer-card',
    label: 'Trainer Card',
    href: '/recruiter',
    cta: 'View Trainer Card',
  },
  pokedex: {
    id: 'pokedex',
    label: 'Pokédex',
    href: '/recruiter/pokedex',
    cta: 'View All Projects',
  },
  journal: {
    id: 'journal',
    label: 'Journal',
    href: '/recruiter/journal',
    cta: 'Read Journal',
  },
  'pokemon-center': {
    id: 'pokemon-center',
    label: 'Pokémon Center',
    href: '/recruiter/pokemon-center',
    cta: 'Open Pokémon Center',
  },
  journey: {
    id: 'journey',
    label: 'Journey So Far',
    href: '/recruiter/experience',
    cta: 'View Journey',
  },
}

/** The pool a `random` portal picks from (all real destinations). */
export const RANDOM_POOL: RecruiterDestinationId[] = [
  'trainer-card',
  'pokedex',
  'journal',
  'pokemon-center',
  'journey',
]

/** Resolve a door's `destination` to a concrete destination id (random picks from pool). */
export function resolveDestination(destination: string): RecruiterDestinationId {
  if (destination === 'random') {
    return RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)]!
  }
  if (destination in RECRUITER_DESTINATIONS) return destination as RecruiterDestinationId
  return 'trainer-card' // safe fallback
}

export function getDestination(id: RecruiterDestinationId): RecruiterDestination {
  return RECRUITER_DESTINATIONS[id]
}
