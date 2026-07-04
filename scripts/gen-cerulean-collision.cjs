/**
 * Generates a BASE Cerulean City collision grid by classifying each 16px tile of the
 * extracted map image (public/assets/maps/cerulean.png) as walkable or blocked.
 *
 *   water (blue) / trees / buildings / fences → blocked (#)
 *   tan path / light grass                    → walkable (.)
 *
 * IMPORTANT: The live grid at src/world/world/maps/ceruleanCollision.ts has been
 * HAND-CORRECTED. A pure color heuristic cannot separate tan building roofs from tan
 * paths (letting the player walk onto roofs), so roof/building tiles were solidified by
 * hand. To avoid silently clobbering that work this script refuses to overwrite a file
 * marked HAND-CORRECTED; instead it writes a fresh base next to it for manual diffing:
 *
 *   Output: src/world/world/maps/ceruleanCollision.base.ts
 *   Re-run: node scripts/gen-cerulean-collision.cjs
 *
 * Re-derive by regenerating the base, then re-applying the roof/building corrections.
 */
const path = require('path')
const fs = require('fs')
const { decode, px } = require('./pngtool.cjs')

const src = decode(path.join(__dirname, '..', 'public', 'assets', 'maps', 'cerulean.png'))
const TS = 16
const cols = src.W / TS
const rows = src.H / TS

function tileAvg(cx, cy) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0
  for (let y = cy * TS + 3; y < cy * TS + TS - 3; y++)
    for (let x = cx * TS + 3; x < cx * TS + TS - 3; x++) {
      const [pr, pg, pb] = px(src, x, y)
      r += pr
      g += pg
      b += pb
      n++
    }
  return [r / n, g / n, b / n]
}

function walkable(cx, cy) {
  const [r, g, b] = tileAvg(cx, cy)
  if (b > 150 && b > r + 40 && b > g + 20) return false // water
  if (r > 200 && g > 190 && b < 170) return true // tan path
  if (g > 150 && g >= r && g >= b && r > 90 && r < 200) return true // grass
  return false // trees / buildings / fences
}

const grid = []
for (let y = 0; y < rows; y++) {
  let row = ''
  for (let x = 0; x < cols; x++) row += walkable(x, y) ? '.' : '#'
  grid.push(row)
}

const body =
  '// AUTO-GENERATED base by scripts/gen-cerulean-collision.cjs.\n' +
  '// `#` = blocked, `.` = walkable. One char per 16px tile of the Cerulean map.\n' +
  '// This is the raw heuristic output — the live ceruleanCollision.ts is hand-corrected.\n' +
  'export const CERULEAN_COLLISION: string[] = [\n' +
  grid.map((r) => "  '" + r + "',").join('\n') +
  '\n]\n'

const liveDir = path.join(__dirname, '..', 'src', 'world', 'world', 'maps')
const livePath = path.join(liveDir, 'ceruleanCollision.ts')
const basePath = path.join(liveDir, 'ceruleanCollision.base.ts')
if (fs.existsSync(livePath) && fs.readFileSync(livePath, 'utf8').includes('HAND-CORRECTED')) {
  fs.writeFileSync(basePath, body)
  console.log(
    'live ceruleanCollision.ts is HAND-CORRECTED; wrote base to ceruleanCollision.base.ts',
    cols + 'x' + rows,
  )
  console.log('Re-apply roof/building corrections by diffing against the base, then delete it.')
} else {
  fs.writeFileSync(livePath, body)
  console.log('wrote ceruleanCollision.ts', cols + 'x' + rows)
}
