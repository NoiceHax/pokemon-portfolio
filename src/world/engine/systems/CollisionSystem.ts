import type { MapData } from '@/world/world/mapTypes'
import { entityIsSolid, type WorldEntity } from '@/world/entities/entityTypes'
import type { TileCoord } from '../types'

/**
 * CollisionSystem - the single authority on whether a tile can be entered. Pure and
 * stateless. No other system checks collisions directly (the prompt's rule); movement
 * asks here.
 *
 * A tile is blocked if it is out of bounds, a solid map tile (`#`), occupied by a solid
 * entity (sign/NPC/door), or reserved by another moving actor (its `occupied` tiles) -
 * so the player and wandering NPCs can never step onto the same tile.
 */
export class CollisionSystem {
  isBlocked(
    map: MapData,
    entities: WorldEntity[],
    occupied: TileCoord[],
    x: number,
    y: number,
  ): boolean {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return true
    const row = map.collision[y]
    if (!row || row[x] !== '.') return true
    if (entities.some((e) => entityIsSolid(e) && e.position.x === x && e.position.y === y)) {
      return true
    }
    return occupied.some((t) => t.x === x && t.y === y)
  }
}
