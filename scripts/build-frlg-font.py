"""
Build a real TrueType font from the FireRed/LeafGreen bitmap glyph atlas so the whole
site can use the authentic in-game font via a normal CSS @font-face.

Source: public/assets/fonts/frlg_font.png (256x512, 16x16-px cells, transparent bg with
solid-black glyph strokes; produced by scripts/gen-font-atlas.cjs). Cell (col,row) for a
FRLG charmap code c = (c % 16, c // 16).

We trace each glyph's opaque pixels into unit squares (TrueType nonzero winding handles
the overlapping/adjacent squares fine), set a proportional advance width from the glyph's
actual inked width, and map the ASCII characters we care about. Output: a .ttf served from
public/assets/fonts/.

Run: python scripts/build-frlg-font.py
"""
import os
from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

HERE = os.path.dirname(__file__)
ATLAS = os.path.join(HERE, "..", "public", "assets", "fonts", "frlg_font.png")
OUT = os.path.join(HERE, "..", "public", "assets", "fonts", "PokemonFRLG.ttf")

CELL = 16          # source glyph cell size in px
UPEM = 1024        # font units per em
PXU = UPEM // CELL # units per source pixel (64)
# The bitmap glyphs occupy the top ~13 rows of each 16px cell. We place the baseline so
# glyphs sit nicely: treat the cell top as the cap area. Descenders (g,j,p,q,y) dip below.
BASELINE_ROW = 13  # pixel row (from top) that maps to the font baseline

# char -> FRLG charmap code (cell index). From pokefirered/charmap.txt.
CHAR_CODE = {
    " ": 0x00,
    "0": 0xA1, "1": 0xA2, "2": 0xA3, "3": 0xA4, "4": 0xA5,
    "5": 0xA6, "6": 0xA7, "7": 0xA8, "8": 0xA9, "9": 0xAA,
    "!": 0xAB, "?": 0xAC, ".": 0xAD, "-": 0xAE, "·": 0xAF,
    ",": 0xB8, "/": 0xBA, "'": 0xB4, "“": 0xB1, "”": 0xB2,
    "…": 0xB0, "%": 0x5B, "(": 0x5C, ")": 0x5D,
}
for i, ch in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
    CHAR_CODE[ch] = 0xBB + i
for i, ch in enumerate("abcdefghijklmnopqrstuvwxyz"):
    CHAR_CODE[ch] = 0xD5 + i

img = Image.open(ATLAS).convert("RGBA")
W, H = img.size
px = img.load()


def glyph_pixels(code):
    """Return (set_of_(col,row)_inked_pixels, min_x, max_x) within the cell."""
    cx, cy = (code % 16) * CELL, (code // 16) * CELL
    pts, minx, maxx = set(), CELL, -1
    for ry in range(CELL):
        for rx in range(CELL):
            a = px[cx + rx, cy + ry][3]
            if a > 128:
                pts.add((rx, ry))
                minx = min(minx, rx)
                maxx = max(maxx, rx)
    return pts, minx, maxx


def build_contours(pts, pen):
    """Draw each inked pixel as a unit square (CCW) at baseline-relative coords."""
    for (rx, ry) in pts:
        x0 = rx * PXU
        x1 = (rx + 1) * PXU
        # y grows upward in font space; baseline at BASELINE_ROW.
        y_top = (BASELINE_ROW - ry) * PXU
        y_bot = (BASELINE_ROW - ry - 1) * PXU
        pen.moveTo((x0, y_bot))
        pen.lineTo((x0, y_top))
        pen.lineTo((x1, y_top))
        pen.lineTo((x1, y_bot))
        pen.closePath()


glyph_order = [".notdef", "space"]
char_map = {}
glyphs = {}
advances = {}

# .notdef: empty box advance
pen = TTGlyphPen(None)
glyphs[".notdef"] = pen.glyph()
advances[".notdef"] = 6 * PXU

# space
glyphs["space"] = TTGlyphPen(None).glyph()
advances["space"] = 6 * PXU
char_map[ord(" ")] = "space"

for ch, code in CHAR_CODE.items():
    if ch == " ":
        continue
    name = "uni%04X" % ord(ch)
    pts, minx, maxx = glyph_pixels(code)
    pen = TTGlyphPen(None)
    if pts:
        build_contours(pts, pen)
    glyphs[name] = pen.glyph()
    # Proportional advance: inked width + 1px spacing (min 3px for tiny glyphs).
    width = (maxx - minx + 1) if maxx >= 0 else 4
    advances[name] = (max(width, 3) + 1) * PXU
    char_map[ord(ch)] = name
    glyph_order.append(name)

fb = FontBuilder(UPEM, isTTF=True)
fb.setupGlyphOrder(glyph_order)
fb.setupCharacterMap(char_map)
fb.setupGlyf(glyphs)
metrics = {g: (advances.get(g, 6 * PXU), 0) for g in glyph_order}
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=int(0.8 * UPEM), descent=-int(0.2 * UPEM))
fb.setupNameTable({
    "familyName": "Pokemon FRLG",
    "styleName": "Regular",
    "psName": "PokemonFRLG-Regular",
})
fb.setupOS2(sTypoAscender=int(0.8 * UPEM), sTypoDescender=-int(0.2 * UPEM))
fb.setupPost()
fb.save(OUT)
print("Wrote", OUT, "with", len(glyph_order), "glyphs")
