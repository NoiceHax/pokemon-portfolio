import {
  ArrowUpRight,
  CirclePlay,
  FileText,
  Github,
  Globe,
  Link2,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectLink } from '@/content/schema'
import { SITE_URL } from '@/lib/seo'
import { YouAreHereButton } from './YouAreHereButton'

/**
 * Outbound project links as real buttons: a live site or demo is the primary action
 * (solid Poké-red), the repository is secondary (outlined, fills dark on hover). Each kind
 * gets its own icon so "see it running" and "read the code" are told apart at a glance.
 * Used on Pokédex cards (compact) and the full entry.
 */

// `short` is the label on a compact (card) button, where two full labels don't fit.
const KIND: Record<ProjectLink['kind'], { icon: LucideIcon; primary: boolean; short?: string }> = {
  live: { icon: Globe, primary: true, short: 'Live' },
  demo: { icon: CirclePlay, primary: true, short: 'Demo' },
  repo: { icon: Github, primary: false, short: 'Code' },
  writeup: { icon: FileText, primary: false, short: 'Read' },
  other: { icon: Link2, primary: false },
}

/** A link back to this very site (the portfolio's own entry) - see YouAreHereButton. */
function isSelf(href: string): boolean {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === new URL(SITE_URL).hostname
  } catch {
    return false
  }
}

// Live/demo first: the most useful click leads.
const ORDER: ProjectLink['kind'][] = ['live', 'demo', 'repo', 'writeup', 'other']

export function ProjectLinks({
  links,
  compact = false,
  className = '',
}: {
  links: ProjectLink[]
  compact?: boolean
  className?: string
}) {
  if (links.length === 0) return null
  const sorted = [...links].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {sorted.map((link) => {
        const { icon: Icon, primary, short } = KIND[link.kind]
        const label = compact && sorted.length > 1 && short ? short : link.label
        const buttonClass = `group/link inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 font-mono font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 active:translate-y-0 active:shadow-sm ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
        } ${
          primary
            ? 'border-poke-red bg-poke-red text-white hover:border-poke-red-dark hover:bg-poke-red-dark'
            : 'border-ink/80 bg-surface-raised text-ink hover:bg-ink hover:text-surface'
        }`
        const self = isSelf(link.href)
        const content = (
          <>
            <Icon aria-hidden className={compact ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'} />
            <span className="truncate">{label}</span>
            <ArrowUpRight
              aria-hidden
              className={`shrink-0 transition-transform duration-150 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 ${
                compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
              }`}
            />
            <span className="sr-only">
              {label !== link.label ? `: ${link.label}` : ''}
              {self ? '' : ' (opens in a new tab)'}
            </span>
          </>
        )
        return (
          <li key={link.href} className={compact ? 'min-w-0 flex-1' : ''}>
            {self ? (
              <YouAreHereButton className={buttonClass}>{content}</YouAreHereButton>
            ) : (
              <a href={link.href} target="_blank" rel="noreferrer" className={buttonClass}>
                {content}
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}
