/**
 * Generates a small 2-frame animated flower tuft used as an ambient overworld decoration.
 *
 * FireRed dots towns with tiny yellow/white flower tiles that gently sway on a 2-frame
 * cycle. We don't have that exact tile cut, so we draw a clean 16x16 tuft procedurally in
 * two frames (petals nudged left, then right) matching the era's palette. Placed by the
 * map (`flowerTiles`) and cycled by the engine's ambient animTick, so foliage moves even
 * while the player stands still.
 *
 *   Output: public/assets/maps/flower_0.png, flower_1.png  (16x16, transparent)
 *   Re-run: node scripts/gen-flowers.cjs
 */
const path = require('path')
const { encode } = require('./pngtool.cjs')

const TS = 16
// FRLG-ish flower palette.
const STEM = [64, 128, 56]
const LEAF = [104, 176, 72]
const PETAL = [248, 216, 96]
const CORE = [240, 144, 72]

function frame(sway) {
  const d = Buffer.alloc(TS * TS * 4) // transparent
  const set = (x, y, [r, g, b]) => {
    if (x < 0 || y < 0 || x >= TS || y >= TS) return
    const i = (y * TS + x) * 4
    d[i] = r
    d[i + 1] = g
    d[i + 2] = b
    d[i + 3] = 255
  }
  // Two little tufts at the bottom of the tile so they read as ground flowers.
  const tufts = [
    { cx: 5, cy: 11 },
    { cx: 11, cy: 12 },
  ]
  for (const { cx, cy } of tufts) {
    // stem + a leaf
    set(cx, cy, STEM)
    set(cx, cy + 1, STEM)
    set(cx - 1, cy + 1, LEAF)
    // 4 petals around a core, nudged by `sway` for the 2-frame animation
    const px = cx + sway
    set(px, cy - 2, PETAL)
    set(px - 1, cy - 1, PETAL)
    set(px + 1, cy - 1, PETAL)
    set(px, cy - 1, CORE)
  }
  return d
}

const OUT = path.join(__dirname, '..', 'public', 'assets', 'maps')
encode(path.join(OUT, 'flower_0.png'), TS, TS, frame(0))
encode(path.join(OUT, 'flower_1.png'), TS, TS, frame(1))
console.log('Wrote flower_0.png, flower_1.png to', OUT)
