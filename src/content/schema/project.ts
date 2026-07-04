import { z } from 'zod'
import { imageSchema, isoDateSchema, pokemonType, slugSchema, urlSchema } from './common'

/**
 * Project - "What has Chandan built?" (Pokédex).
 *
 * Each project is one Pokédex entry. Recruiter renders these as Pokédex cards +
 * detail entries; Adventure surfaces the same projects through Professor Oak's Lab.
 * Fields mirror the Pokédex mockups (dex number, status, type pills) plus the
 * DESIGN.md detail spec (architecture, challenges, gallery, lessons).
 */

/** Deployment status shown as the colored dot on a Pokédex card. */
export const projectStatus = z.enum(['production', 'prototype', 'archived', 'concept'])
export type ProjectStatus = z.infer<typeof projectStatus>

/** A labelled outbound link (repo, live demo, case study, etc.). */
export const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: urlSchema,
  kind: z.enum(['repo', 'live', 'demo', 'writeup', 'other']).default('other'),
})
export type ProjectLink = z.infer<typeof projectLinkSchema>

export const projectSchema = z.object({
  slug: slugSchema,
  /** Pokédex number, e.g. 1 → "No. 001". Unique and stable. */
  dexNumber: z.number().int().positive(),
  title: z.string().min(1),
  /** One-line summary shown on the card. */
  summary: z.string().min(1),
  status: projectStatus,
  /** Domain "type" tags rendered as Pokédex type pills. At least one. */
  types: z.array(pokemonType).min(1),
  /** Card / hero image (required alt for a11y). */
  cover: imageSchema,
  /** Tech stack, e.g. ["Next.js", "FastAPI", "Postgres"]. */
  stack: z.array(z.string().min(1)),
  links: z.array(projectLinkSchema).default([]),

  /** One-paragraph answer to "what problem does this solve?" Shown on both the card and detail view. */
  problemSolved: z.string().optional(),
  /** Long-form detail (DESIGN.md Pokédex entry). Optional so a project can start light. */
  description: z.string().optional(),
  architecture: z.string().optional(),
  challenges: z.array(z.string().min(1)).optional(),
  lessons: z.array(z.string().min(1)).optional(),
  gallery: z.array(imageSchema).optional(),

  featured: z.boolean().default(false),
  date: isoDateSchema.optional(),
  isPlaceholder: z.boolean().default(false),
})

export type Project = z.infer<typeof projectSchema>
/** Authoring type: fields with schema defaults (links, featured, isPlaceholder) are optional. */
export type ProjectInput = z.input<typeof projectSchema>
