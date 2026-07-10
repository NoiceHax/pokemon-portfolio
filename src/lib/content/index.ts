/**
 * Content API - the single source of truth surface.
 *
 * Both experiences (Recruiter and Adventure) read content ONLY through these
 * accessors. They never import from `@/content/data` directly. This is what makes
 * "changing one project updates every experience" true: there is exactly one path
 * from data to UI, and it validates on the way.
 */
import {
  profileSchema,
  projectSchema,
  contactSchema,
  experienceSchema,
  type Profile,
  type Project,
  type Contact,
  type Experience,
} from '@/content/schema'
import { profile as profileData } from '@/content/data/profile'
import { projects as projectsData } from '@/content/data/projects'
import { contact as contactData } from '@/content/data/contact'
import { experience as experienceData } from '@/content/data/experience'
import { validateContent } from './validate'

export function getProfile(): Profile {
  return validateContent(profileSchema, profileData, 'profile')
}

export function getProjects(): Project[] {
  const projects = projectsData.map((project, i) =>
    validateContent(projectSchema, project, `project[${i}] (${project.slug ?? '?'})`),
  )
  // Stable ordering by Pokédex number so the grid is deterministic.
  return [...projects].sort((a, b) => a.dexNumber - b.dexNumber)
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

/** Featured projects in the order the profile lists them ("Current Party"). */
export function getFeaturedProjects(): Project[] {
  const bySlug = new Map(getProjects().map((p) => [p.slug, p]))
  return getProfile()
    .featuredProjectSlugs.map((slug) => bySlug.get(slug))
    .filter((p): p is Project => p !== undefined)
}

export function getContact(): Contact {
  return validateContent(contactSchema, contactData, 'contact')
}

export function getExperience(): Experience {
  return validateContent(experienceSchema, experienceData, 'experience')
}

export { getJournalEntries, getJournalEntry } from './journal'
export type { JournalEntryModule } from './journal'
