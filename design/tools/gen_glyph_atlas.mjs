// Generates assets/images/alien_glyphs.png — an 8x8 atlas of 64 abstract alien glyphs.
// Style target: dense, blocky, Mayan-hieroglyphic feel (cartouches, stacked bars, dot
// rows, step-frets, hooked arcs) but strictly non-figurative: no faces, no animals,
// nothing that reads as a letter or a plain geometric primitive.
//
// Pure Node, no dependencies (PNG is encoded by hand via zlib). Deterministic: same
// output on every run, so re-running never invalidates the char->cell mapping in
// src/glyphs.ts. Run from the scene root:
//
//   node design/tools/gen_glyph_atlas.mjs
//
// Symbols are drawn in white with an alpha channel; the scene tints them per-row via
// albedo/emissive color, so this file never needs recolouring.

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GRID = 8
const CELL = 128
const SIZE = GRID * CELL
const alpha = new Float32Array(SIZE * SIZE)

// ---------- deterministic RNG (mulberry32) ----------
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- rasteriser: signed-distance coverage, unioned via max ----------
// Strokes are crisp (alpha 1.0) with a ~1.6px antialiased edge and nothing else.
// An earlier version added a wide low-alpha skirt (0.32) around every stroke to
// fight mipmap erosion at a distance, but the material alpha-tests at 0.35 and the
// 0.03 margin is inside filtering/compression error — the whole skirt rendered as
// a hazy fringe around every glyph. Strokes are chunky enough (8-14px of 128) to
// survive minification without it.
const SKIRT = 0
const SKIRT_A = 0
function paint(x0, y0, x1, y1, sdf) {
  x0 = Math.max(0, Math.floor(x0 - SKIRT - 2))
  y0 = Math.max(0, Math.floor(y0 - SKIRT - 2))
  x1 = Math.min(SIZE - 1, Math.ceil(x1 + SKIRT + 2))
  y1 = Math.min(SIZE - 1, Math.ceil(y1 + SKIRT + 2))
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = sdf(x + 0.5, y + 0.5)
      if (d < SKIRT + 1.0) {
        const core = Math.min(1, Math.max(0, 0.5 - d / 1.6))
        const skirt = SKIRT_A * Math.min(1, Math.max(0, 0.5 - (d - SKIRT) / 1.6))
        const a = Math.max(core, skirt)
        const i = y * SIZE + x
        if (a > alpha[i]) alpha[i] = a
      }
    }
  }
}

// stroke a segment with round caps, half-width w
function segment(ax, ay, bx, by, w) {
  paint(Math.min(ax, bx) - w, Math.min(ay, by) - w, Math.max(ax, bx) + w, Math.max(ay, by) + w, (px, py) => {
    const dx = bx - ax, dy = by - ay
    const l2 = dx * dx + dy * dy || 1
    let t = ((px - ax) * dx + (py - ay) * dy) / l2
    t = Math.max(0, Math.min(1, t))
    const qx = ax + t * dx - px, qy = ay + t * dy - py
    return Math.hypot(qx, qy) - w
  })
}

function polyline(points, w) {
  for (let i = 0; i < points.length - 1; i++) {
    segment(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], w)
  }
}

function dot(cx, cy, r) {
  paint(cx - r, cy - r, cx + r, cy + r, (px, py) => Math.hypot(px - cx, py - cy) - r)
}

function ring(cx, cy, r, w) {
  paint(cx - r - w, cy - r - w, cx + r + w, cy + r + w, (px, py) => Math.abs(Math.hypot(px - cx, py - cy) - r) - w)
}

// arc from angle a0 to a1 (radians, CCW, y-down screen space), round caps
function arc(cx, cy, r, a0, a1, w) {
  const ex0 = cx + r * Math.cos(a0), ey0 = cy + r * Math.sin(a0)
  const ex1 = cx + r * Math.cos(a1), ey1 = cy + r * Math.sin(a1)
  paint(cx - r - w, cy - r - w, cx + r + w, cy + r + w, (px, py) => {
    let ang = Math.atan2(py - cy, px - cx)
    // normalise ang into [a0, a0+2pi)
    while (ang < a0) ang += Math.PI * 2
    if (ang <= a1) return Math.abs(Math.hypot(px - cx, py - cy) - r) - w
    const d0 = Math.hypot(px - ex0, py - ey0)
    const d1 = Math.hypot(px - ex1, py - ey1)
    return Math.min(d0, d1) - w
  })
}

function sdRoundBox(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - hw + r
  const qy = Math.abs(py - cy) - hh + r
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0)
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r
}

function boxFill(cx, cy, hw, hh, r) {
  paint(cx - hw, cy - hh, cx + hw, cy + hh, (px, py) => sdRoundBox(px, py, cx, cy, hw, hh, r))
}

function boxOutline(cx, cy, hw, hh, r, w) {
  paint(cx - hw - w, cy - hh - w, cx + hw + w, cy + hh + w, (px, py) => Math.abs(sdRoundBox(px, py, cx, cy, hw, hh, r)) - w)
}

// ---------- glyph vocabulary ----------
// All coordinates are cell-local (0..128); ox/oy shift into the atlas cell.
// Elements are chunky (stroke half-widths 4..7) so glyphs survive being displayed
// at ~0.5 m and stay readable against emissive tinting.

function dotRow(ox, oy, cx, cy, n, gap, r) {
  const x0 = cx - ((n - 1) * gap) / 2
  for (let i = 0; i < n; i++) dot(ox + x0 + i * gap, oy + cy, r)
}

function dotColumn(ox, oy, cx, cy, n, gap, r) {
  const y0 = cy - ((n - 1) * gap) / 2
  for (let i = 0; i < n; i++) dot(ox + cx, oy + y0 + i * gap, r)
}

function bar(ox, oy, cx, cy, halfLen, w) {
  segment(ox + cx - halfLen, oy + cy, ox + cx + halfLen, oy + cy, w)
}

function ticksUp(ox, oy, cx, cy, n, gap, len, w) {
  const x0 = cx - ((n - 1) * gap) / 2
  for (let i = 0; i < n; i++) segment(ox + x0 + i * gap, oy + cy, ox + x0 + i * gap, oy + cy - len, w)
}

// rectangular step-fret spiral (the Mayan "greca" motif), depth and turn count vary
function stepFret(ox, oy, R, rnd) {
  const c = 64
  const s = (v) => c + v
  const inA = 12 + rnd() * 8
  const inB = 22 + rnd() * 10
  const pts = [
    [s(-R), s(R)], [s(R), s(R)], [s(R), s(-R)], [s(-R + inA), s(-R)],
    [s(-R + inA), s(R - inB)], [s(R - inB), s(R - inB)]
  ]
  if (rnd() > 0.35) pts.push([s(R - inB), s(-R + inA + 8 + rnd() * 6)])
  polyline(pts.map(([x, y]) => [ox + x, oy + y]), 5 + rnd() * 1.5)
}

// hook: an open arc with a straight tail, a recurring Mayan scroll element
function hook(ox, oy, cx, cy, r, a0, sweep, w, R) {
  arc(ox + cx, oy + cy, r, a0, a0 + sweep, w)
  const ax = cx + r * Math.cos(a0), ay = cy + r * Math.sin(a0)
  segment(ox + ax, oy + ay, ox + ax, oy + ay + Math.min(18, R), w)
}

// ---------- glyph templates ----------
// Each returns void; composition rules keep dot clusters in rows/columns and
// asymmetric so nothing reads as eyes/a mouth.

// Face-avoidance rules baked into the vocabulary:
//  - never exactly two dots side by side inside an enclosure (reads as eyes)
//  - no centred dot inside a ring (reads as an eye)
//  - dot clusters are rows of 3+ or columns, and sit off-centre
const templates = [
  // A — cartouche: heavy rounded frame with stacked interior furniture
  function cartouche(ox, oy, rnd) {
    const hw = 38 + rnd() * 10
    const hh = 36 + rnd() * 12
    boxOutline(ox + 64, oy + 64, hw, hh, 10 + rnd() * 12, 4.5 + rnd() * 2)
    const nRows = 1 + Math.floor(rnd() * 3)
    const ys = [64 - hh * 0.45, 64, 64 + hh * 0.45].sort(() => rnd() - 0.5).slice(0, nRows)
    let usedDots = false
    for (const y of ys) {
      const kind = rnd()
      if (kind < 0.3 && !usedDots) {
        usedDots = true
        dotRow(ox, oy, 64 + (rnd() - 0.5) * 16, y, 3 + Math.floor(rnd() * 2), 15 + rnd() * 4, 4 + rnd() * 1.5)
      } else if (kind < 0.6) {
        bar(ox, oy, 64 + (rnd() - 0.5) * 16, y, hw - 16 - rnd() * 14, 4 + rnd() * 2)
      } else if (kind < 0.82) {
        ticksUp(ox, oy, 64 + (rnd() - 0.5) * 14, y + 8, 2 + Math.floor(rnd() * 3), 12 + rnd() * 5, 12 + rnd() * 9, 4)
      } else {
        arc(ox + 64 + (rnd() - 0.5) * 20, oy + y, 9 + rnd() * 7, Math.PI * rnd() * 2, Math.PI * (rnd() * 2 + 0.8 + rnd() * 0.6), 4.5)
      }
    }
    if (rnd() > 0.6) segment(ox + 64 + hw, oy + 50 + rnd() * 28, ox + 64 + hw + 10, oy + 50 + rnd() * 28, 4)
  },

  // B — bands: stacked heavy bars with an off-centre count above (Mayan numeral feel)
  function bands(ox, oy, rnd) {
    const nBars = 1 + Math.floor(rnd() * 3)
    const w = 5 + rnd() * 3
    const y0 = 66 + rnd() * 14
    const step = 15 + rnd() * 8
    for (let i = 0; i < nBars; i++) bar(ox, oy, 60 + rnd() * 10, y0 + i * step, 24 + rnd() * 16, w)
    if (rnd() < 0.55) dotRow(ox, oy, 56 + rnd() * 18, y0 - 20 - rnd() * 8, 3 + Math.floor(rnd() * 2), 16 + rnd() * 4, 4.5 + rnd() * 2)
    else dotColumn(ox, oy, 30 + rnd() * 10, y0 - 26, 2 + Math.floor(rnd() * 2), 17, 4.5 + rnd() * 1.5)
    const deco = rnd()
    if (deco < 0.4) hook(ox, oy, 24 + rnd() * 60, 30 + rnd() * 8, 10 + rnd() * 7, -Math.PI / 2 + rnd(), Math.PI * (0.9 + rnd() * 0.7), 4.5, 8 + rnd() * 8)
    else if (deco < 0.7) ticksUp(ox, oy, 84 + rnd() * 10, 38 + rnd() * 8, 2 + Math.floor(rnd() * 2), 12, 12 + rnd() * 10, 4)
    else boxOutline(ox + 86 + rnd() * 8, oy + 34 + rnd() * 8, 10 + rnd() * 5, 10 + rnd() * 5, 5, 4)
  },

  // C — concentric: broken rings with radial ticks and a crossing chord — never
  // a centred dot (eye)
  function concentric(ox, oy, rnd) {
    const cx = 56 + rnd() * 16, cy = 56 + rnd() * 16
    const R = 26 + rnd() * 12
    const gapStart = rnd() * Math.PI * 2
    if (rnd() < 0.5) ring(ox + cx, oy + cy, R, 4.5 + rnd() * 1.5)
    else arc(ox + cx, oy + cy, R, gapStart, gapStart + Math.PI * (1.3 + rnd() * 0.5), 4.5 + rnd() * 1.5)
    const a1 = rnd() * Math.PI * 2
    arc(ox + cx, oy + cy, R - 11 - rnd() * 5, a1, a1 + Math.PI * (0.5 + rnd() * 0.9), 4.5)
    const nT = 2 + Math.floor(rnd() * 4)
    const aOff = rnd() * Math.PI
    for (let i = 0; i < nT; i++) {
      const a = aOff + (i * Math.PI * 2) / nT + (rnd() - 0.5) * 0.4
      segment(
        ox + cx + (R + 3) * Math.cos(a), oy + cy + (R + 3) * Math.sin(a),
        ox + cx + (R + 12 + rnd() * 6) * Math.cos(a), oy + cy + (R + 12 + rnd() * 6) * Math.sin(a), 4
      )
    }
    // secant: a short off-centre cut near the rim — never through the middle,
    // which would read as a "no entry" sign
    if (rnd() > 0.35) {
      const ca = rnd() * Math.PI * 2
      const off = R * (0.45 + rnd() * 0.25)
      const half = Math.sqrt(Math.max(1, R * R - off * off)) + 4
      const nx = Math.cos(ca), ny = Math.sin(ca)
      segment(
        ox + cx + off * nx - half * ny, oy + cy + off * ny + half * nx,
        ox + cx + off * nx + half * ny, oy + cy + off * ny - half * nx, 4.5
      )
    }
  },

  // D — step-fret spiral (the Mayan "greca") with varied depth and accents
  function fret(ox, oy, rnd) {
    stepFret(ox, oy, 34 + rnd() * 11, rnd)
    const acc = rnd()
    if (acc < 0.35) dotColumn(ox, oy, 54 + rnd() * 14, 52 + rnd() * 10, 1 + Math.floor(rnd() * 2), 16, 5 + rnd() * 2)
    else if (acc < 0.7) bar(ox, oy, 56 + rnd() * 12, 52 + rnd() * 12, 7 + rnd() * 6, 4.5)
    else ticksUp(ox, oy, 58 + rnd() * 10, 62 + rnd() * 6, 2, 11, 10 + rnd() * 6, 4)
  },

  // E — split cell: a divider with unequal furniture on each side
  function split(ox, oy, rnd) {
    const dx = 46 + rnd() * 22
    segment(ox + dx, oy + 20 + rnd() * 8, ox + dx, oy + 100 + rnd() * 8, 5 + rnd() * 1.5)
    dotColumn(ox, oy, dx - 16 - rnd() * 10, 60 + (rnd() - 0.5) * 24, 2 + Math.floor(rnd() * 3), 18 + rnd() * 4, 5 + rnd() * 1.5)
    const rx = dx + 22 + rnd() * 10
    const kind = rnd()
    if (kind < 0.35) {
      boxOutline(ox + rx, oy + 48 + rnd() * 16, 12 + rnd() * 7, 16 + rnd() * 9, 6, 4.5)
      bar(ox, oy, rx, 94 + rnd() * 8, 9 + rnd() * 7, 4.5)
    } else if (kind < 0.7) {
      arc(ox + rx, oy + 46 + rnd() * 12, 12 + rnd() * 7, Math.PI * rnd(), Math.PI * (rnd() + 1.1 + rnd() * 0.7), 4.5)
      ticksUp(ox, oy, rx, 98 + rnd() * 4, 2 + Math.floor(rnd() * 2), 12, 12 + rnd() * 6, 4)
    } else {
      stepFretSmall(ox, oy, rx, 60 + rnd() * 10, 16 + rnd() * 5, rnd)
    }
  },

  // F — comb: baseline with irregular teeth and a detached scroll
  function comb(ox, oy, rnd) {
    const y = 92 + rnd() * 10
    const half = 32 + rnd() * 11
    bar(ox, oy, 64, y, half, 5 + rnd() * 2)
    const n = 3 + Math.floor(rnd() * 3)
    const gap = (half * 2 - 12) / (n - 1)
    for (let i = 0; i < n; i++) {
      if (rnd() < 0.12) continue // missing tooth
      const x = 64 - half + 6 + i * gap
      segment(ox + x, oy + y - 4, ox + x, oy + y - 16 - rnd() * 30, 4.5)
    }
    if (rnd() < 0.6) hook(ox, oy, 40 + rnd() * 44, 28 + rnd() * 10, 10 + rnd() * 8, -Math.PI * (0.2 + rnd() * 0.6), Math.PI * (1.0 + rnd() * 0.7), 4.5, 8 + rnd() * 6)
    else dotRow(ox, oy, 52 + rnd() * 22, 28 + rnd() * 8, 3, 14 + rnd() * 4, 4 + rnd())
  },

  // G — rails: parallel strokes with rungs, one rail overshooting into a curl
  function rails(ox, oy, rnd) {
    const x0 = 38 + rnd() * 12, x1 = 76 + rnd() * 14
    const yTop = 22 + rnd() * 10
    segment(ox + x0, oy + yTop, ox + x0, oy + 100 + rnd() * 6, 5)
    segment(ox + x1, oy + yTop + 10 + rnd() * 14, ox + x1, oy + 100 + rnd() * 6, 5)
    // rungs are deliberately skewed and overshoot — straight level rungs between
    // two rails read as the letter H
    const n = 1 + Math.floor(rnd() * 3)
    for (let i = 0; i < n; i++) {
      const y = 50 + rnd() * 46
      const skew = (rnd() - 0.5) * 16
      segment(ox + x0 - (rnd() > 0.6 ? 10 : 0), oy + y, ox + x1 + (rnd() > 0.5 ? 12 : 0), oy + y + skew, 4.5)
    }
    if (rnd() > 0.6) segment(ox + (x0 + x1) / 2, oy + 78 + rnd() * 16, ox + (x0 + x1) / 2, oy + 104, 4.5)
    const curlDir = rnd() > 0.5 ? 1 : -1
    arc(ox + x0 + 12 * curlDir, oy + yTop, 12, curlDir > 0 ? Math.PI : 0, curlDir > 0 ? Math.PI * (1.8 + rnd() * 0.4) : Math.PI * (0.8 + rnd() * 0.4), 4.5)
    if (rnd() > 0.5) dotColumn(ox, oy, x1 + 16, 46 + rnd() * 16, 1 + Math.floor(rnd() * 2), 16, 5)
  },

  // H — nested boxes: offset cartouches sharing a corner, plus a stray accent
  function nested(ox, oy, rnd) {
    const bx = 52 + rnd() * 12, by = 52 + rnd() * 12
    boxOutline(ox + bx, oy + by, 26 + rnd() * 11, 20 + rnd() * 11, 7 + rnd() * 4, 5)
    boxOutline(ox + bx + 20 + rnd() * 10, oy + by + 22 + rnd() * 8, 15 + rnd() * 8, 12 + rnd() * 7, 6, 4.5)
    const acc = rnd()
    if (acc < 0.4) dotColumn(ox, oy, 22 + rnd() * 6, 54 + rnd() * 16, 2 + Math.floor(rnd() * 2), 18, 4.5 + rnd())
    else if (acc < 0.7) ticksUp(ox, oy, bx - 8 + rnd() * 16, by - 6 + rnd() * 6, 2 + Math.floor(rnd() * 2), 11, 10 + rnd() * 6, 4)
    else bar(ox, oy, 26 + rnd() * 6, 40 + rnd() * 40, 8 + rnd() * 5, 4.5)
  }
]

// small step-fret used as a sub-element inside split cells
function stepFretSmall(ox, oy, cx, cy, R, rnd) {
  const pts = [
    [cx - R, cy + R], [cx + R, cy + R], [cx + R, cy - R],
    [cx - R + 8 + rnd() * 4, cy - R], [cx - R + 8 + rnd() * 4, cy + R - 12 - rnd() * 4]
  ].map(([x, y]) => [ox + x, oy + y])
  polyline(pts, 4.5)
}

// ---------- compose the atlas ----------
// Fixed template order cycles through the vocabulary so neighbouring cells differ;
// the per-glyph RNG seed keeps every cell unique and the whole file reproducible.
// After drawing, each cell gets one of the 8 dihedral orientations (flip/transpose)
// so two cells sharing a template rarely share a silhouette.
function orientCell(gx, gy, rnd) {
  const ox = gx * CELL, oy = gy * CELL
  const tmp = new Float32Array(CELL * CELL)
  for (let y = 0; y < CELL; y++)
    for (let x = 0; x < CELL; x++) tmp[y * CELL + x] = alpha[(oy + y) * SIZE + ox + x]
  const flipX = rnd() > 0.5, flipY = rnd() > 0.5, transpose = rnd() > 0.5
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      let sx = x, sy = y
      if (transpose) { const t = sx; sx = sy; sy = t }
      if (flipX) sx = CELL - 1 - sx
      if (flipY) sy = CELL - 1 - sy
      alpha[(oy + y) * SIZE + ox + x] = tmp[sy * CELL + sx]
    }
  }
}

for (let g = 0; g < GRID * GRID; g++) {
  const gx = g % GRID
  const gy = Math.floor(g / GRID)
  const rnd = mulberry32(0xa11e0 + g * 7919)
  templates[(g + gy * 3) % templates.length](gx * CELL, gy * CELL, rnd)
  orientCell(gx, gy, rnd)
}

// ---------- PNG encoding (RGBA8, filter 0) ----------
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (SIZE * 4 + 1)
  raw[rowStart] = 0
  for (let x = 0; x < SIZE; x++) {
    const a = Math.round(alpha[y * SIZE + x] * 255)
    const o = rowStart + 1 + x * 4
    raw[o] = 255
    raw[o + 1] = 255
    raw[o + 2] = 255
    raw[o + 3] = a
  }
}

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})
function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
])

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', '..', 'assets', 'images', 'alien_glyphs.png')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, png)
console.log(`wrote ${out} (${png.length} bytes, ${GRID}x${GRID} cells of ${CELL}px)`)

// --preview <path>: also write an opaque dark-background version (the shipped atlas is
// white-on-transparent, which is unviewable in most image viewers)
const previewIdx = process.argv.indexOf('--preview')
if (previewIdx !== -1 && process.argv[previewIdx + 1]) {
  const prevRaw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    const rowStart = y * (SIZE * 4 + 1)
    prevRaw[rowStart] = 0
    for (let x = 0; x < SIZE; x++) {
      const a = alpha[y * SIZE + x]
      const o = rowStart + 1 + x * 4
      const onGrid = x % CELL === 0 || y % CELL === 0
      const bg = onGrid ? 55 : 18
      prevRaw[o] = Math.round(bg + (255 - bg) * a)
      prevRaw[o + 1] = Math.round(bg + 4 + (255 - bg) * a)
      prevRaw[o + 2] = Math.round(bg + 14 + (241 - bg) * a)
      prevRaw[o + 3] = 255
    }
  }
  const prevPng = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(prevRaw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
  writeFileSync(process.argv[previewIdx + 1], prevPng)
  console.log(`wrote preview ${process.argv[previewIdx + 1]}`)

  // Alongside the preview, simulate distance rendering: box-filter the alpha down 8x
  // (mip level 3 — each 128px cell becomes 16px), apply the material's 0.35 alpha
  // test, and blow it back up nearest-neighbour. This is roughly what a glyph quad
  // looks like from across the room; strokes should survive as solid (if chunky)
  // shapes, not dissolve.
  const MIP = 8
  const mipPath = process.argv[previewIdx + 1].replace(/\.png$/, '_mip.png')
  const mipRaw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  const mSize = SIZE / MIP
  for (let y = 0; y < SIZE; y++) {
    const rowStart = y * (SIZE * 4 + 1)
    mipRaw[rowStart] = 0
    for (let x = 0; x < SIZE; x++) {
      const mx = Math.floor(x / MIP), my = Math.floor(y / MIP)
      let sum = 0
      for (let sy = 0; sy < MIP; sy++)
        for (let sx = 0; sx < MIP; sx++) sum += alpha[(my * MIP + sy) * SIZE + mx * MIP + sx]
      const pass = sum / (MIP * MIP) >= 0.35
      const onGrid = x % CELL === 0 || y % CELL === 0
      const bg = onGrid ? 55 : 18
      const o = rowStart + 1 + x * 4
      mipRaw[o] = pass ? 255 : bg
      mipRaw[o + 1] = pass ? 255 : bg + 4
      mipRaw[o + 2] = pass ? 241 : bg + 14
      mipRaw[o + 3] = 255
    }
  }
  void mSize
  const mipPng = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(mipRaw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
  writeFileSync(mipPath, mipPng)
  console.log(`wrote mip simulation ${mipPath}`)
}
