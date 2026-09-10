import type { Profile } from '@/content/schema'
import { projects as projectsData } from './projects'

/**
 * PLACEHOLDER profile data.
 *
 * Per docs/DECISIONS.md (decision E): no invented facts. Structural values match the
 * Trainer Card mockup (Trainer ID, stat layout, 6-project party) but all prose is an
 * obvious placeholder to be replaced with Chandan's real details. Featured projects
 * reference project slugs - they do not copy project data.
 */

/**
 * Years of experience, counted from an actual start date rather than a year subtraction.
 *
 * `new Date().getFullYear() - 2024` was wrong twice over: it jumped on 1 January instead
 * of the real anniversary (so for most of 2026 it over-claimed), and /home is statically
 * prerendered, so it froze at build time regardless. The page now sets `revalidate` so
 * this is recomputed daily.
 *
 * Elapsed whole months are floored to years, so the figure is never rounded up.
 */
const CAREER_START = { year: 2024, month: 1 } // Jan 2024 - matches the earliest milestone

function yearsSince({ year, month }: { year: number; month: number }): number {
  const now = new Date()
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
  return Math.max(0, Math.floor(months / 12))
}

const experienceYears = yearsSince(CAREER_START)
const projectCount = projectsData.length

export const profile: Profile = {
  name: 'Chandan',
  role: 'Software Engineer',
  region: 'India',
  trainerId: '007',
  avatar: {
    src: '/assets/sprites/red_hero.png',
    alt: 'Trainer NOICEHAX',
  },
  // Small overworld walking sprite used only in the right-hand sidebar identity.
  sidebarAvatar: {
    src: '/assets/sprites/red_down_1.png',
    alt: 'Trainer NOICEHAX',
  },
  currentQuest: 'Curious to explore, build and understand everything around tech.',
  stats: [
    { key: 'experienceYears', value: String(experienceYears), label: 'YEARS EXPERIENCE' },
    { key: 'projectCount', value: String(projectCount), label: 'POKÉDEX PROJECTS' },
  ],
  // Slugs of projects to feature in the "Current Party" (max 6). Add slugs here after
  // adding the corresponding projects in @/content/data/projects.ts.
  featuredProjectSlugs: [
    'learnflow-ai',
    'aasrah',
    'divyalipi-ai',
    'chinnaswamy-farm-stay',
    'shree-solar',
  ],
  bio: "Placeholder bio - replace with Chandan’s real summary.",
}
