'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { readStorage, writeStorage } from '@/lib/storage/localStorage'
import { getBadges } from '@/lib/content'
import { track } from '@/lib/analytics'

/**
 * Visitor badge state (Milestone 9). Badges belong to the VISITOR, not Chandan
 * (DESIGN.md), so unlock state is runtime and persisted locally - it is NOT content.
 * Both experiences share this one provider, so a badge earned in Adventure shows in
 * the Recruiter Badge Case and vice-versa.
 */

const STORAGE_KEY = 'tc.badges.unlocked'

interface BadgeContextValue {
  unlockedSlugs: ReadonlySet<string>
  unlockedCount: number
  totalCount: number
  isUnlocked: (slug: string) => boolean
  /** Unlock a badge (idempotent). Fires a subtle event + analytics. */
  unlock: (slug: string) => void
  /** The slug most recently unlocked this session (for a toast), or null. */
  lastUnlocked: string | null
  clearLastUnlocked: () => void
}

const BadgeContext = createContext<BadgeContextValue | null>(null)

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const totalCount = getBadges().length
  const validSlugs = useMemo(() => new Set(getBadges().map((b) => b.slug)), [])

  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null)
  const hydrated = useRef(false)

  useEffect(() => {
    const saved = readStorage<string[]>(STORAGE_KEY, [])
    setUnlocked(new Set(saved.filter((s) => validSlugs.has(s))))
    hydrated.current = true
  }, [validSlugs])

  const unlock = useCallback(
    (slug: string) => {
      if (!validSlugs.has(slug)) return
      setUnlocked((prev) => {
        if (prev.has(slug)) return prev
        const next = new Set(prev)
        next.add(slug)
        writeStorage(STORAGE_KEY, [...next])
        setLastUnlocked(slug)
        track('badge_unlocked', { slug })
        return next
      })
    },
    [validSlugs],
  )

  const value = useMemo<BadgeContextValue>(
    () => ({
      unlockedSlugs: unlocked,
      unlockedCount: unlocked.size,
      totalCount,
      isUnlocked: (slug) => unlocked.has(slug),
      unlock,
      lastUnlocked,
      clearLastUnlocked: () => setLastUnlocked(null),
    }),
    [unlocked, totalCount, unlock, lastUnlocked],
  )

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>
}

export function useBadges(): BadgeContextValue {
  const ctx = useContext(BadgeContext)
  if (ctx === null) throw new Error('useBadges must be used within a BadgeProvider')
  return ctx
}
