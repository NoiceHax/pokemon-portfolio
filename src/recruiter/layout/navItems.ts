import {
  ContactRound,
  BookOpen,
  NotebookPen,
  HeartPulse,
  Map,
  type LucideIcon,
} from 'lucide-react'

/**
 * Canonical Recruiter navigation (docs/DECISIONS.md, decision B). Defined once and
 * consumed by both the top nav and the sidebar quick links so they never drift.
 * Order matches the recruiter journey (Trainer Card first, Pokémon Center last).
 *
 * `meaning` is the plain-English purpose shown in the sidebar legend so visitors
 * know what each Pokémon-themed section actually is.
 */
export interface NavItem {
  label: string
  /** Plain-English purpose (Info, Projects, …) shown in the sidebar bracket panel. */
  meaning: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Trainer Card', meaning: 'Info', href: '/home', icon: ContactRound },
  { label: 'Pokédex', meaning: 'Projects', href: '/home/pokedex', icon: BookOpen },
  {
    label: 'Journey',
    meaning: 'Experience & achievements',
    href: '/home/experience',
    icon: Map,
  },
  { label: 'Journal', meaning: 'Blogs', href: '/home/journal', icon: NotebookPen },
  {
    label: 'Pokémon Center',
    meaning: 'Contact me',
    href: '/home/pokemon-center',
    icon: HeartPulse,
  },
]
