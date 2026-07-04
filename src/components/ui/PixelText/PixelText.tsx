'use client'

/**
 * PixelText - renders a string using the actual FireRed/LeafGreen bitmap font.
 *
 * The glyphs come from the game's own font sheet (decomp `latin_normal.png`, sliced to a
 * transparent atlas by scripts/gen-font-atlas.cjs). Each character is drawn as a 16x16
 * cell blitted from the atlas via `background-position`, scaled up by `scale` with nearest
 * -neighbour so it stays pixel-crisp. This is the literal in-game font - not a lookalike
 * web font - used for the Emulator Boot / title screens.
 *
 * Only the printable ASCII the title screens need is mapped; unmapped characters render as
 * a blank space. Colour: the atlas glyphs are solid black, tintable via CSS `filter` (we
 * expose a `tone` for the common black / white / red cases the boot uses).
 */

const ATLAS = '/assets/fonts/frlg_font.png'
const CELL = 16 // source glyph cell size in px
const COLS = 16 // atlas columns
const ATLAS_W = 256
const ATLAS_H = 512

/**
 * Character → cell code in the FRLG font sheet (from decomp charmap.txt). The cell's
 * (col,row) = (code % 16, floor(code / 16)). Codes are the game's own charmap, not ASCII.
 */
const CHAR_CODE: Record<string, number> = {
  ' ': 0x00,
  '0': 0xa1, '1': 0xa2, '2': 0xa3, '3': 0xa4, '4': 0xa5,
  '5': 0xa6, '6': 0xa7, '7': 0xa8, '8': 0xa9, '9': 0xaa,
  '!': 0xab, '?': 0xac, '.': 0xad, '-': 0xae, '·': 0xaf,
  ',': 0xb8, '/': 0xba, "'": 0xb4, '‘': 0xb3, '’': 0xb4,
  '“': 0xb1, '”': 0xb2, '…': 0xb0, '%': 0x5b, '(': 0x5c, ')': 0x5d,
  A: 0xbb, B: 0xbc, C: 0xbd, D: 0xbe, E: 0xbf, F: 0xc0, G: 0xc1,
  H: 0xc2, I: 0xc3, J: 0xc4, K: 0xc5, L: 0xc6, M: 0xc7, N: 0xc8,
  O: 0xc9, P: 0xca, Q: 0xcb, R: 0xcc, S: 0xcd, T: 0xce, U: 0xcf,
  V: 0xd0, W: 0xd1, X: 0xd2, Y: 0xd3, Z: 0xd4,
  a: 0xd5, b: 0xd6, c: 0xd7, d: 0xd8, e: 0xd9, f: 0xda, g: 0xdb,
  h: 0xdc, i: 0xdd, j: 0xde, k: 0xdf, l: 0xe0, m: 0xe1, n: 0xe2,
  o: 0xe3, p: 0xe4, q: 0xe5, r: 0xe6, s: 0xe7, t: 0xe8, u: 0xe9,
  v: 0xea, w: 0xeb, x: 0xec, y: 0xed, z: 0xee,
}

/** CSS filter to recolour the solid-black atlas glyphs. */
const TONE_FILTER: Record<string, string> = {
  black: 'none',
  white: 'invert(1)',
  // Approximate the FireRed title red via a hue/sat solve on black→red.
  red: 'invert(28%) sepia(88%) saturate(6000%) hue-rotate(354deg) brightness(95%)',
  ink: 'brightness(0) saturate(100%) invert(13%) sepia(8%) saturate(600%) hue-rotate(180deg)',
}

export interface PixelTextProps {
  children: string
  /** Rendered glyph size in px (one cell). Default 16 (1x). Boot uses larger. */
  size?: number
  /** Extra px between glyphs (the font is proportional-ish; a small gap reads best). */
  letterSpacing?: number
  tone?: keyof typeof TONE_FILTER
  className?: string
  'aria-hidden'?: boolean
}

// FRLG glyphs are left-aligned and sit in the left ~62% of their 16px cell, so we crop
// each rendered glyph box to that fraction. This pulls letters into readable words
// instead of the wide, disconnected spacing a full-cell advance would give.
const GLYPH_WIDTH_RATIO = 0.62

export function PixelText({
  children,
  size = 16,
  letterSpacing = 1,
  tone = 'black',
  className,
  'aria-hidden': ariaHidden,
}: PixelTextProps) {
  const s = size / CELL // scale factor
  const glyphW = Math.round(size * GLYPH_WIDTH_RATIO) // visible advance per glyph
  const chars = [...children]

  return (
    <span
      className={className}
      // Keep it accessible: the visible glyphs are decorative <span>s, so expose the real
      // text to screen readers via aria-label while hiding the glyph spans.
      role="img"
      aria-label={ariaHidden ? undefined : children}
      aria-hidden={ariaHidden}
      style={{ display: 'inline-flex', alignItems: 'flex-end', lineHeight: 1 }}
    >
      {chars.map((ch, i) => {
        if (ch === ' ') {
          return <span key={i} style={{ width: glyphW, height: size }} />
        }
        const code = CHAR_CODE[ch]
        if (code === undefined) {
          return <span key={i} style={{ width: glyphW, height: size }} />
        }
        const col = code % COLS
        const row = Math.floor(code / COLS)
        return (
          <span
            key={i}
            aria-hidden
            style={{
              // Clip each glyph to its visible left portion so letters sit close together.
              width: glyphW,
              height: size,
              marginRight: i < chars.length - 1 ? letterSpacing : 0,
              overflow: 'hidden',
              backgroundImage: `url(${ATLAS})`,
              backgroundRepeat: 'no-repeat',
              // Scale the whole atlas so each 16px cell becomes `size` px.
              backgroundSize: `${ATLAS_W * s}px ${ATLAS_H * s}px`,
              backgroundPosition: `-${col * size}px -${row * size}px`,
              imageRendering: 'pixelated',
              filter: TONE_FILTER[tone],
              flex: 'none',
            }}
          />
        )
      })}
    </span>
  )
}
