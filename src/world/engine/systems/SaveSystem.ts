import type { Direction, TileCoord } from '../types'

/**
 * The serializable shape of a saved world (the prompt's save contract). Only plain
 * data - never runtime objects, systems, or React state.
 */
export interface WorldSave {
  currentMap: string
  playerPosition: TileCoord
  playerDirection: Direction
  visitedAreas: string[]
  triggeredEvents: string[]
  selectedExperience: string | null
}

/**
 * SaveSystem - validates and normalizes saves. Persistence (localStorage) lives in
 * lib/storage; this system only guarantees a save is well-formed and safe to load, so
 * a stale or hand-edited save can never crash the engine.
 */
export class SaveSystem {
  isValid(save: unknown, knownMaps: Set<string>): save is WorldSave {
    if (!save || typeof save !== 'object') return false
    const s = save as Partial<WorldSave>
    return (
      typeof s.currentMap === 'string' &&
      knownMaps.has(s.currentMap) &&
      !!s.playerPosition &&
      typeof s.playerPosition.x === 'number' &&
      typeof s.playerPosition.y === 'number' &&
      typeof s.playerDirection === 'string'
    )
  }
}
