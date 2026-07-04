/**
 * SSR-safe localStorage wrapper.
 *
 * All persisted client state (first-visit flag, mute, badge progress, save state)
 * goes through here so we never touch `window` during server rendering - a common
 * Next.js hydration-mismatch trap.
 */

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable (private mode, quota). Fail silently - settings
    // simply won't persist. Never crash the interface (CLAUDE.md: fail gracefully).
  }
}

/** Storage keys live in one place to avoid typos and collisions. */
export const STORAGE_KEYS = {
  hasVisited: 'tc.hasVisited',
  muted: 'tc.muted',
  reducedMotion: 'tc.reducedMotion',
  chosenExperience: 'tc.chosenExperience',
} as const
