'use client'

import { useEffect, useState } from 'react'

/**
 * Adventure → Recruiter transition state.
 *
 * When the player enters a house door in Adventure Mode, we stash everything needed to
 * (a) know the recruiter page was opened FROM Adventure (so the floating "Return to
 * Adventure" button shows) and (b) restore the exact spot on return. Persisted in
 * sessionStorage so it survives the client-side navigation to /home/* and is
 * per-tab (a visitor who opens /home directly has no state → no return button).
 *
 * We deliberately do NOT rely on URL params - the state must persist across all recruiter
 * pages the visitor browses to after arriving.
 */

const KEY = 'tc.adventureTransition'

export interface AdventureTransition {
  /** The door/building the player entered from. */
  portalId: string
  /** The resolved recruiter destination id (random already collapsed to a concrete one). */
  destination: string
  /** Engine save snapshot to restore on return (map, player position, facing…). */
  returnSnapshot: unknown
}

export function setAdventureTransition(t: AdventureTransition): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(t))
  } catch {
    /* sessionStorage unavailable - return button just won't show */
  }
}

export function getAdventureTransition(): AdventureTransition | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AdventureTransition) : null
  } catch {
    return null
  }
}

export function clearAdventureTransition(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/**
 * React hook: the current transition (or null). Reads once on mount (client only), so
 * recruiter pages can conditionally show the "Return to Adventure" button.
 */
export function useAdventureTransition(): AdventureTransition | null {
  const [transition, setTransition] = useState<AdventureTransition | null>(null)
  useEffect(() => {
    setTransition(getAdventureTransition())
  }, [])
  return transition
}
