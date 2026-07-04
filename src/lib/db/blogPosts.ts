import { sql } from './client'
import type { BlogFrontmatter } from '@/content/schema'

/** A blog post loaded from the DB: validated-shape frontmatter + raw MDX body. */
export interface DbBlogPost {
  frontmatter: BlogFrontmatter
  bodyMdx: string
}

function toPost(r: Record<string, unknown>): DbBlogPost {
  return {
    frontmatter: {
      slug: String(r.slug),
      entryNumber: Number(r.entry_number),
      type: String(r.type) as BlogFrontmatter['type'],
      title: String(r.title),
      excerpt: String(r.excerpt),
      date: (r.post_date instanceof Date ? r.post_date.toISOString() : String(r.post_date)).slice(0, 10),
      readMinutes: Number(r.read_minutes),
      tags: (r.tags as string[] | null) ?? [],
      draft: Boolean(r.draft),
      isPlaceholder: false,
    },
    bodyMdx: String(r.body_mdx ?? ''),
  }
}

/** All non-draft posts newest first, or null when the DB isn't configured (→ fallback). */
export async function getDbBlogPosts(): Promise<DbBlogPost[] | null> {
  if (!sql) return null
  try {
    const rows = (await sql`
      SELECT slug, entry_number, type, title, excerpt, body_mdx, post_date, read_minutes, tags, draft
      FROM blog_posts
      WHERE draft = false
      ORDER BY post_date DESC
    `) as Record<string, unknown>[]
    return rows.map(toPost)
  } catch {
    return null // fall back to static entries on any DB error
  }
}

export async function getDbBlogPost(slug: string): Promise<DbBlogPost | null> {
  if (!sql) return null
  try {
    const rows = (await sql`
      SELECT slug, entry_number, type, title, excerpt, body_mdx, post_date, read_minutes, tags, draft
      FROM blog_posts WHERE slug = ${slug} LIMIT 1
    `) as Record<string, unknown>[]
    return rows[0] ? toPost(rows[0]) : null
  } catch {
    return null
  }
}

/** All posts INCLUDING drafts (admin dashboard listing). */
export async function getAllDbBlogPosts(): Promise<DbBlogPost[]> {
  if (!sql) return []
  const rows = (await sql`
    SELECT slug, entry_number, type, title, excerpt, body_mdx, post_date, read_minutes, tags, draft
    FROM blog_posts ORDER BY post_date DESC
  `) as Record<string, unknown>[]
  return rows.map(toPost)
}

export interface UpsertBlogPost {
  slug: string
  entryNumber: number
  type: string
  title: string
  excerpt: string
  bodyMdx: string
  date: string
  readMinutes: number
  tags: string[]
  draft: boolean
}

/** Create or update a post (keyed by slug). Requires the DB. */
export async function upsertDbBlogPost(p: UpsertBlogPost): Promise<void> {
  if (!sql) throw new Error('DB not configured')
  await sql`
    INSERT INTO blog_posts
      (slug, entry_number, type, title, excerpt, body_mdx, post_date, read_minutes, tags, draft)
    VALUES
      (${p.slug}, ${p.entryNumber}, ${p.type}, ${p.title}, ${p.excerpt}, ${p.bodyMdx},
       ${p.date}, ${p.readMinutes}, ${p.tags}, ${p.draft})
    ON CONFLICT (slug) DO UPDATE SET
      entry_number = EXCLUDED.entry_number,
      type         = EXCLUDED.type,
      title        = EXCLUDED.title,
      excerpt      = EXCLUDED.excerpt,
      body_mdx     = EXCLUDED.body_mdx,
      post_date    = EXCLUDED.post_date,
      read_minutes = EXCLUDED.read_minutes,
      tags         = EXCLUDED.tags,
      draft        = EXCLUDED.draft
  `
}

export async function deleteDbBlogPost(slug: string): Promise<void> {
  if (!sql) throw new Error('DB not configured')
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`
}
