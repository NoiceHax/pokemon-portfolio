import { z } from 'zod'
import { imageSchema, slugSchema } from './common'

/**
 * Badge DEFINITION - "How much of the portfolio has the visitor explored?"
 *
 * Important boundary: badges belong to the VISITOR, not Chandan (DESIGN.md). This
 * schema is only the static *definition* of each badge (name, criteria, rarity,
 * whether it's hidden). The visitor's actual unlock state (unlocked?, unlockedOn,
 * progress) is runtime session data owned by BadgeProvider (Milestone 9) - it is
 * NOT content and must never be hardcoded here.
 */

/** Category tabs from the Badge Case mockup. */
export const badgeCategory = z.enum(['exploration', 'learning', 'projects', 'hidden'])
export type BadgeCategory = z.infer<typeof badgeCategory>

export const badgeRarity = z.enum(['common', 'uncommon', 'rare', 'legendary'])
export type BadgeRarity = z.infer<typeof badgeRarity>

export const badgeSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  /** What the visitor did to earn it, e.g. "Visited every page in the portfolio." */
  description: z.string().min(1),
  category: badgeCategory,
  rarity: badgeRarity.default('common'),
  icon: imageSchema,
  /**
   * Hidden badges show as silhouettes until unlocked (DESIGN.md). Recruiter-facing
   * easter-egg badges should be hidden so they stay invisible to recruiters.
   */
  hidden: z.boolean().default(false),
  /**
   * Target count for progress badges (e.g. "Visit the site 7 days" → 7). Omit for
   * boolean badges. The current progress value is runtime state, not content.
   */
  goal: z.number().int().positive().optional(),
  /** Optional flavor quote, e.g. attributed to Prof. Oak. */
  flavor: z.string().optional(),
})

export type Badge = z.infer<typeof badgeSchema>
/** Authoring type: fields with schema defaults (rarity, hidden) are optional. */
export type BadgeInput = z.input<typeof badgeSchema>
