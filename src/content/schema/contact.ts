import { z } from 'zod'
import { urlSchema } from './common'

/**
 * Contact - "How can someone reach Chandan?" (Pokémon Center).
 *
 * Exactly one contact record. Recruiter renders the Pokémon Center contact panel;
 * Adventure surfaces the same links inside the Pokémon Center building.
 */

/** A single contact channel rendered as a row (icon + label + link). */
export const contactChannelSchema = z.object({
  key: z.enum(['email', 'github', 'linkedin', 'resume', 'twitter', 'website']),
  label: z.string().min(1),
  /** `mailto:` for email, otherwise a URL. */
  href: z.string().min(1),
})
export type ContactChannel = z.infer<typeof contactChannelSchema>

export const contactSchema = z.object({
  /** Welcoming blurb shown in the Pokémon Center panel. */
  blurb: z.string().min(1),
  email: z.string().email(),
  channels: z.array(contactChannelSchema),
  resumeUrl: urlSchema.optional(),
})

export type Contact = z.infer<typeof contactSchema>
