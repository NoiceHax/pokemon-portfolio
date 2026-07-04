import {
  ContactRound,
  BookOpen,
  NotebookPen,
  Trophy,
  HeartPulse,
  Map,
  type LucideIcon,
} from 'lucide-react'

/**
 * Canonical Recruiter navigation (docs/DECISIONS.md, decision B). Defined once and
 * consumed by both the top nav and the sidebar quick links so they never drift.
 * Order matches the recruiter journey (Trainer Card first, Pokémon Center last).
 */
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Trainer Card', href: '/recruiter', icon: ContactRound },
  { label: 'Pokédex', href: '/recruiter/pokedex', icon: BookOpen },
  { label: 'Journey', href: '/recruiter/experience', icon: Map },
  { label: 'Journal', href: '/recruiter/journal', icon: NotebookPen },
  { label: 'Badges', href: '/recruiter/badges', icon: Trophy },
  { label: 'Pokémon Center', href: '/recruiter/pokemon-center', icon: HeartPulse },
]
