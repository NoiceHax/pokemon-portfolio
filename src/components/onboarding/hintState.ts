'use client'

/**
 * Session-scoped "have we shown this hint yet?" tracker.
 *
 * Onboarding guidance should teach by playing and then get out of the way: each hint
 * fires once per browser session and never again. We use sessionStorage (not
 * localStorage) so a returning visitor on a fresh session still gets a light refresher,
 * but repeated navigation within the same session stays quiet.
 *
 * SSR-safe: every access guards `window` so this can be imported anywhere.
 */

const PREFIX = 'tc.hint.'

/** Stable ids for every one-shot hint in the app. Keep them here to avoid typos. */
export const HINT_IDS = {
  /** Global controls overlay shown when an experience first begins. */
  adventureControls: 'adventureControls',
  /** "Explore Cerulean City" objective banner on first spawn. */
  ceruleanObjective: 'ceruleanObjective',
  /** "You entered through Adventure Mode" notice on a recruiter page. */
  recruiterFromAdventure: 'recruiterFromAdventure',
} as const

export type HintId = (typeof HINT_IDS)[keyof typeof HINT_IDS] | (string & {})

/** True if this hint has already been shown this session. */
export function hasShownHint(id: HintId): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(PREFIX + id) === '1'
  } catch {
    return false
  }
}

/** Mark a hint as shown so it won't appear again this session. */
export function markHintShown(id: HintId): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(PREFIX + id, '1')
  } catch {
    // sessionStorage may be unavailable (private mode / quota). Fail silently - the
    // hint may show again, which is harmless. Never crash the interface.
  }
}
