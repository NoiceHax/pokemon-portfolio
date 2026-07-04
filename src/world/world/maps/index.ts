import type { MapRegistry } from '../mapTypes'
import { ceruleanMap } from './cerulean'
import { INTERIOR_MAPS } from './interiors'

/**
 * The map registry - every playable area keyed by id. The WorldEngine loads maps from
 * here. Adding an area is adding it to this list; nothing else changes.
 */
export const MAP_REGISTRY: MapRegistry = Object.fromEntries(
  [ceruleanMap, ...INTERIOR_MAPS].map((m) => [m.id, m]),
)

export const START_MAP_ID = 'cerulean'
