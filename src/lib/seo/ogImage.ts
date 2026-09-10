import type { BlogFrontmatter, Project } from '@/content/schema'
import { DEFAULT_OG_IMAGE } from './config'

/**
 * Which image represents a page when it is shared. Placeholder art must never be the
 * share card: projects without real cover art reuse the Town Map sprite, which reads
 * as a broken preview off-site.
 */

/** Mirrors the placeholder test in @/recruiter/pokedex/ProjectCover. */
function hasRealCover(project: Project): boolean {
  return !project.isPlaceholder && !project.cover.src.includes('/Miscellaneous/')
}

export function projectOgImage(project: Project): string {
  return hasRealCover(project) ? project.cover.src : DEFAULT_OG_IMAGE
}

/** Journal covers are optional and the DB mapper never sets one, so this is usually the default. */
export function journalOgImage(fm: BlogFrontmatter): string {
  return fm.cover?.src ?? DEFAULT_OG_IMAGE
}
