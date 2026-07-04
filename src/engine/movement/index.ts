/**
 * Overworld movement engine - public surface.
 *
 * A framework-agnostic, faithful port of Pokémon FireRed's tile-based movement.
 * See MOVEMENT.md for the model and the decomp mapping. No React, no DOM: the
 * Adventure world layer drives a PlayerController from its render loop and reads
 * getPixelPosition() to place the sprite.
 */

export { PlayerController } from './PlayerController'
export type { PlayerControllerOptions } from './PlayerController'
export { Collision, resolveCollision, tileAt } from './collision'
export { SPEED_STEP_DELTAS, FRAME_MS, stepFrameCount } from './speeds'
export {
  Direction,
  DIRECTION_VECTORS,
  MotionState,
  MoveSpeed,
  TILE_SIZE,
} from './types'
export type { Entity, Tile, TileMap } from './types'
