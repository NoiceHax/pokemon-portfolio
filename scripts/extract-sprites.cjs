/**
 * Sprite extraction — unpacks individual sprites from the packed FRLG sheets in
 * public/assets and writes background-keyed PNGs to public/assets/sprites/.
 *
 * The source sheets pack many sprites on an orange (255,127,39) or white key color,
 * separated by white gridlines. This script cuts specific cells, keys the background
 * to transparency, and saves clean frames the app can render directly.
 *
 * Run: `node scripts/extract-sprites.cjs`
 *
 * Cell geometry was measured from the sheets (see docs/DECISIONS.md, sprite unpacking).
 */
const path = require('path')
const fs = require('fs')
const { decode, extract, encode, px } = require('./pngtool.cjs')

const ASSETS = path.join(__dirname, '..', 'public', 'assets')
const OUT = path.join(ASSETS, 'sprites')
fs.mkdirSync(OUT, { recursive: true })

const ORANGE = [255, 127, 39]

/**
 * Erase full-width white ROWS and full-height white COLUMNS from an extracted RGBA cell.
 * The source sheets separate cells with 1px white gridlines; depending on where a sprite
 * sits in its cell, a line can land at a frame edge and render as a white bar beside or
 * under the sprite. A real sprite never has an entire row/column spanning the frame that
 * is purely white (with no other colour), so clearing those lines is safe.
 */
function clearGridlineRows(cell, w, h) {
  const at = (x, y) => (y * w + x) * 4
  const isWhite = (i) => cell[i] > 220 && cell[i + 1] > 220 && cell[i + 2] > 220
  // Full-width white rows.
  for (let y = 0; y < h; y++) {
    let allWhiteOrClear = true
    let anyWhite = false
    for (let x = 0; x < w; x++) {
      const i = at(x, y)
      if (cell[i + 3] !== 0 && isWhite(i)) anyWhite = true
      else if (cell[i + 3] !== 0) {
        allWhiteOrClear = false
        break
      }
    }
    if (allWhiteOrClear && anyWhite) for (let x = 0; x < w; x++) cell[at(x, y) + 3] = 0
  }
  // Full-height white columns.
  for (let x = 0; x < w; x++) {
    let allWhiteOrClear = true
    let anyWhite = false
    for (let y = 0; y < h; y++) {
      const i = at(x, y)
      if (cell[i + 3] !== 0 && isWhite(i)) anyWhite = true
      else if (cell[i + 3] !== 0) {
        allWhiteOrClear = false
        break
      }
    }
    if (allWhiteOrClear && anyWhite) for (let y = 0; y < h; y++) cell[at(x, y) + 3] = 0
  }
}

/**
 * Erase the character's baked drop-shadow. FRLG overworld cells draw a small shadow oval
 * at the BOTTOM of the cell, separated from the character's body by a transparent gap.
 * We find the body (first run of non-transparent rows from the top), then the transparent
 * gap after it, and clear everything below the gap — the detached shadow — so sprites sit
 * clean on the ground (matching the reference, which shows no shadow).
 */
function clearDetachedShadow(cell, w, h) {
  const rowHasPixels = (y) => {
    for (let x = 0; x < w; x++) if (cell[(y * w + x) * 4 + 3] !== 0) return true
    return false
  }
  let y = 0
  while (y < h && !rowHasPixels(y)) y++ // skip leading transparent rows
  while (y < h && rowHasPixels(y)) y++ // skip the body
  const gapStart = y
  while (y < h && !rowHasPixels(y)) y++ // skip the gap
  // If a gap existed AND there are pixels below it, those pixels are the detached shadow.
  if (gapStart < h && y < h) {
    for (let yy = gapStart; yy < h; yy++)
      for (let x = 0; x < w; x++) cell[(yy * w + x) * 4 + 3] = 0
  }
}

// --- Player (Red) overworld walk frames ---
// The walk cycle lives in the TOP-LEFT block of the sheet: 3 columns
// (idle, step-A, step-B) × 4 rows (down/up/left/right). Geometry was measured by
// scanning the sheet for the actual sprite pixel clusters (not the gridlines): each
// sprite body is ~15w × ~19h. Row TOPS: down 55, up 88, left 121, right 154 (33px
// pitch). Column LEFTS: 8, 25, 42 (17px pitch). We cut with a few px of top margin and
// a taller cell so the hat top and the feet are never clipped, then clean the edges.
// (Earlier origins were ~13px too high, cutting the feet off and leaving a big empty
// band above the hat.)
{
  const src = decode(path.join(ASSETS, 'Playable_Characters', 'Player_Sprites.png'))
  const cols = [7, 24, 41] // idle, step A, step B (1px left margin)
  const tops = { down: 55, up: 88, left: 121, right: 154 }
  const MARGIN_TOP = 3
  const W = 18,
    H = 24
  // Tight tolerance (28): the orange background is a flat solid, so a small tolerance
  // removes it cleanly WITHOUT eating the reddish cap highlights, which sit close to
  // orange in the naive per-channel test (that was making the cap top transparent).
  for (const [dir, top] of Object.entries(tops)) {
    cols.forEach((sx, f) => {
      const cell = extract(src, sx, top - MARGIN_TOP, W, H, ORANGE, 28)
      clearGridlineRows(cell, W, H)
      clearDetachedShadow(cell, W, H)
      encode(path.join(OUT, `red_${dir}_${f}.png`), W, H, cell)
    })
  }

  // Large detailed hero portrait (used as the Trainer Card avatar). Keys out both the
  // orange background and the mint platform the hero stands on.
  const isPlatform = (x, y) => {
    const [r, g, b] = px(src, x, y)
    return g > 170 && b > 160 && r > 140 && Math.abs(g - b) < 50 && g >= r
  }
  const hx = 501,
    hy = 188,
    hw = 83,
    hh = 91
  const hero = extract(src, hx, hy, hw, hh, ORANGE, 45)
  for (let y = 0; y < hh; y++)
    for (let x = 0; x < hw; x++) {
      if (isPlatform(hx + x, hy + y)) hero[(y * hw + x) * 4 + 3] = 0
    }
  encode(path.join(OUT, 'red_hero.png'), hw, hh, hero)
}

// --- Overworld NPCs: directional walk frames ---
// Each NPC occupies one horizontal strip (~25px row pitch; real strips start at y=47,
// after the sheet's "Characters" header). Within a strip the poses sit on a 17px column
// pitch: down idle/step at x 7/24, up at 41/58, side at 92/109. (Right reuses side; the
// renderer mirrors for left.) `top` is each sprite's measured pixel top; we cut with a
// small top margin and a tall-enough cell so hat tops and feet are never clipped, then
// clean gridline rows + the baked shadow. Six frames per NPC = a real 2-frame walk cycle
// per direction. Strip tops were measured by scanning the sheet for sprite clusters.
{
  const src = decode(path.join(ASSETS, 'Trainers_NPCs', 'Overworld_NPCs.png'))
  const COL = { down: [7, 24], up: [41, 58], side: [92, 109] }
  const MARGIN_TOP = 3
  const W = 18,
    H = 24
  // Distinct, recognisable townsfolk chosen from the sheet (name → strip top).
  const picks = [
    ['npc_a', 246], // researcher (glasses)
    ['npc_b', 96], //  youngster (blond)
    ['npc_c', 395], // nurse (red/white cap)
    ['npc_d', 145], // woman (purple hair)
    ['npc_e', 172], // lass (green)
    ['npc_f', 221], // shopkeeper (apron)
    ['npc_g', 345], // pink-hat girl
    ['npc_h', 370], // brown-hair townsperson
  ]
  for (const [name, top] of picks) {
    for (const [dir, xs] of Object.entries(COL)) {
      xs.forEach((sx, f) => {
        // Tight tolerance (28) so warm-coloured caps/clothes aren't eaten as background.
        const cell = extract(src, sx, top - MARGIN_TOP, W, H, ORANGE, 28)
        clearGridlineRows(cell, W, H)
        clearDetachedShadow(cell, W, H)
        encode(path.join(OUT, `${name}_${dir}_${f}.png`), W, H, cell)
      })
    }
  }
}

// --- Charizard title mascot from the ending pixel-art sheet (white-keyed) ---
{
  const src = decode(path.join(ASSETS, 'Miscellaneous', 'Intro_and_Title.png'))
  // Bounding box of the top-left Charizard, limited to the first frame.
  let minx = 999,
    miny = 999,
    maxx = 0,
    maxy = 0
  const isWhite = (x, y) => {
    const [r, g, b] = px(src, x, y)
    return r > 245 && g > 245 && b > 245
  }
  for (let y = 0; y < 105; y++)
    for (let x = 0; x < 85; x++) {
      if (!isWhite(x, y)) {
        if (x < minx) minx = x
        if (x > maxx) maxx = x
        if (y < miny) miny = y
        if (y > maxy) maxy = y
      }
    }
  const w = maxx - minx + 1,
    h = maxy - miny + 1
  encode(path.join(OUT, 'charizard.png'), w, h, extract(src, minx, miny, w, h, [255, 255, 255], 12))
}

// --- Professor Oak (full-body lecture sprite) from the orange-keyed row ---
{
  const src = decode(path.join(ASSETS, 'Miscellaneous', 'Professor_Oak_Lecture.png'))
  // Hand-tuned tight box around Oak in the bottom orange-keyed sprite row.
  // The cell has white gridlines at x=0,6-7 (left) and x=72 (right); Oak's body is
  // between x=8 and x=71, so we crop inside those lines.
  const sx = 8,
    sy = 927,
    w = 63,
    h = 88
  const d = extract(src, sx, sy, w, h, ORANGE, 40)
  // Clear residual white gridline pixels only at the extreme edges (columns 0-1 and
  // the last two) so Oak's off-white lab coat in the interior is untouched.
  for (let y = 0; y < h; y++) {
    for (const x of [0, 1, w - 2, w - 1]) {
      const i = (y * w + x) * 4
      if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) d[i + 3] = 0
    }
  }
  encode(path.join(OUT, 'prof_oak.png'), w, h, d)
}

console.log('Extracted sprites to', OUT)
