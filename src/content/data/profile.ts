import type { Profile } from '@/content/schema'
import { projects as projectsData } from './projects'
import { experience as experienceData } from './experience'

/**
 * PLACEHOLDER profile data.
 *
 * Per docs/DECISIONS.md (decision E): no invented facts. Structural values match the
 * Trainer Card mockup (Trainer ID, stat layout, 6-project party) but all prose is an
 * obvious placeholder to be replaced with Chandan's real details. Featured projects
 * reference project slugs - they do not copy project data.
 */

// Compute stats dynamically from data
const currentYear = new Date().getFullYear()
const experienceYears = currentYear - 2024
const projectCount = projectsData.length
const badgeCount = experienceData.length

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
    { key: 'experienceYears', value: String(Math.max(0, experienceYears)), label: 'YEARS EXPERIENCE' },
    { key: 'projectCount', value: String(projectCount), label: 'POKÉDEX PROJECTS' },
    { key: 'badgeCount', value: String(badgeCount), label: 'GYM BADGES EARNED' },
  ],
  // Slugs of projects to feature in the "Current Party" (max 6). Add slugs here after
  // adding the corresponding projects in @/content/data/projects.ts.
  featuredProjectSlugs: [
    'learnflow-ai',
    'aasrah',
    'divyalipi-ai',
    'ssf-platform',
    'ai-scanner',
    'pokedex-portfolio',
  ],
  bio: "Placeholder bio - replace with Chandan’s real summary.",
}
