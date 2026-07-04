/**
 * Core engine types. Pure data - no React, no DOM. These describe the vocabulary the
 * whole engine speaks: coordinates, directions, and the shape of a read-only snapshot
 * the renderer consumes.
 */

/**
 * Base (unzoomed) size of one tile in world px - the native GBA tile size. The world is
 * laid out and the camera reasons in these units; the renderer then applies a CSS zoom
 * (WorldRenderer) so ~TILES_ACROSS tiles fill the viewport, matching the GBA field of
 * view. Keeping the base at 16 means 1 art pixel = 1 world px, so scaling stays crisp.
 */
export const TILE_SIZE = 16

/**
 * How many tiles span the viewport width at the target zoom. The GBA screen is 15×10
 * tiles; ~15 across reproduces that authentic, zoomed-in field of view.
 */
export const TILES_ACROSS = 15

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface TileCoord {
  x: number
  y: number
}

export const DIRECTION_DELTA: Record<Direction, TileCoord> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function stepCoord(coord: TileCoord, dir: Direction): TileCoord {
  const d = DIRECTION_DELTA[dir]
  return { x: coord.x + d.x, y: coord.y + d.y }
}

export function coordsEqual(a: TileCoord, b: TileCoord): boolean {
  return a.x === b.x && a.y === b.y
}

/**
 * The immutable snapshot the engine publishes on every change. The renderer reads
 * ONLY this - it never touches engine internals. Producing a fresh object each change
 * lets React's `useSyncExternalStore` detect updates by identity.
 */
/** One drawable image layer in the Background or Foreground layer of the Scene. */
export interface RenderLayer {
  src: string
  role?: string
}

export interface WorldSnapshot {
  /** Active map id + display name + pixel dimensions + background image. */
  mapId: string
  mapName: string
  mapWidth: number
  mapHeight: number
  /** Flat single-image background (ground/terrain/roads baked together), or null. */
  background: string | null
  /** Flat single-image foreground (tree-tops/roofs baked together), or null. */
  foreground: string | null
  /** Ordered background sub-layers (ground → terrain → roads), if the map ships them. */
  backgroundLayers: RenderLayer[]
  /** Ordered foreground sub-layers (treetops → roofs → bridges → canopies), if shipped. */
  foregroundLayers: RenderLayer[]
  /** Ordered animated water frames (drawn above background, cycled by `animTick`). */
  waterFrames: string[]
  /** Tile coords that get an ambient animated flower tuft (cycled by `animTick`). */
  flowerTiles: TileCoord[]

  /** Player render state. */
  player: {
    position: TileCoord
    /** Continuous pixel position, interpolated during a step (for smooth motion). */
    pixel: { x: number; y: number }
    direction: Direction
    moving: boolean
    /** Walk-cycle frame: 0 idle, 1/2 stepping. */
    animFrame: 0 | 1 | 2
  }

  /** Renderable entities in the active map (NPCs, items, signs, warps). */
  entities: RenderEntity[]

  /** Camera pixel offset applied to the world layer. */
  camera: { x: number; y: number }

  /**
   * Monotonic low-rate animation counter for ambient tile animation (e.g. water). Driven
   * by a persistent timer independent of movement, so tiles animate even while idle.
   */
  animTick: number
}

/** A flattened, render-ready view of an entity (no behavior, just what to draw). */
export interface RenderEntity {
  id: string
  kind: 'npc' | 'warp' | 'portal' | 'sign' | 'trigger' | 'item'
  position: TileCoord
  /** Continuous pixel position (NPCs interpolate while wandering). */
  pixel: { x: number; y: number }
  /** Facing direction (drives which sprite frame + faceMain). */
  direction: Direction
  /** Resolved single image (items). NPCs use `spriteBase` + `animFrame` instead. */
  sprite?: { src: string; alt: string }
  /** NPC sprite-set id (e.g. `npc_a`); the renderer resolves directional frames. */
  spriteBase?: string
  /** NPC walk-cycle frame (0 idle, 1/2 stepping) - mirrors the player. */
  animFrame?: 0 | 1 | 2
  name?: string
  /** True for entities that should not be drawn (invisible triggers/secrets). */
  hidden?: boolean
}
