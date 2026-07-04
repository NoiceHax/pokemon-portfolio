import { DIRECTION_DELTA, TILE_SIZE, type Direction, type TileCoord } from './types'

/**
 * ms to traverse one tile. FireRed runs at 60fps and moves a tile in ~16 frames walking
 * (~267ms) / ~8 frames running (~133ms). We use a slightly brisker pair so the portfolio
 * feels responsive while keeping a clear walk-vs-run distinction. NPCs walk.
 */
export const WALK_DURATION = 220
export const RUN_DURATION = 130
/** Back-compat default (NPCs and any caller that doesn't pick a speed). */
export const STEP_DURATION = WALK_DURATION

/**
 * Actor - a moving grid character (the player OR an NPC), inspired by the reference
 * engine's `Character`. It owns its own grid position, pixel position, facing, and
 * in-progress step, plus an `intentPosition` (the tile it is walking INTO) so collision
 * can reserve it and two actors never overlap.
 *
 * Pure state + math - no rendering, no events. The engine ticks it; systems read it.
 */
export class Actor {
  position: TileCoord
  direction: Direction
  /** The tile this actor is mid-walk INTO, or null when idle. Reserves that tile. */
  intent: TileCoord | null = null
  private anim: {
    from: TileCoord
    to: TileCoord
    progress: number
    duration: number
  } | null = null
  private frameToggle: 1 | 2 = 1
  /** Walking in place against an obstacle (FireRed "bump"): feet move, position doesn't. */
  private pushing = false
  private pushAccum = 0

  constructor(spawn: TileCoord, direction: Direction = 'down') {
    this.position = { ...spawn }
    this.direction = direction
  }

  isMoving(): boolean {
    return this.anim !== null
  }

  animFrame(): 0 | 1 | 2 {
    return this.anim || this.pushing ? this.frameToggle : 0
  }

  /**
   * Animate the walk cycle in place while blocked (bump). Advances the foot toggle on the
   * normal step cadence without changing position. Call each frame the move stays blocked.
   */
  push(dt: number): void {
    this.pushing = true
    this.pushAccum += dt
    if (this.pushAccum >= STEP_DURATION) {
      this.pushAccum = 0
      this.frameToggle = this.frameToggle === 1 ? 2 : 1
    }
  }

  /** Stop the in-place bump animation (back to idle stance). */
  stopPush(): void {
    this.pushing = false
    this.pushAccum = 0
  }

  pixel(): { x: number; y: number } {
    if (!this.anim) return { x: this.position.x * TILE_SIZE, y: this.position.y * TILE_SIZE }
    const { from, to, progress } = this.anim
    return {
      x: (from.x + (to.x - from.x) * progress) * TILE_SIZE,
      y: (from.y + (to.y - from.y) * progress) * TILE_SIZE,
    }
  }

  /** Tiles this actor currently occupies or is reserving (for collision). */
  occupies(): TileCoord[] {
    return this.intent ? [this.position, this.intent] : [this.position]
  }

  face(direction: Direction): void {
    if (!this.anim) this.direction = direction
  }

  teleport(pos: TileCoord, direction: Direction = 'down'): void {
    this.position = { ...pos }
    this.direction = direction
    this.anim = null
    this.intent = null
    this.stopPush()
  }

  /** The tile directly ahead in a given direction (or current facing). */
  ahead(direction: Direction = this.direction): TileCoord {
    const d = DIRECTION_DELTA[direction]
    return { x: this.position.x + d.x, y: this.position.y + d.y }
  }

  /**
   * Begin a step in `direction` toward `target`. Caller must have already verified the
   * target is free (via CollisionSystem). Sets facing, reserves the intent tile.
   */
  beginStep(direction: Direction, target: TileCoord, duration: number = STEP_DURATION): void {
    this.direction = direction
    this.intent = { ...target }
    this.anim = { from: { ...this.position }, to: { ...target }, progress: 0, duration }
    this.frameToggle = this.frameToggle === 1 ? 2 : 1
    this.pushing = false
  }

  /** Advance the current step by dt ms. Returns true when a step just completed. */
  tick(dt: number): boolean {
    if (!this.anim) return false
    this.anim.progress += dt / this.anim.duration
    if (this.anim.progress >= 1) {
      this.position = { ...this.anim.to }
      this.anim = null
      this.intent = null
      return true
    }
    return false
  }
}
