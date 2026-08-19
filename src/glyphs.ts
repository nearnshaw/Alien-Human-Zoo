// Alien glyph rendering — textured quads over a procedurally generated symbol atlas
// (assets/images/alien_glyphs.png, built by design/tools/gen_glyph_atlas.mjs).
//
// The deck still spells glyph phrases as strings ('◆▲■ ●◇ ▲▲?'); those characters are
// now just IDs. Each distinct character is assigned one atlas symbol, deterministically
// and collision-free, so the same alien "word" always shows the same symbols across
// cards — the deck's linguistic gags (repeated glyphs, the '?' suffix) stay visible
// even though no cell looks like an ASCII character.

import {
  engine,
  Entity,
  Transform,
  MeshRenderer,
  Material,
  MaterialTransparencyMode,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color3, Color4 } from '@dcl/sdk/math'
import { DECK } from './deck'

// exported: src/ui.tsx re-renders the same atlas cells as UI sprites on mobile,
// where the 3D alpha-tested glyph quads don't render (mobile client parity gap)
export const ATLAS_SRC = 'assets/images/alien_glyphs.png'
export const GRID = 8
const CELLS = GRID * GRID

// ---------- character -> atlas cell ----------
// Assignment order walks the deck top to bottom (fixed data, so stable across sessions)
// and strides by 21 (coprime with 64) so consecutive deck characters land on cells from
// different template families rather than filling the atlas row by row.
const charToCell = new Map<string, number>()
{
  let next = 0
  const feed = (s: string) => {
    for (const ch of s) {
      if (ch === ' ') continue
      if (!charToCell.has(ch)) charToCell.set(ch, (next++ * 21) % CELLS)
    }
  }
  for (const card of DECK) {
    feed(card.glyphs)
    for (const o of card.options) feed(o.glyph)
  }
}

export function cellOf(ch: string): number {
  const known = charToCell.get(ch)
  if (known !== undefined) return known
  // char not in the deck (future cards): stable hash fallback
  let h = 0
  for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) >>> 0
  return h % CELLS
}

// ---------- atlas UVs ----------
// Plane UV layout per the SDK: 4 corners x (u,v) for the north face, then the south
// face reversed. Half-cell padding is generous (6px of 128) to stop neighbour bleed
// from mipmapping at a distance.
const PAD = 6 / (GRID * 128)
function cellUVs(cell: number): number[] {
  const col = cell % GRID
  const row = Math.floor(cell / GRID)
  const cs = 1 / GRID
  const u0 = col * cs + PAD
  const u1 = (col + 1) * cs - PAD
  const v1 = 1 - row * cs - PAD // texture v grows upward; atlas rows count from the top
  const v0 = 1 - (row + 1) * cs + PAD
  return [
    u0, v0, u0, v1, u1, v1, u1, v0, // north face: LL, UL, UR, LR
    u1, v0, u1, v1, u0, v1, u0, v0 // south face mirrors it (harmless — symbols are abstract)
  ]
}

// ---------- glyph rows ----------
// A row is a fixed pool of quads under one root; setGlyphRowText re-lays-out and
// re-UVs the pool each time, keeping entity count constant (no create/delete churn).

export interface GlyphRow {
  root: Entity
  quads: Entity[]
  size: number
  advance: number // centre-to-centre distance between adjacent glyphs
  spaceGap: number // extra advance for a space character
}

export function createGlyphRow(opts: {
  position: Vector3
  size: number
  maxGlyphs: number
  color: Color3
  parent?: Entity
  rotation?: Quaternion
}): GlyphRow {
  const root = engine.addEntity()
  Transform.create(root, {
    position: opts.position,
    rotation: opts.rotation ?? Quaternion.Identity(),
    parent: opts.parent
  })
  const quads: Entity[] = []
  for (let i = 0; i < opts.maxGlyphs; i++) {
    const q = engine.addEntity()
    Transform.create(q, {
      parent: root,
      position: Vector3.Zero(),
      scale: Vector3.create(opts.size, opts.size, 1)
    })
    MeshRenderer.setPlane(q, cellUVs(0))
    Material.setPbrMaterial(q, {
      texture: Material.Texture.Common({ src: ATLAS_SRC }),
      emissiveTexture: Material.Texture.Common({ src: ATLAS_SRC }),
      // symbols are white in the atlas; all colour comes from these tints
      albedoColor: Color4.create(opts.color.r, opts.color.g, opts.color.b, 1),
      emissiveColor: opts.color,
      emissiveIntensity: 1.2,
      // alpha-test, not blend: these sit near the glass globe and other transparent
      // props, and cutout quads never fight them for sort order
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
      alphaTest: 0.35,
      metallic: 0,
      roughness: 1,
      specularIntensity: 0,
      castShadows: false
    })
    VisibilityComponent.create(q, { visible: false })
    quads.push(q)
  }
  return { root, quads, size: opts.size, advance: opts.size * 1.14, spaceGap: opts.size * 0.55 }
}

// Lay out `text` centred on the row root. Spaces become gaps; every other character
// becomes one symbol quad. Characters beyond the pool size are dropped.
export function setGlyphRowText(row: GlyphRow, text: string) {
  const slots: { cell: number; x: number }[] = []
  let x = 0
  for (const ch of text) {
    if (ch === ' ') {
      x += row.spaceGap
      continue
    }
    if (slots.length >= row.quads.length) break
    slots.push({ cell: cellOf(ch), x })
    x += row.advance
  }
  const width = slots.length > 0 ? slots[slots.length - 1].x : 0
  for (let i = 0; i < row.quads.length; i++) {
    const visible = i < slots.length
    VisibilityComponent.getMutable(row.quads[i]).visible = visible
    if (visible) {
      Transform.getMutable(row.quads[i]).position = Vector3.create(slots[i].x - width / 2, 0, 0)
      MeshRenderer.setPlane(row.quads[i], cellUVs(slots[i].cell))
    }
  }
}
