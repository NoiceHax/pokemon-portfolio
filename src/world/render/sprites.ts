import type { Direction } from '@/world/engine/types'

/**
 * Extracted, background-keyed sprite frames (see scripts/extract-sprites.cjs).
 *
 * Player: frame 0 = idle; 1/2 are the walk-cycle steps, one per direction.
 * NPCs: frame 0 = idle, 1 = step, per direction. NPC art is drawn for down/up/side;
 * `right` reuses the `side` frames and the renderer mirrors them for `left`.
 */
const ROOT = '/assets/sprites'

export const PLAYER_FRAMES: Record<Direction, string[]> = {
  down: [`${ROOT}/red_down_0.png`, `${ROOT}/red_down_1.png`, `${ROOT}/red_down_2.png`],
  up: [`${ROOT}/red_up_0.png`, `${ROOT}/red_up_1.png`, `${ROOT}/red_up_2.png`],
  left: [`${ROOT}/red_left_0.png`, `${ROOT}/red_left_1.png`, `${ROOT}/red_left_2.png`],
  right: [`${ROOT}/red_right_0.png`, `${ROOT}/red_right_1.png`, `${ROOT}/red_right_2.png`],
}

export function playerSprite(facing: Direction, frame: 0 | 1 | 2): string {
  return PLAYER_FRAMES[facing][frame]
}

// Some FRLG overworld strips (npc_c/d/g/h) have NO side-facing pose in the sheet - their
// `*_side_*.png` frames extracted blank. An NPC using one of these turns INVISIBLE the
// moment it faces the player sideways (talk-from-the-side). Prefer assigning only sets
// with side art (npc_a/b/e/f) in map data; this set is the safety net so a stray
// assignment degrades to a visible front-facing frame instead of a vanished sprite.
const SETS_WITHOUT_SIDE = new Set(['npc_c', 'npc_d', 'npc_g', 'npc_h'])

/**
 * NPC frame resolver. `base` is the extracted sprite set id (e.g. `npc_a`). Left and
 * right share the `side` art (right = as-drawn, left = mirrored by the renderer), so a
 * single sheet row covers both. Frame is clamped to 0/1 since NPCs have a 2-frame walk.
 */
export function npcSprite(base: string, facing: Direction, frame: 0 | 1 | 2): string {
  const wantsSide = facing === 'left' || facing === 'right'
  // Fall back to the front pose for sets that lack side art (keeps the NPC visible).
  const dir = wantsSide ? (SETS_WITHOUT_SIDE.has(base) ? 'down' : 'side') : facing
  return `${ROOT}/${base}_${dir}_${frame === 0 ? 0 : 1}.png`
}
