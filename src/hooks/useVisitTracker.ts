'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { readStorage, writeStorage } from '@/lib/storage/localStorage'
import { useBadges } from '@/providers/BadgeProvider'
import { track } from '@/lib/analytics'

const VISITED_KEY = 'tc.visitedPaths'

/** The five recruiter pages that count toward the Explorer badge. */
const CORE_PAGES = [
  '/recruiter',
  '/recruiter/pokedex',
  '/recruiter/journal',
  '/recruiter/badges',
  '/recruiter/pokemon-center',
]

/**
 * Tracks which pages the visitor has seen and auto-unlocks exploration/learning
 * badges. Mounted once in the Recruiter layout. This is what makes "Explorer - visited
 * every page" actually earnable, and ties both experiences to the same badge state.
 */
export function useVisitTracker() {
  const pathname = usePathname()
  const { unlock } = useBadges()

  useEffect(() => {
    track('page_view', { path: pathname })

    const visited = new Set(readStorage<string[]>(VISITED_KEY, []))
    visited.add(pathname)
    writeStorage(VISITED_KEY, [...visited])

    // Explorer: seen all five core pages.
    if (CORE_PAGES.every((p) => visited.has(p))) unlock('explorer')

    // Curious Mind: opened at least one project entry.
    if (pathname.startsWith('/recruiter/pokedex/')) unlock('curious-mind')
    // Oak's Apprentice: opened at least one journal entry.
    if (pathname.startsWith('/recruiter/journal/')) unlock('oaks-apprentice')
    // Pathfinder: used fast/site navigation (visiting badges implies exploring the UI).
    if (pathname === '/recruiter/badges') unlock('pathfinder')
  }, [pathname, unlock])
}
