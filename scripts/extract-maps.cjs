/**
 * Map extraction — cuts the town map and its building interiors out of the packed
 * sheets (public/assets/cerulean_city.png, pallet_town.png) into clean, tile-aligned
 * background PNGs under public/assets/maps/.
 *
 * The town sits inside a purple frame under a title bar; interiors sit on black
 * padding in a column to the right. We find the content bounds and snap to 16px tiles.
 *
 * Run: `node scripts/extract-maps.cjs`
 */
const path = require('path')
const fs = require('fs')
const { decode, encode, px } = require('./pngtool.cjs')

const ASSETS = path.join(__dirname, '..', 'public', 'assets')
const OUT = path.join(ASSETS, 'maps')
fs.mkdirSync(OUT, { recursive: true })

function cropTileAligned(src, sx, sy, w, h, name) {
  w = Math.floor(w / 16) * 16
  h = Math.floor(h / 16) * 16
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = px(src, sx + x, sy + y)
      const di = (y * w + x) * 4
      out[di] = r
      out[di + 1] = g
      out[di + 2] = b
      out[di + 3] = 255
    }
  encode(path.join(OUT, `${name}.png`), w, h, out)
  console.log(name, `${w}x${h}`, `(${w / 16}x${h / 16} tiles)`)
}

// Inner non-black content box within a search window (for black-padded interiors).
function innerContent(src, bx0, by0, bx1, by1) {
  const isBlack = (x, y) => {
    const [r, g, b] = px(src, x, y)
    return r < 30 && g < 30 && b < 30
  }
  let minx = bx1,
    miny = by1,
    maxx = bx0,
    maxy = by0
  for (let y = by0; y <= by1; y++)
    for (let x = bx0; x <= bx1; x++) {
      if (!isBlack(x, y)) {
        if (x < minx) minx = x
        if (x > maxx) maxx = x
        if (y < miny) miny = y
        if (y > maxy) maxy = y
      }
    }
  return [minx, miny, maxx, maxy]
}

function extractRoom(src, name, bx0, by0, bx1, by1) {
  const [ix0, iy0, ix1, iy1] = innerContent(src, bx0, by0, bx1, by1)
  cropTileAligned(src, ix0, iy0, ix1 - ix0 + 1, iy1 - iy0 + 1, name)
}

// --- Cerulean City ---
{
  const src = decode(path.join(ASSETS, 'cerulean_city.png'))
  // Town map: inside the frame (x 8), below the title bar (y 24), left of the gutter.
  cropTileAligned(src, 8, 24, 768, 640, 'cerulean')
  // Interiors (black-padded boxes in the right columns).
  extractRoom(src, 'interior_pokecenter', 790, 24, 1023, 174)
  extractRoom(src, 'interior_mart', 790, 208, 954, 349)
  extractRoom(src, 'interior_gym', 1032, 24, 1303, 343)
  extractRoom(src, 'interior_house', 1032, 373, 1216, 519)
}

console.log('Extracted maps to', OUT)
