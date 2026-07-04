import type { BadgeInput } from '@/content/schema'

/**
 * Badge DEFINITIONS (Badge Case).
 *
 * These describe what a VISITOR can earn - they are not Chandan's achievements and
 * they carry no unlock state (that's runtime, owned by BadgeProvider in Milestone 9).
 * Copy describes visitor actions, not Chandan's facts, so it ships as-is.
 *
 * Icons are the eight real Kanto gym badges extracted from the badge case art (see
 * scripts/extract-badges.cjs → /assets/sprites/badge_*.png). Each badge is themed to a
 * gym badge; the hidden/completion badges reuse the most fitting icons.
 */
const badgeIcon = (kind: string, alt: string) => ({
  src: `/assets/sprites/badge_${kind}.png`,
  alt,
})

export const badges: BadgeInput[] = [
  // Exploration
  {
    slug: 'explorer',
    name: 'Explorer',
    description: 'Visited every page in the portfolio.',
    category: 'exploration',
    rarity: 'common',
    icon: badgeIcon('boulder', 'Explorer badge'),
    flavor: 'The journey of a thousand miles begins with a single click. - Prof. Oak',
  },
  {
    slug: 'world-traveller',
    name: 'World Traveller',
    description: 'Explored every section in one session.',
    category: 'exploration',
    rarity: 'uncommon',
    icon: badgeIcon('cascade', 'World Traveller badge'),
    goal: 1,
  },
  {
    slug: 'pathfinder',
    name: 'Pathfinder',
    description: 'Used the site map to navigate.',
    category: 'exploration',
    rarity: 'common',
    icon: badgeIcon('thunder', 'Pathfinder badge'),
  },
  {
    slug: 'backpacker',
    name: 'Backpacker',
    description: 'Visited the site 7 days in a row.',
    category: 'exploration',
    rarity: 'rare',
    icon: badgeIcon('rainbow', 'Backpacker badge'),
    goal: 7,
  },
  // Learning
  {
    slug: 'oaks-apprentice',
    name: "Oak's Apprentice",
    description: 'Read every entry in the Journal.',
    category: 'learning',
    rarity: 'uncommon',
    icon: badgeIcon('marsh', "Oak's Apprentice badge"),
  },
  {
    slug: 'researcher',
    name: 'Researcher',
    description: 'Spent 10+ minutes reading an article.',
    category: 'learning',
    rarity: 'common',
    icon: badgeIcon('volcano', 'Researcher badge'),
  },
  {
    slug: 'architect',
    name: 'Architect',
    description: 'Opened every architecture diagram.',
    category: 'learning',
    rarity: 'rare',
    icon: badgeIcon('earth', 'Architect badge'),
  },
  // Projects
  {
    slug: 'curious-mind',
    name: 'Curious Mind',
    description: 'Opened every project in the Pokédex.',
    category: 'projects',
    rarity: 'uncommon',
    icon: badgeIcon('soul', 'Curious Mind badge'),
  },
  {
    slug: 'deep-diver',
    name: 'Deep Diver',
    description: 'Expanded and viewed details of all projects.',
    category: 'projects',
    rarity: 'rare',
    icon: badgeIcon('thunder', 'Deep Diver badge'),
  },
  // Hidden / completion
  {
    slug: 'secret-finder',
    name: 'Secret Finder',
    description: 'Found the hidden easter egg.',
    category: 'hidden',
    rarity: 'rare',
    icon: badgeIcon('volcano', 'Secret Finder badge'),
    hidden: true,
  },
  {
    slug: 'completionist',
    name: 'Completionist',
    description: 'Unlocked every badge.',
    category: 'hidden',
    rarity: 'legendary',
    icon: badgeIcon('rainbow', 'Completionist badge'),
    hidden: true,
  },
]
