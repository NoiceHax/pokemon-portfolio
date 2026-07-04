/**
 * Tile collision resolution.
 *
 * A faithful port of FireRed's `GetCollisionAtCoords` (event_object_movement.c:4830)
 * and its ledge check (`GetLedgeJumpDirection`, :8303). The ORDER of checks matters
 * and is preserved exactly - the first blocking condition wins, and ledges are
 * resolved before plain impassability so a ledge tile triggers a hop, not a bump.
 */

import {
  Direction,
  DIRECTION_VECTORS,
  Entity,
  Tile,
  TileMap,
} from './types'

/** Outcome of attempting to enter a tile. */
export enum Collision {
  /** Free to move. */
  None = 'none',
  /** A wall, border, or directional block - the step is refused. */
  Impassable = 'impassable',
  /** Different elevation layer (e.g. water vs. bridge) - refused. */
  ElevationMismatch = 'elevation_mismatch',
  /** Another entity occupies the tile - refused. */
  Occupied = 'occupied',
  /** A ledge in the pressed direction - triggers a two-tile hop, not a refusal. */
  LedgeJump = 'ledge_jump',
}

const DEFAULT_ELEVATION = 3

/** Tile at (x, y), or a synthetic fully-blocked tile when out of bounds. */
export function tileAt(map: TileMap, x: number, y: number): Tile {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    // Out of bounds acts like the map border: impassable (fieldmap.c GetBorderBlockAt
    // returns a tile with the collision bit forced on).
    return { blocked: true }
  }
  return map.tiles[y][x]
}

function elevationOf(tile: Tile): number {
  return tile.elevation ?? DEFAULT_ELEVATION
}

/**
 * Elevations are compatible if either is 0 (a "transition" elevation that connects
 * to anything - stairs, doorways) or they are equal. Mirrors FireRed's
 * `AreElevationsCompatible`.
 */
function elevationsCompatible(a: number, b: number): boolean {
  return a === 0 || b === 0 || a === b
}

/**
 * Is the source→dest step blocked by a directional wall?
 *
 * FireRed checks BOTH sides: a tile can block you from LEAVING in a direction, and
 * the destination can block you from ENTERING from the opposite direction
 * (`IsMetatileDirectionallyImpassable`, :4889). We model only the destination's
 * `blockedFrom` here since that covers cliff edges and one-sided walls; extend with a
 * source-side check if a map needs the "can't leave this way" case.
 */
function directionallyBlocked(dest: Tile, direction: Direction): boolean {
  return dest.blockedFrom?.includes(direction) ?? false
}

/**
 * Resolve what happens if `mover` steps one tile in `direction`.
 *
 * @param others Other entities to test for occupancy (NPCs). The mover itself must
 *   not be in this list.
 */
export function resolveCollision(
  map: TileMap,
  mover: Entity,
  direction: Direction,
  others: readonly Entity[] = [],
): Collision {
  const vec = DIRECTION_VECTORS[direction]
  const destX = mover.x + vec.x
  const destY = mover.y + vec.y
  const source = tileAt(map, mover.x, mover.y)
  const dest = tileAt(map, destX, destY)

  // Ledges resolve first: a ledge on the CURRENT tile in the pressed direction sends
  // the player hopping over the tile below it (FireRed checks the ledge behavior of
  // the destination tile; we tag the ledge on the tile you jump FROM for clarity).
  if (source.ledge === direction || dest.ledge === direction) {
    return Collision.LedgeJump
  }

  if (dest.blocked || directionallyBlocked(dest, direction)) {
    return Collision.Impassable
  }

  if (!elevationsCompatible(elevationOf(source), elevationOf(dest))) {
    return Collision.ElevationMismatch
  }

  for (const other of others) {
    // An entity blocks a tile it currently stands on. (FireRed also blocks the tile
    // an NPC just left, so you can't clip into a vacating sprite; add previousCoords
    // tracking to Entity if that precision is needed.)
    if (other.x === destX && other.y === destY) {
      if (elevationsCompatible(elevationOf(source), elevationOf(dest))) {
        return Collision.Occupied
      }
    }
  }

  return Collision.None
}
