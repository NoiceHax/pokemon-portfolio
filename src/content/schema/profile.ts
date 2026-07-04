import { z } from 'zod'
import { imageSchema, slugSchema, urlSchema } from './common'

/**
 * Profile - "Who is Chandan?" (Trainer Card).
 *
 * Exactly one profile exists. Both experiences read it: Recruiter renders the
 * Trainer Card; Adventure surfaces the same facts through the player character and
 * NPCs. Fields mirror the Trainer Card mockup (class, region, quest, stats, party).
 */

/** A single headline statistic shown on the Trainer Card (e.g. "3 YRS EXPERIENCE"). */
export const trainerStatSchema = z.object({
  /** Machine key so a stat can be referenced/derived, e.g. `experienceYears`. */
  key: z.string().min(1),
  /** Large value, kept as string to allow "3", "6", "8+", etc. */
  value: z.string().min(1),
  /** Short caption under the value, e.g. "YEARS EXPERIENCE". */
  label: z.string().min(1),
})
export type TrainerStat = z.infer<typeof trainerStatSchema>

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Trainer "class" - the role, e.g. "Software Engineer". */
  role: z.string().min(1),
  region: z.string().min(1),
  /** Displayed Trainer ID (e.g. "080295"). Cosmetic identifier, not sensitive. */
  trainerId: z.string().min(1),
  /** Large hero portrait shown on the Trainer Card header. */
  avatar: imageSchema,
  /** Small overworld sprite shown in the right sidebar identity (falls back to avatar). */
  sidebarAvatar: imageSchema.optional(),
  /** The one-line "Current Quest" quote on the Trainer Card. */
  currentQuest: z.string().min(1),
  stats: z.array(trainerStatSchema),
  /**
   * "Current Party" - featured projects by slug. References the Project content;
   * it does NOT copy project data (single source of truth). Max 6, like a party.
   */
  featuredProjectSlugs: z.array(slugSchema).max(6),
  /** Optional short bio for SEO / meta. */
  bio: z.string().optional(),
  resumeUrl: urlSchema.optional(),
})

export type Profile = z.infer<typeof profileSchema>
