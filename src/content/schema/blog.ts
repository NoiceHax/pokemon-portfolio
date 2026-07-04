import { z } from 'zod'
import { imageSchema, isoDateSchema, slugSchema } from './common'

/**
 * Journal entry (a.k.a. Blog) - "How does Chandan think?"
 *
 * The DESIGN.md "Journal" is a research notebook. Entry bodies are authored in MDX;
 * this schema validates the FRONTMATTER. The MDX body is loaded separately by the
 * content loader (Milestone 2 loaders / MDX support).
 *
 * Entry types mirror the Journal mockup filter chips.
 */
export const journalEntryType = z.enum([
  'field-note',
  'build-log',
  'research',
  'learning',
  'thought',
  'article',
])
export type JournalEntryType = z.infer<typeof journalEntryType>

export const blogFrontmatterSchema = z.object({
  slug: slugSchema,
  /** Sequential entry number shown as "#12" in the list. */
  entryNumber: z.number().int().positive(),
  type: journalEntryType,
  title: z.string().min(1),
  /** One or two line summary shown in the list. */
  excerpt: z.string().min(1),
  date: isoDateSchema,
  /** Estimated read time in minutes (shown as "7 min read"). */
  readMinutes: z.number().int().positive(),
  tags: z.array(z.string().min(1)).default([]),
  cover: imageSchema.optional(),
  /** Optionally link an entry to the project it documents (by slug). */
  relatedProjectSlug: slugSchema.optional(),
  draft: z.boolean().default(false),
  isPlaceholder: z.boolean().default(false),
})
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>
/** Authoring type: fields with schema defaults (tags, draft, isPlaceholder) are optional. */
export type BlogFrontmatterInput = z.input<typeof blogFrontmatterSchema>

/** A fully-loaded entry: validated frontmatter + its rendered MDX body. */
export interface JournalEntry extends BlogFrontmatter {
  /** Raw MDX source; rendering is the presentation layer's job. */
  body: string
}
