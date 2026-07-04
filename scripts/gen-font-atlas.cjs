/**
 * Builds the FireRed/LeafGreen bitmap-font atlas used by the <PixelText> component.
 *
 * Source: the pokefirered decomp's `graphics/fonts/latin_normal.png` — a clean, uniform
 * 16x16 glyph grid (16 columns) laid out by the game's character codes. It's a paletted
 * PNG on a light-blue background; this script (working from an RGBA copy produced by
 * ffmpeg, since our tiny PNG reader only handles truecolor) keys the blue to transparency
 * and normalises the glyph pixels to solid black, then writes a truecolor RGBA atlas the
 * browser can tint/scale crisply.
 *
 *   Input : <scratch>/latin_rgba.png   (ffmpeg -pix_fmt rgba of latin_normal.png)
 *   Output: public/assets/fonts/frlg_font.png   (256x512, transparent, black glyphs)
 *
 * The glyph→cell mapping (from decomp charmap.txt) lives in the component, not here — this
 * script only produces the pixels. Cell (col,row) for a code c = (c % 16, floor(c / 16)).
 */
const path = require('path')
const { decode, encode, px } = require('./pngtool.cjs')

const SCRATCH = process.argv[2]
if (!SCRATCH) throw new Error('pass the scratch dir holding latin_rgba.png as argv[2]')

const src = decode(path.join(SCRATCH, 'latin_rgba.png'))
const out = Buffer.alloc(src.W * src.H * 4)

// Each glyph cell has TWO background layers: the sheet's light-blue gutter AND a white
// sub-box the glyph is drawn on. Only the dark-grey glyph STROKES are foreground. So we
// keep pixels that are genuinely dark and drop everything else (blue OR white).
const isGlyph = (r, g, b) => (r + g + b) / 3 < 140

for (let y = 0; y < src.H; y++) {
  for (let x = 0; x < src.W; x++) {
    const [r, g, b] = px(src, x, y)
    const i = (y * src.W + x) * 4
    if (isGlyph(r, g, b)) {
      // Solid black glyph stroke (crisp; tint via CSS if needed).
      out[i] = 0
      out[i + 1] = 0
      out[i + 2] = 0
      out[i + 3] = 255
    } else {
      out[i + 3] = 0 // transparent (blue gutter or white glyph box)
    }
  }
}

const outPath = path.join(__dirname, '..', 'public', 'assets', 'fonts', 'frlg_font.png')
require('fs').mkdirSync(path.dirname(outPath), { recursive: true })
encode(outPath, src.W, src.H, out)
console.log('Wrote', outPath, `(${src.W}x${src.H})`)
