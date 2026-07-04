/**
 * Overworld movement data model.
 *
 * A faithful port of Pokémon FireRed's tile-based movement (decompiled sources in
 * `/pokefirered`: `field_player_avatar.c`, `event_object_movement.c`, `fieldmap.c`).
 *
 * The whole model in one sentence: there is NO velocity, NO momentum, NO
 * acceleration. The world is a grid of fixed-size tiles; the player always occupies
 * exactly one tile, and a "move" is a scripted slide from one tile to the neighbour
 * over a fixed number of frames. Everything that feels like Pokémon - the deliberate
 * pacing, the tap-to-turn, the ledge hops - falls out of this model, not out of
 * physics tuning. See MOVEMENT.md for the full derivation.
 */

/**
 * One tile is 16 game pixels, exactly as on the GBA (`fieldmap.c` metatiles).
 * Rendered size is a separate concern (scale it up with CSS); the physics always
 * reason in these logical pixels so speed tables stay integer-exact.
 */
export const TILE_SIZE = 16

/**
 * Facing / movement directions.
 *
 * Values match the FireRed `DIR_*` constants so lookup tables (vectors, ledge
 * behaviors) can be indexed identically to the decomp. Diagonals exist only for
 * forced movement (currents, stairs) - free walking is never diagonal.
 */
export enum Direction {
  None = 0,
  South = 1,
  North = 2,
  West = 3,
  East = 4,
  Southwest = 5,
  Southeast = 6,
  Northwest = 7,
  Northeast = 8,
}

/**
 * Unit vector per direction (`sDirectionToVectors`, event_object_movement.c:903).
 * +y is south / down, matching screen space and the GBA.
 */
export const DIRECTION_VECTORS: Record<Direction, { x: number; y: number }> = {
  [Direction.None]: { x: 0, y: 0 },
  [Direction.South]: { x: 0, y: 1 },
  [Direction.North]: { x: 0, y: -1 },
  [Direction.West]: { x: -1, y: 0 },
  [Direction.East]: { x: 1, y: 0 },
  [Direction.Southwest]: { x: -1, y: 1 },
  [Direction.Southeast]: { x: 1, y: 1 },
  [Direction.Northwest]: { x: -1, y: -1 },
  [Direction.Northeast]: { x: 1, y: -1 },
}

/**
 * Movement speeds. Each maps to a per-frame pixel-delta table in `speeds.ts`
 * (FireRed `sNpcStepFuncTables`, event_object_movement.c:8917). The deltas always
 * sum to exactly TILE_SIZE, so a step lands cleanly on the next tile.
 */
export enum MoveSpeed {
  /** Ordinary walk - 16 frames per tile. */
  Normal = 'normal',
  /** Running (hold B) and surfing - 8 frames per tile, twice walk speed. */
  Fast = 'fast',
  /** Mach-bike tier - 4 frames per tile. Reserved for future ride mechanics. */
  Faster = 'faster',
  /** Warp/teleport tier - 2 frames per tile. */
  Fastest = 'fastest',
}

/**
 * The player's motion state. Mirrors FireRed's `runningState`
 * (NOT_MOVING / TURN_DIRECTION / MOVING). This is the crux of the authentic feel:
 * the player is EITHER standing, OR pivoting in place, OR sliding between two tiles -
 * never in a blended in-between, and input is only consumed at tile centers.
 */
export enum MotionState {
  Idle = 'idle',
  /** Pivoting to face a new direction without changing tile (costs one input). */
  Turning = 'turning',
  /** Sliding from one tile to the adjacent tile. */
  Moving = 'moving',
}

/**
 * Per-tile properties. This is where the physics actually lives - the tile data
 * carries the behavior, the movement code stays generic (FireRed metatile
 * attributes, fieldmap.c). A world map is just a grid of these.
 */
export interface Tile {
  /** Fully blocks entry from every direction (a wall, a building). */
  blocked?: boolean
  /**
   * Directions from which entry is blocked (cliff edges, one-sided walls).
   * FireRed's "directionally impassable" - a tile can be enterable from the south
   * but not the north, etc.
   */
  blockedFrom?: Direction[]
  /**
   * Elevation layer ("z-coord"). Two tiles on incompatible elevations don't collide
   * or connect - this is how bridges pass over water. Default 3 (ground).
   */
  elevation?: number
  /**
   * A ledge you can hop DOWN in this direction. Pressing into it jumps two tiles and
   * cannot be reversed (FireRed `GetLedgeJumpDirection`).
   */
  ledge?: Direction
  /** Free-text behavior tag for grass, water, doors, etc. Consumed by higher layers. */
  behavior?: string
}

/** A rectangular grid of tiles. Row-major: `tiles[y][x]`. */
export interface TileMap {
  width: number
  height: number
  tiles: Tile[][]
}

/** An actor occupying a tile (the player, or an NPC). Coordinates are in TILES. */
export interface Entity {
  x: number
  y: number
  facing: Direction
}
