import type { ChosenExperience } from '@/providers/SettingsProvider'

/**
 * Maps a chosen experience to its route. Single source of truth so every entry point
 * (Oak's Viewer Selection now, a "change experience" control later) agrees.
 *
 * Recruiter → Home (/home). Developer and Friend both enter the SAME Adventure
 * world; the `chosenExperience` setting is what later distinguishes their presentation
 * (docs/DECISIONS.md, decision C).
 */
export const EXPERIENCE_ROUTES = {
  recruiter: '/home',
  developer: '/adventure',
  friend: '/adventure',
} as const

export function routeForExperience(experience: ChosenExperience): string | null {
  if (experience === null) return null
  return EXPERIENCE_ROUTES[experience]
}
