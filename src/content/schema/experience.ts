import { z } from 'zod'
import { slugSchema } from './common'

/**
 * Experience - "What kind of journey has Chandan had?" (Journey So Far / route map).
 *
 * The Trainer Journey mockup renders career stages as towns on a route (Pallet →
 * Pewter → Cerulean → Saffron → Indigo). Each milestone maps a real career step to a
 * Pokémon location for nostalgia. Recruiter renders the route map; Adventure can
 * reuse the same data to theme areas.
 *
 * Note: the "current location" here is career progression and is INDEPENDENT of the
 * Adventure Mode spawn point, which is always Cerulean City (docs/DECISIONS.md, D).
 */
export const experienceMilestoneSchema = z.object({
  slug: slugSchema,
  /** Year label, e.g. "2020". String to allow ranges like "2020–21" if needed. */
  year: z.string().min(1),
  /** Pokémon location used as the metaphor, e.g. "Pallet Town". */
  location: z.string().min(1),
  /** Real role/stage, e.g. "BSc CS" or "Sr. Engineer". */
  role: z.string().min(1),
  /** One-line description of the stage. */
  description: z.string().min(1),
  /** Marks the current/most-recent stage (highlighted on the route). */
  current: z.boolean().default(false),
  isPlaceholder: z.boolean().default(false),
})
export type ExperienceMilestone = z.infer<typeof experienceMilestoneSchema>

/** The ordered journey is a list of milestones. */
export const experienceSchema = z.array(experienceMilestoneSchema)
export type Experience = z.infer<typeof experienceSchema>
/** Authoring type: fields with schema defaults (current, isPlaceholder) are optional. */
export type ExperienceInput = z.input<typeof experienceSchema>
