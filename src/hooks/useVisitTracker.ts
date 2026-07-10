'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { readStorage, writeStorage } from '@/lib/storage/localStorage'
import { track } from '@/lib/analytics'

const VISITED_KEY = 'tc.visitedPaths'

/**
 * Tracks which pages the visitor has seen and records page_view analytics.
 * Mounted once in the Recruiter layout.
 */
export function useVisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    track('page_view', { path: pathname })

    const visited = new Set(readStorage<string[]>(VISITED_KEY, []))
    visited.add(pathname)
    writeStorage(VISITED_KEY, [...visited])
  }, [pathname])
}
