import { z } from 'zod'

/**
 * Shared Zod primitives reused across every content schema.
 *
 * Defining these once keeps validation consistent (a slug is a slug everywhere)
 * and gives us a single place to tighten rules later. Nothing here is
 * presentation - these describe the SHAPE of content, which both experiences read.
 */

/** URL-safe identifier used for routing and cross-references (e.g. `neura-nexus`). */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase, hyphenated slug')

/** Absolute or root-relative URL (external links or /assets paths). */
export const urlSchema = z.string().url().or(z.string().startsWith('/'))

/** ISO date string (YYYY-MM-DD). Stored as string so content stays serializable. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date (YYYY-MM-DD)')

/** An image reference with required alt text (accessibility is non-negotiable). */
export const imageSchema = z.object({
  src: urlSchema,
  alt: z.string().min(1, 'images require alt text for accessibility'),
})
export type ContentImage = z.infer<typeof imageSchema>

/**
 * Pokémon "type" tags, repurposed as project domains. The mockups tag projects
 * Psychic / Water / Grass etc.; we map those elemental types to engineering domains
 * so the Pokédex nostalgia is preserved while the label stays meaningful.
 *
 * `label` is the human domain; the key is the Pokémon type used for color/pill.
 */
export const pokemonType = z.enum([
  'psychic', // AI / ML
  'water', // web / backend / data flow
  'grass', // growth / product
  'electric', // performance / real-time
  'fire', // systems / infra
  'normal', // tooling / general
])
export type PokemonType = z.infer<typeof pokemonType>

/**
 * Marks placeholder content so it is never mistaken for real, verified information
 * (see docs/DECISIONS.md, decision E). Loaders may surface this in dev.
 */
export const placeholderFlag = z.boolean().default(false)
