/**
 * Frame-rate-independent step interpolator.
 *
 * FireRed advanced one speed-table entry per 60fps frame. We can't assume 60Hz on
 * the web (monitors run 60/120/144Hz), so we accumulate real elapsed time and
 * consume one table entry per FRAME_MS. This keeps the movement's real-world speed
 * identical across refresh rates while preserving the exact per-frame delta sequence
 * that gives the motion its character.
 *
 * The stepper only produces a pixel OFFSET from the tile origin (0 → TILE_SIZE). It
 * knows nothing about the grid - the PlayerController owns tile coordinates and asks
 * the stepper "how far into the current step am I".
 */

import { FRAME_MS, SPEED_STEP_DELTAS } from './speeds'
import { MoveSpeed } from './types'

export interface Stepper {
  /** Pixels moved so far this step (0 → TILE_SIZE). */
  offset: number
  /** True once the full tile has been traversed. */
  done: boolean
}

interface StepperInternal extends Stepper {
  speed: MoveSpeed
  frameIndex: number
  /** Leftover time carried between advance() calls, in ms. */
  accumulator: number
}

/** Begin a fresh step at the given speed. */
export function createStepper(speed: MoveSpeed): StepperInternal {
  return { speed, frameIndex: 0, accumulator: 0, offset: 0, done: false }
}

/**
 * Advance the step by `deltaMs` of real time. Consumes whole speed-table frames;
 * fractional time is carried in the accumulator so nothing is lost between calls.
 *
 * We deliberately do NOT interpolate within a frame - the GBA never did, and the
 * crisp per-pixel stepping is part of the look. Sub-frame smoothing would sand off
 * the pixel-art feel.
 */
export function advanceStepper(stepper: StepperInternal, deltaMs: number): void {
  if (stepper.done) return

  const deltas = SPEED_STEP_DELTAS[stepper.speed]
  stepper.accumulator += deltaMs

  while (stepper.accumulator >= FRAME_MS && stepper.frameIndex < deltas.length) {
    stepper.offset += deltas[stepper.frameIndex]
    stepper.frameIndex++
    stepper.accumulator -= FRAME_MS
  }

  if (stepper.frameIndex >= deltas.length) {
    stepper.done = true
    // Drop leftover time so it can't leak an extra frame into the next step.
    stepper.accumulator = 0
  }
}
