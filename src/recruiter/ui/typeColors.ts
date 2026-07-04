import type { PokemonType } from '@/content/schema'

/**
 * Color classes for the Pokémon domain-type pills (see docs/DECISIONS.md mapping).
 * Centralized so every pill across Pokédex, Trainer Card, etc. stays consistent
 * (CLAUDE.md: extract repeated patterns; consistent interface style).
 *
 * Colors evoke the classic type palette while staying within a restrained, modern
 * scheme. Each entry is a full Tailwind class string (text + background + border).
 */
export const TYPE_PILL_CLASSES: Record<PokemonType, string> = {
  psychic: 'text-pink-700 bg-pink-50 border-pink-200',
  water: 'text-blue-700 bg-blue-50 border-blue-200',
  grass: 'text-green-700 bg-green-50 border-green-200',
  electric: 'text-amber-700 bg-amber-50 border-amber-200',
  fire: 'text-orange-700 bg-orange-50 border-orange-200',
  normal: 'text-stone-700 bg-stone-100 border-stone-200',
}

/** Human-readable domain label for each type (for tooltips / a11y). */
export const TYPE_DOMAIN_LABEL: Record<PokemonType, string> = {
  psychic: 'AI / ML',
  water: 'Web / Data',
  grass: 'Product / Growth',
  electric: 'Performance',
  fire: 'Systems / Infra',
  normal: 'Tooling',
}
