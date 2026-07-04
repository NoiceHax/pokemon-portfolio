/**
 * The player movement state machine.
 *
 * This is the faithful reproduction of how FireRed reads input and turns it into
 * grid movement (`field_player_avatar.c`: player_step → MovePlayerNotOnBike →
 * CheckMovementInputNotOnBike). The single behavior that makes movement feel like
 * Pokémon rather than a generic top-down game lives here:
 *
 *   TAP-TO-TURN: pressing a direction you are NOT already facing, while standing
 *   still, turns you in place - it does NOT move you. You step only when you press
 *   the direction you already face (or hold it into the next tile).
 *   (CheckMovementInputNotOnBike, field_player_avatar.c:456.)
 *
 * Input is sampled ONLY at tile centers. Mid-step input is buffered and applied when
 * the current step completes, so the grid stays authoritative and the player can
 * never end up between tiles.
 */

import { Collision, resolveCollision } from './collision'
import { advanceStepper, createStepper } from './stepper'
import {
  Direction,
  DIRECTION_VECTORS,
  Entity,
  MotionState,
  MoveSpeed,
  TILE_SIZE,
  TileMap,
} from './types'

/** How many frames the turn-in-place pivot holds before input is read again. */
const TURN_FRAMES = 4
const TURN_MS = (1000 / 60) * TURN_FRAMES

export interface PlayerControllerOptions {
  map: TileMap
  start: { x: number; y: number; facing?: Direction }
  /** Other entities on the map that block tiles (NPCs). Read fresh each step. */
  getObstacles?: () => readonly Entity[]
  /** Fired when a step or hop begins, for footstep sounds / animation triggers. */
  onStepStart?: (direction: Direction, kind: 'walk' | 'run' | 'ledge') => void
  /** Fired when the player bumps an impassable tile (collision "thud" sound). */
  onBlocked?: (direction: Direction) => void
}

export class PlayerController {
  readonly entity: Entity
  state: MotionState = MotionState.Idle

  private readonly map: TileMap
  private readonly getObstacles: () => readonly Entity[]
  private readonly onStepStart?: PlayerControllerOptions['onStepStart']
  private readonly onBlocked?: PlayerControllerOptions['onBlocked']

  /** Direction currently held by the player (set every frame from input). */
  private held: Direction = Direction.None
  /** Whether the run modifier (B button) is held. */
  private running = false

  private stepper = createStepper(MoveSpeed.Normal)
  private turnTimer = 0
  /** Origin tile of the current slide, used to compute the visual position. */
  private originX = 0
  private originY = 0
  /** Tiles moved this step (1 for a walk, 2 for a ledge hop). */
  private stepDistance = 1

  constructor(options: PlayerControllerOptions) {
    this.map = options.map
    this.getObstacles = options.getObstacles ?? (() => [])
    this.onStepStart = options.onStepStart
    this.onBlocked = options.onBlocked
    this.entity = {
      x: options.start.x,
      y: options.start.y,
      facing: options.start.facing ?? Direction.South,
    }
    this.originX = this.entity.x
    this.originY = this.entity.y
  }

  /**
   * Feed the current input each frame. `direction` is the held D-pad direction
   * (Direction.None when nothing is pressed); `running` is the B-button state.
   * Cheap to call every frame - input is only ACTED on at tile centers.
   */
  setInput(direction: Direction, running: boolean): void {
    this.held = direction
    this.running = running
  }

  /** Advance the simulation by `deltaMs` of real time. */
  update(deltaMs: number): void {
    switch (this.state) {
      case MotionState.Idle:
        this.updateIdle()
        break
      case MotionState.Turning:
        this.updateTurning(deltaMs)
        break
      case MotionState.Moving:
        this.updateMoving(deltaMs)
        break
    }
  }

  /**
   * Visual position in game pixels, interpolated across the current step. The
   * renderer multiplies by its display scale. At rest this is exactly the tile
   * origin; mid-step it slides toward the destination.
   */
  getPixelPosition(): { x: number; y: number } {
    if (this.state !== MotionState.Moving) {
      return { x: this.entity.x * TILE_SIZE, y: this.entity.y * TILE_SIZE }
    }
    const vec = DIRECTION_VECTORS[this.entity.facing]
    // The stepper reports 0 → TILE_SIZE for one tile of travel. A ledge hop spans
    // `stepDistance` tiles in the same step, so scale the offset to cover them all.
    const traveled = this.stepper.offset * this.stepDistance
    return {
      x: this.originX * TILE_SIZE + vec.x * traveled,
      y: this.originY * TILE_SIZE + vec.y * traveled,
    }
  }

  // --- state handlers -------------------------------------------------------

  private updateIdle(): void {
    if (this.held === Direction.None) return

    // Tap-to-turn: a new direction while idle pivots in place, consuming the input.
    if (this.held !== this.entity.facing) {
      this.entity.facing = this.held
      this.state = MotionState.Turning
      this.turnTimer = 0
      return
    }

    this.beginStep(this.held)
  }

  private updateTurning(deltaMs: number): void {
    this.turnTimer += deltaMs
    if (this.turnTimer < TURN_MS) return

    this.state = MotionState.Idle
    // If the player is still holding a direction after the pivot, immediately act on
    // it - turning then walking in one continuous hold should flow without a stutter.
    if (this.held !== Direction.None) {
      this.updateIdle()
    }
  }

  private updateMoving(deltaMs: number): void {
    advanceStepper(this.stepper, deltaMs)
    if (!this.stepper.done) return

    // Landed cleanly on the destination tile. Commit the coordinates.
    const vec = DIRECTION_VECTORS[this.entity.facing]
    this.entity.x = this.originX + vec.x * this.stepDistance
    this.entity.y = this.originY + vec.y * this.stepDistance
    this.state = MotionState.Idle

    // Continue seamlessly if a direction is still held (walking across many tiles).
    this.updateIdle()
  }

  // --- step initiation ------------------------------------------------------

  private beginStep(direction: Direction): void {
    const collision = resolveCollision(
      this.map,
      this.entity,
      direction,
      this.getObstacles(),
    )

    switch (collision) {
      case Collision.None:
        this.startSlide(direction, 1, this.running ? MoveSpeed.Fast : MoveSpeed.Normal)
        this.onStepStart?.(direction, this.running ? 'run' : 'walk')
        break

      case Collision.LedgeJump:
        // A hop is two tiles at run speed and always plays regardless of the run
        // modifier - you can't reverse it (FireRed forces the jump).
        this.startSlide(direction, 2, MoveSpeed.Fast)
        this.onStepStart?.(direction, 'ledge')
        break

      case Collision.Impassable:
      case Collision.ElevationMismatch:
      case Collision.Occupied:
        // Blocked: the player still FACES the direction (already set) but stays put.
        // A short bump/thud is the whole feedback - no tile change.
        this.onBlocked?.(direction)
        break
    }
  }

  private startSlide(direction: Direction, distance: number, speed: MoveSpeed): void {
    this.entity.facing = direction
    this.originX = this.entity.x
    this.originY = this.entity.y
    this.stepDistance = distance
    this.stepper = createStepper(speed)
    // The stepper always runs one tile's worth of frames (0 → TILE_SIZE). For a
    // multi-tile ledge hop, getPixelPosition() and the commit both scale by
    // stepDistance, so the same frame table cleanly spans `distance` tiles.
    this.state = MotionState.Moving
  }
}
