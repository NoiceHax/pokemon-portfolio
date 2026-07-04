/**
 * Movement speed tables.
 *
 * FireRed does NOT move sprites by a floating "pixels per second". Each speed is a
 * fixed list of per-frame pixel deltas whose sum is exactly one tile (16px). The
 * engine plays the list one entry per frame; when the list is exhausted, the sprite
 * has landed precisely on the next tile. This is `sNpcStepFuncTables` /
 * `NpcTakeStep` (event_object_movement.c:8866-8946).
 *
 * Two consequences we preserve:
 * - Motion is integer-exact and always tile-aligned - no sub-pixel drift.
 * - "Speed" is really "how many frames a step takes", so faster speeds cover the
 *   tile in fewer, larger hops. Fast-2's uneven `2,3,3,2,3,3` is a deliberate ease.
 *
 * The GBA ran these at 60fps. On the web we decouple from the display refresh rate
 * by accumulating elapsed time and consuming one table entry per FRAME_MS
 * (`stepper.ts`), so a 144Hz monitor moves at the same real-world speed as 60Hz.
 */

import { MoveSpeed, TILE_SIZE } from './types'

/** GBA frame duration. One speed-table entry is consumed per this many ms. */
export const FRAME_MS = 1000 / 60

/**
 * Per-frame pixel deltas per speed. Index i is the distance moved on frame i.
 * (event_object_movement.c: Step1/Step2/Step3/Step4/Step8 + the *StepFuncs tables.)
 */
export const SPEED_STEP_DELTAS: Record<MoveSpeed, readonly number[]> = {
  // Normal walk: 1px × 16 frames.
  [MoveSpeed.Normal]: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Run / surf: 2px × 8 frames (twice walk speed).
  [MoveSpeed.Fast]: [2, 2, 2, 2, 2, 2, 2, 2],
  // Mach bike: 4px × 4 frames.
  [MoveSpeed.Faster]: [4, 4, 4, 4],
  // Warp: 8px × 2 frames.
  [MoveSpeed.Fastest]: [8, 8],
}

/**
 * Note the decomp's sSpeedFast2 table (`2,3,3,2,3,3`, 6 frames) is an eased variant
 * used by some NPC animations. It isn't wired to a player MoveSpeed here because the
 * player never uses it - add it as a MoveSpeed only if a feature needs that ease.
 */

if (process.env.NODE_ENV !== 'production') {
  // Guard the core invariant: every table must sum to exactly one tile, or steps
  // would land off-grid and the whole tile model breaks. Cheap to check, catches a
  // typo in the tables immediately in dev.
  for (const [speed, deltas] of Object.entries(SPEED_STEP_DELTAS)) {
    const total = deltas.reduce((a, b) => a + b, 0)
    if (total !== TILE_SIZE) {
      throw new Error(
        `Speed table "${speed}" sums to ${total}px, expected ${TILE_SIZE}px (one tile).`,
      )
    }
  }
}

/** Total frames a single step takes at the given speed. */
export function stepFrameCount(speed: MoveSpeed): number {
  return SPEED_STEP_DELTAS[speed].length
}
