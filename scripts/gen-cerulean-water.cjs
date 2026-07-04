/**
 * Generates the animated water frames for Cerulean City.
 *
 * FireRed water is not static — it shimmers on a short cycle. The town art
 * (public/assets/maps/cerulean.png) bakes a single still water frame, so here we detect
 * the water tiles and emit N frames that reuse the ORIGINAL water pixels (identical base,
 * no seam against the baked shore) with a moving diagonal highlight band layered on top.
 *
 *   Output: public/assets/maps/cerulean_water_0.png … _{N-1}.png  (full-map, transparent
 *           everywhere except water tiles)
 *   Re-run: node scripts/gen-cerulean-water.cjs
 *
 * The renderer (AnimatedWaterLayer) draws frame `animTick % N` over the background, so the
 * water animates even while the player stands still.
 */
const path = require('path')
const { decode, encode, px } = require('./pngtool.cjs')

const FRAMES = 3
const TS = 16
const src = decode(path.join(__dirname, '..', 'public', 'assets', 'maps', 'cerulean.png'))
const cols = src.W / TS
const rows = src.H / TS

// Average colour of a tile's inner region (skip the 2px border to avoid shore bleed).
function isWaterTile(cx, cy) {
  let r = 0, g = 0, b = 0, n = 0
  for (let y = cy * TS + 2; y < cy * TS + TS - 2; y++)
    for (let x = cx * TS + 2; x < cx * TS + TS - 2; x++) {
      const [pr, pg, pb] = px(src, x, y)
      r += pr; g += pg; b += pb; n++
    }
  r /= n; g /= n; b /= n
  // Strongly blue-dominant = open water. Building roofs are bluish but far grayer
  // (b only slightly above r), so a large b-over-r margin excludes them.
  return b > 140 && b > r + 55 && b > g + 28
}

let water = []
for (let y = 0; y < rows; y++) {
  const row = []
  for (let x = 0; x < cols; x++) row.push(isWaterTile(x, y))
  water.push(row)
}

// Erode specks: a real water body tile has >=2 orthogonal water neighbours. This drops
// isolated blue building glass (doors/windows) misread as water, keeping open water/ponds.
const wAt = (x, y) => y >= 0 && y < rows && x >= 0 && x < cols && water[y][x]
water = water.map((row, y) =>
  row.map((w, x) => {
    if (!w) return false
    const n = (wAt(x, y - 1) ? 1 : 0) + (wAt(x, y + 1) ? 1 : 0) + (wAt(x - 1, y) ? 1 : 0) + (wAt(x + 1, y) ? 1 : 0)
    return n >= 2
  }),
)

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)

for (let f = 0; f < FRAMES; f++) {
  const phase = (f / FRAMES) * Math.PI * 2
  const out = Buffer.alloc(src.W * src.H * 4) // transparent by default
  for (let y = 0; y < src.H; y++) {
    for (let x = 0; x < src.W; x++) {
      if (!water[Math.floor(y / TS)][Math.floor(x / TS)]) continue
      const [r, g, b] = px(src, x, y)
      // Diagonal wave band that scrolls by 1/N cycle per frame.
      const s = Math.sin(x * 0.55 + y * 0.85 + phase)
      const hi = s > 0.3 ? (s - 0.3) * 0.5 : 0 // 0..0.35 highlight strength
      const di = (y * src.W + x) * 4
      out[di] = clamp(r + (215 - r) * hi)
      out[di + 1] = clamp(g + (235 - g) * hi)
      out[di + 2] = clamp(b + (250 - b) * hi)
      out[di + 3] = 255
    }
  }
  const dest = path.join(__dirname, '..', 'public', 'assets', 'maps', `cerulean_water_${f}.png`)
  encode(dest, src.W, src.H, out)
  console.log('wrote', path.basename(dest))
}
console.log('done', cols + 'x' + rows, 'tiles, frames:', FRAMES)
