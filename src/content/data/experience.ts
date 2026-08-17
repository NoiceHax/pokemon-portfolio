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
      'Developed and deployed client websites including Sneha Sammilana Foundation, Shree Solar Systems, and Chinnaswamy Farm, modernizing legacy web experiences and building responsive production-ready interfaces. Handled end-to-end development including frontend architecture, backend integration, deployment, domain configuration, and infrastructure setup.',
    current: true,
  },

  {
    slug: 'open-source-contribution',
    year: 'Jan 2026 - Present',
    location: 'Open Source',
    role: 'Open Source Contributor',
    description:
      '40+ merged PRs across 35+ open-source projects in Python, TypeScript, and C++, spanning ML libraries (huggingface_hub, pydantic, kornia, marimo), web frameworks (litestar, better-auth, authentik, superset), and infra tooling (frigate, dokploy, immich). Resolved production bugs and improved reliability across ML, web, and infrastructure projects, including numerical stability fixes, authentication and authorization fixes, CLI improvements, data validation, and resource handling.',
    current: true,
  },
]
