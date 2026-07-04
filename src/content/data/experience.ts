import type { ExperienceInput } from '@/content/schema'

/**
 * Experience data (Journey So Far / route map).
 *
 * Placeholder milestones were removed. The user adds these via the Control Room; this
 * file is the static fallback used when none are configured there.
 *
 * To add a milestone here: push an object below (see ExperienceInput /
 * experienceMilestoneSchema in @/content/schema/experience.ts). Required: slug, year,
 * location, role, description, current. Exactly one milestone should have `current: true`.
 */

export const experience: ExperienceInput = [
  {
    slug: 'scaler-school-of-technology',
    year: '2024 - Present',
    location: 'Scaler School of Technology',
    role: 'B.S. Computer Science',
    description:
      'Pursuing a Bachelor of Science in Computer Science while specializing in full stack development, artificial intelligence, system design, and software engineering through project based learning.',
    current: true,
  },

  {
    slug: 'freelance-full-stack-developer',
    year: '2025 - Present',
    location: 'Remote',
    role: 'Freelance Full Stack Developer',
    description:
      'Designing and building modern web applications for clients using Next.js, React, TypeScript, FastAPI, and cloud technologies. Delivered production-ready platforms with scalable architectures, AI integrations, performance optimizations, and maintainable developer workflows.',
    current: true,
  },
]
