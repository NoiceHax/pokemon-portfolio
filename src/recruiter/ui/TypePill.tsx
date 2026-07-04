import type { PokemonType } from '@/content/schema'
import { TYPE_DOMAIN_LABEL, TYPE_PILL_CLASSES } from './typeColors'

/**
 * A Pokémon-type pill (repurposed as an engineering-domain tag). The visible label is
 * the type name; the human domain is exposed via title/aria for clarity.
 */
export function TypePill({ type }: { type: PokemonType }) {
  return (
    <span
      title={TYPE_DOMAIN_LABEL[type]}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs font-medium capitalize ${TYPE_PILL_CLASSES[type]}`}
    >
      {type}
    </span>
  )
}
