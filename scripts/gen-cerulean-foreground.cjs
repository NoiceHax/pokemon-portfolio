/**
 * Derives the Cerulean foreground layer (tree canopies) from the flat map so the
 * player can render BEHIND tree-tops (the renderer's Foreground layer).
 *
 * Cerulean ships as a single flat image with no lower/upper split. Trees are the
 * highest-impact walk-behind element. We keep green-dominant (foliage) pixels that sit
 * on BLOCKED collision tiles — the collision grid cleanly separates tree foliage
 * (blocked) from the visually-similar walkable grass (walkable), which colour alone
 * cannot. Everything else becomes transparent.
 *
 * Output: public/assets/maps/cerulean_upper.png.
 * Run: `node scripts/gen-cerulean-foreground.cjs`
 */
const fs = require('fs')
const path = require('path')
const { decode, encode, px } = require('./pngtool.cjs')

const MAP = path.join(__dirname, '..', 'public', 'assets', 'maps', 'cerulean.png')
const COLLISION = path.join(__dirname, '..', 'src', 'world', 'world', 'maps', 'ceruleanCollision.ts')
const OUT = path.join(__dirname, '..', 'public', 'assets', 'maps', 'cerulean_upper.png')
const TILE = 16

const src = decode(MAP)
const W = src.W,
  H = src.H
const rows = fs
  .readFileSync(COLLISION, 'utf8')
  .match(/'([.#]+)'/g)
  .map((s) => s.slice(1, -1))

const blocked = (tx, ty) => rows[ty] && rows[ty][tx] === '#'
const isGreen = (r, g, b) => g > r && g > b && g > 70 && !(r > 200 && g > 200)

const out = Buffer.alloc(W * H * 4)
let kept = 0
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4
    const [r, g, b] = px(src, x, y)
    if (blocked(Math.floor(x / TILE), Math.floor(y / TILE)) && isGreen(r, g, b)) {
      out[i] = r
      out[i + 1] = g
      out[i + 2] = b
      out[i + 3] = 255
      kept++
    } else {
      out[i + 3] = 0
    }
  }
encode(OUT, W, H, out)
console.log('wrote cerulean_upper.png,', kept, 'px')
