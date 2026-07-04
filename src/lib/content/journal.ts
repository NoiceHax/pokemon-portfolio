import type { ComponentType } from 'react'
import { blogFrontmatterSchema, type BlogFrontmatter } from '@/content/schema'
import { validateContent } from './validate'

// Static imports of MDX entries. Adding an entry = add a file in
// @/content/data/journal/ + one `import * as x from '...'` line here, then add `x` to
// the `modules` array below. Placeholder entries were removed; add real ones the same way.

/** The shape of an imported journal .mdx module (see mdx.d.ts). */
type MdxModule = {
  default: ComponentType
  frontmatter: unknown
}

/** A loaded entry: validated frontmatter + the MDX body as a React component. */
export interface JournalEntryModule {
  frontmatter: BlogFrontmatter
  Body: ComponentType
}

const modules: MdxModule[] = []

function toEntry(mod: MdxModule): JournalEntryModule {
  const frontmatter = validateContent(blogFrontmatterSchema, mod.frontmatter, 'journal frontmatter')
  return { frontmatter, Body: mod.default }
}

/** All non-draft entries, newest first. Drafts are hidden outside development. */
export function getJournalEntries(): JournalEntryModule[] {
  return modules
    .map(toEntry)
    .filter((entry) => process.env.NODE_ENV === 'development' || !entry.frontmatter.draft)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
}

export function getJournalEntry(slug: string): JournalEntryModule | undefined {
  return getJournalEntries().find((entry) => entry.frontmatter.slug === slug)
}

/**
 * DB-first frontmatter list for the Journal index. When NeonDB is configured and has
 * posts, those are used; otherwise it falls back to the bundled static MDX entries so the
 * Journal is never empty. Server-only (awaits the DB).
 */
export async function getJournalFrontmatter(): Promise<BlogFrontmatter[]> {
  const { getDbBlogPosts } = await import('@/lib/db/blogPosts')
  const dbPosts = await getDbBlogPosts()
  if (dbPosts && dbPosts.length > 0) return dbPosts.map((p) => p.frontmatter)
  return getJournalEntries().map((e) => e.frontmatter)
}
