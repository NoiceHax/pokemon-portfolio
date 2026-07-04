const fs = require('fs')
const zlib = require('zlib')

function decode(path) {
  const b = fs.readFileSync(path)
  let p = 8
  let W, H, ct, bd
  const idat = []
  while (p < b.length) {
    const len = b.readUInt32BE(p)
    const type = b.toString('ascii', p + 4, p + 8)
    const data = b.slice(p + 8, p + 8 + len)
    if (type === 'IHDR') {
      W = data.readUInt32BE(0)
      H = data.readUInt32BE(4)
      bd = data[8]
      ct = data[9]
    }
    if (type === 'IDAT') idat.push(data)
    p += 12 + len
  }
  if (ct !== 6 && ct !== 2) throw new Error('expected colorType 2 or 6, got ' + ct)
  const srcCh = ct === 6 ? 4 : 3
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = W * srcCh
  const filtered = Buffer.alloc(W * H * srcCh)
  let ip = 0
  let prev = Buffer.alloc(stride)
  for (let y = 0; y < H; y++) {
    const f = raw[ip++]
    const line = raw.slice(ip, ip + stride)
    ip += stride
    const cur = Buffer.alloc(stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= srcCh ? cur[x - srcCh] : 0
      const bb = prev[x]
      const c = x >= srcCh ? prev[x - srcCh] : 0
      let v = line[x]
      if (f === 1) v = (v + a) & 255
      else if (f === 2) v = (v + bb) & 255
      else if (f === 3) v = (v + ((a + bb) >> 1)) & 255
      else if (f === 4) {
        const pa = Math.abs(bb - c),
          pb = Math.abs(a - c),
          pc = Math.abs(a + bb - 2 * c)
        let pr = pa <= pb && pa <= pc ? a : pb <= pc ? bb : c
        v = (v + pr) & 255
      }
      cur[x] = v
    }
    cur.copy(filtered, y * stride)
    prev = cur
  }
  // Normalize to RGBA for downstream use.
  const out = Buffer.alloc(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    out[i * 4] = filtered[i * srcCh]
    out[i * 4 + 1] = filtered[i * srcCh + 1]
    out[i * 4 + 2] = filtered[i * srcCh + 2]
    out[i * 4 + 3] = srcCh === 4 ? filtered[i * srcCh + 3] : 255
  }
  return { W, H, data: out }
}

// Encode an RGBA buffer to a PNG file.
function encode(path, W, H, data) {
  const ch = 4
  const stride = W * ch
  const rawLen = (stride + 1) * H
  const raw = Buffer.alloc(rawLen)
  for (let y = 0; y < H; y++) {
    raw[y * (stride + 1)] = 0 // filter none
    data.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const comp = zlib.deflateSync(raw)
  const chunks = []
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  function chunk(type, body) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(body.length)
    const t = Buffer.from(type, 'ascii')
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([t, body])) >>> 0)
    return Buffer.concat([len, t, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  chunks.push(sig, chunk('IHDR', ihdr), chunk('IDAT', comp), chunk('IEND', Buffer.alloc(0)))
  fs.writeFileSync(path, Buffer.concat(chunks))
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return c ^ 0xffffffff
}

// Extract a WxH cell at (sx,sy) from src, keying out a background color to alpha.
function extract(src, sx, sy, w, h, bg, tol = 24) {
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((sy + y) * src.W + (sx + x)) * 4
      const di = (y * w + x) * 4
      const r = src.data[si],
        g = src.data[si + 1],
        b = src.data[si + 2]
      out[di] = r
      out[di + 1] = g
      out[di + 2] = b
      const isBg =
        bg &&
        Math.abs(r - bg[0]) < tol &&
        Math.abs(g - bg[1]) < tol &&
        Math.abs(b - bg[2]) < tol
      out[di + 3] = isBg ? 0 : 255
    }
  }
  return out
}

function px(src, x, y) {
  const i = (y * src.W + x) * 4
  return [src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3]]
}

module.exports = { decode, encode, extract, px }
