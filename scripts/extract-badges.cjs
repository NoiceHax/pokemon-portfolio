/**
 * Extracts the 8 Kanto gym-badge icons from public/assets/badges.png (a JPEG the user
 * supplied, despite the .png name) into transparent PNGs under public/assets/sprites/.
 *
 * The source is a lossy JPEG photo of a badge case (badges in a 4×2 grid on a white
 * frame with labels beneath). A minimal PNG decoder can't read JPEG, so this uses a
 * headless-Chrome canvas to decode + crop + key the frame background to transparency.
 * Cell bounds are hand-tuned to exclude the label text band.
 *
 * Requires the dev/prod server running so the image is served at /assets/badges.png.
 * Run: `node scripts/extract-badges.cjs` (with `npm run start` up on :3000).
 */
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright-core')

const OUT = path.join(__dirname, '..', 'public', 'assets', 'sprites')
const NAMES = ['boulder', 'cascade', 'thunder', 'rainbow', 'soul', 'marsh', 'volcano', 'earth']
const COLS = [
  [45, 120],
  [140, 212],
  [232, 312],
  [335, 420],
]
const ROWS = [
  [116, 208],
  [250, 340],
]

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/nope', { waitUntil: 'domcontentloaded' })
  const out = await page.evaluate(
    ({ names, cols, rows }) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const W = img.naturalWidth,
            H = img.naturalHeight
          const c = document.createElement('canvas')
          c.width = W
          c.height = H
          const ctx = c.getContext('2d')
          ctx.drawImage(img, 0, 0)
          const data = ctx.getImageData(0, 0, W, H).data
          const badgePixel = (x, y) => {
            const i = (y * W + x) * 4
            const r = data[i],
              g = data[i + 1],
              b = data[i + 2]
            const light = (Math.max(r, g, b) + Math.min(r, g, b)) / 2
            const sat = Math.max(r, g, b) - Math.min(r, g, b)
            if (light > 212) return false
            if (light < 30) return true
            return sat > 45
          }
          const results = []
          let idx = 0
          for (let ri = 0; ri < 2; ri++)
            for (let ci = 0; ci < 4; ci++) {
              const [cx0, cx1] = cols[ci]
              const [ry0, ry1] = rows[ri]
              let minx = cx1,
                miny = ry1,
                maxx = cx0,
                maxy = ry0,
                found = false
              for (let y = ry0; y < ry1; y++)
                for (let x = cx0; x < cx1; x++)
                  if (badgePixel(x, y)) {
                    found = true
                    if (x < minx) minx = x
                    if (x > maxx) maxx = x
                    if (y < miny) miny = y
                    if (y > maxy) maxy = y
                  }
              if (!found) {
                idx++
                continue
              }
              minx = Math.max(cx0, minx - 2)
              miny = Math.max(ry0, miny - 2)
              maxx = Math.min(cx1, maxx + 2)
              maxy = Math.min(ry1, maxy + 2)
              const w = maxx - minx + 1,
                h = maxy - miny + 1
              const oc = document.createElement('canvas')
              oc.width = w
              oc.height = h
              const octx = oc.getContext('2d')
              const od = octx.createImageData(w, h)
              for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++) {
                  const si = ((miny + y) * W + (minx + x)) * 4
                  const di = (y * w + x) * 4
                  od.data[di] = data[si]
                  od.data[di + 1] = data[si + 1]
                  od.data[di + 2] = data[si + 2]
                  od.data[di + 3] = badgePixel(minx + x, miny + y) ? 255 : 0
                }
              octx.putImageData(od, 0, 0)
              results.push({ name: names[idx], dataUrl: oc.toDataURL('image/png') })
              idx++
            }
          resolve(results)
        }
        img.onerror = () => resolve([])
        img.src = '/assets/badges.png'
      }),
    { names: NAMES, cols: COLS, rows: ROWS },
  )
  for (const r of out) {
    const b64 = r.dataUrl.split(',')[1]
    fs.writeFileSync(path.join(OUT, `badge_${r.name}.png`), Buffer.from(b64, 'base64'))
    console.log('wrote badge_' + r.name + '.png')
  }
  await browser.close()
}

main()
