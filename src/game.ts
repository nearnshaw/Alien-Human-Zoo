// H1-02 greybox — full advice cycle with hybrid consequence staging.
// Everything is a primitive; the build is an instrument, not a deliverable.
// Experiment: design/01-find-the-fun/H1-02-staged-vs-text-punchline_active.md

import {
  engine,
  Entity,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  MaterialTransparencyMode,
  TextShape,
  TextAlignMode,
  Billboard,
  BillboardMode,
  VisibilityComponent,
  AvatarShape,
  GltfContainer,
  LightSource,
  pointerEventsSystem,
  PointerEvents,
  InputAction,
  ColliderLayer
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4, Color3 } from '@dcl/sdk/math'
import { DECK, DECK_SIZE, DeckOption, MeterKey, DEATH_LINES } from './deck'

// ---------- environment anchors ----------
// Measured off the Blender build (design/blender/alien_human_zoo_env.blend).
//
// Blender -> Decentraland is a two-step flip, and getting it wrong puts the whole model off
// the parcel. The glTF exporter maps Blender Z-up to Y-up as (x, y, z) -> (x, z, -y), and the
// explorer's loader then negates X to go from right-handed glTF to left-handed DCL. Net:
//
//     dcl = (-x_blender, z_blender, -y_blender)
//
// So the model is authored occupying Blender x -32..0 and y -32..0, which lands it on
// x/z 0..32 here at an identity Transform. (Cross-checked against Genesis Plaza, whose
// environment GLBs sit at positive X / negative Z and are placed with a 180 deg Y rotation —
// that only lands inside its parcels if the loader negates X.)
const ENV_MODEL = 'assets/scene/models/alien_zoo_interior.glb'

// The main set pieces are split out of the environment GLB so they can be moved
// independently. They are declared in assets/scene/main.composite (entities named
// "Console", "Translator Booth", "Spawn Pad", "Glyph Panel"), so their live Transform is
// whatever the Creator Hub editor last saved — reposition them there, not here.
const CONSOLE_MODEL = 'assets/scene/models/alien_console.glb' // arc, buttons, pylons + floor feed cables
const TRANSLATOR_BOOTH_MODEL = 'assets/scene/models/alien_translator_booth.glb' // podium, ring + cable
const SPAWN_PAD_MODEL = 'assets/scene/models/alien_spawn_pad.glb' // dais + ring at the arrival point
const GLYPH_PANEL_MODEL = 'assets/scene/models/alien_glyph_panel.glb' // the canted alien-glyph display

// Each piece was exported with its origin at the bottom-center of its bounding box, and
// these are the positions that reproduce the original combined-model layout. They serve
// two jobs: the fallback spot if a piece is missing from the composite, and — critically —
// the anchor that turns this file's tuned absolute coordinates into piece-relative offsets
// for the parented overlays. They must stay at the ORIGINAL export values even after a
// piece is moved in the editor; the live position comes from the composite.
const CONSOLE_POS = Vector3.create(16, 0, 12.7982) // z centre pulled bowl-ward by the feed cables in the bbox
const TRANSLATOR_BOOTH_POS = Vector3.create(21.2941, 0, 14.9951) // centre includes the podium cable run
const SPAWN_PAD_POS = Vector3.create(16, -0.03, 7.6) // the ring dips 3 cm into the floor
const GLYPH_PANEL_POS = Vector3.create(16, 4.3138, 14.85)

const BOWL_CENTER = Vector3.create(16, 3.9, 19) // glass globe centre, inner radius ~3.35
const PLATFORM_Y = 1.54 // top of the specimen platform inside the bowl
// A TextShape at identity rotation reads from the -Z side, i.e. from the console looking
// toward the bowl. Panel-mounted text therefore carries the same yaw as the panel it sits on.
const FACE_PLAYER = Quaternion.Identity()

// Global multiplier on every TextShape font size: desktop reads fine at 1.0, but on mobile
// screens the text is illegibly small. The backing surfaces (speech bubble, speech slab,
// plaque, glyph panel) are NOT tied to this knob — they were sized generously and the text
// grows into their slack; text mounted on modelled GLB surfaces (button plates, console
// face) just grows over them.
const TEXT_SCALE = 2.0

// the three domed buttons modelled on the console arc, and their caption plates
// index 0 is the amber dome, 1 teal, 2 red — left to right as the player faces the bowl
const BUTTON_POS: Vector3[] = [
  Vector3.create(14.271, 1.165, 9.746),
  Vector3.create(16.0, 1.165, 10.145),
  Vector3.create(17.729, 1.165, 9.746)
]
// These are NOT billboarded. The plates follow the console arc's yaw (+/-26 deg) but are no
// longer tilted back — the 30 deg tilt was what made a flat text plane swim across the plate
// and clip into it as the player moved. Each caption carries its plate's yaw and sits 0.06 m
// out along that plate's own face normal, so it stays flush from every angle.
const CAPTION_POS: Vector3[] = [
  Vector3.create(14.023, 1.57, 10.254),
  Vector3.create(16.0, 1.57, 10.71),
  Vector3.create(17.977, 1.57, 10.254)
]
const CAPTION_YAW = [-26, 0, 26]

// The four meter panels on the posts flanking the bowl. Each panel's fill bar is modelled in
// its own colour, so the labels have to match the hardware: WATER/AIR sit on the west post,
// TEMP/MOOD on the east one. The posts are canted 32 deg toward the console, so the readouts
// stand 0.35 m clear along each panel's face normal — enough that a billboarded label never
// swings back into the casing.
const METER_PANELS: { key: MeterKey; label: string; pos: Vector3 }[] = [
  { key: 'water', label: 'WATER', pos: Vector3.create(10.584, 3.187, 15.565) },
  { key: 'air', label: 'AIR', pos: Vector3.create(10.584, 4.737, 15.565) },
  { key: 'temp', label: 'TEMP', pos: Vector3.create(21.416, 3.187, 15.565) },
  { key: 'mood', label: 'MOOD', pos: Vector3.create(21.416, 4.737, 15.565) }
]

// ---------- tiny timer helper ----------
const timers: { t: number; cb: () => void }[] = []
function delay(seconds: number, cb: () => void) {
  timers.push({ t: seconds, cb })
}
engine.addSystem((dt) => {
  for (let i = timers.length - 1; i >= 0; i--) {
    timers[i].t -= dt
    if (timers[i].t <= 0) {
      const cb = timers[i].cb
      timers.splice(i, 1)
      cb()
    }
  }
})

// ---------- text helpers ----------
function wrap(text: string, width = 38): string {
  const out: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(' ')) {
      if (line.length + word.length + 1 > width && line.length > 0) {
        out.push(line)
        line = word
      } else {
        line = line.length ? line + ' ' + word : word
      }
    }
    out.push(line)
  }
  return out.join('\n')
}

function makeText(
  position: Vector3,
  fontSize: number,
  color: Color4,
  text = '',
  billboard = true,
  rotation: Quaternion = FACE_PLAYER,
  parent?: Entity
): Entity {
  const e = engine.addEntity()
  // When parented to a set piece, `position` must already be piece-relative: the call site
  // subtracts the piece's ORIGINAL anchor (CONSOLE_POS etc.), never the parent's live
  // transform — the piece may have been moved in the Creator Hub since these absolute
  // numbers were tuned, and the offsets must move with it.
  Transform.create(e, { position, rotation, parent })
  TextShape.create(e, {
    text,
    fontSize: fontSize * TEXT_SCALE,
    textColor: color,
    outlineColor: Color3.Black(),
    // heavy outline: most of this text floats over glowing panels and lit glass
    outlineWidth: 0.4,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })
  if (billboard) Billboard.create(e, { billboardMode: BillboardMode.BM_Y })
  return e
}

function setHoverText(entity: Entity, hoverText: string) {
  const pe = PointerEvents.getMutableOrNull(entity)
  if (!pe) return
  for (const entry of pe.pointerEvents) {
    if (entry.eventInfo) entry.eventInfo.hoverText = hoverText
  }
}

// ---------- avatar emote helper ----------
const emoteTs = new Map<Entity, number>()
function playEmote(e: Entity, id: string) {
  const av = AvatarShape.getMutable(e)
  av.expressionTriggerId = id
  const t = (emoteTs.get(e) ?? 0) + 1
  av.expressionTriggerTimestamp = t
  emoteTs.set(e, t)
}

// ---------- game state ----------
type Meters = Record<MeterKey, number>
let meters: Meters = { water: 5, air: 5, temp: 5, mood: 5 }
// 3 rounds per day; the deck reshuffles when exhausted and the run is endless until death
const ROUNDS_PER_DAY = 3

// ---------- beat timing ----------
// A round resolves in two beats so the punchline lands in order rather than all at once:
// the aliens' action appears alone first, then the human reacts to it.
const REACTION_BEAT = 1.0 // s — alien action on screen alone before the human's line appears
const ROUND_HOLD = 7.5 // s — total before the next question replaces everything
let round = 1
let order: number[] = []
let state: 'question' | 'resolving' | 'gameover' = 'question'

function dayOf(r: number): number {
  return Math.floor((r - 1) / ROUNDS_PER_DAY) + 1
}

function shuffle(): number[] {
  const a = DECK.map((_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- entities (created once in setupGame) ----------
const meterTexts = new Map<MeterKey, Entity>()
let dayText: Entity
let glyphText: Entity
let translatorText: Entity
let bubbleRoot: Entity
let implementationText: Entity
let speechText: Entity
let speechBacking: Entity
let humanAvatar: Entity
let translatorAvatar: Entity
let plaqueBox: Entity
let plaqueText: Entity
const buttons: Entity[] = []
const buttonCaptions: Entity[] = []

// staged consequence groups
let vaporRoot: Entity
let turbineRoot: Entity
let snowRoot: Entity
let predatorRoot: Entity
let turbineActive = false

export function setupGame() {
  // ---------- the alien facility itself (one GLB, colliders baked in) ----------
  const environment = engine.addEntity()
  Transform.create(environment, { position: Vector3.Zero() })
  GltfContainer.create(environment, {
    src: ENV_MODEL,
    // Every walkable/blocking surface is a "*_collider" mesh inside the model. These stay on
    // CL_PHYSICS alone deliberately: the console colliders enclose the button volumes, so
    // giving the whole model CL_POINTER too would make pointer rays hit the desk shell
    // instead of the domes. The walls are handled separately below.
    visibleMeshesCollisionMask: ColliderLayer.CL_NONE,
    invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
  })

  // ---------- the movable set pieces, split out of the environment GLB ----------
  // Declared in main.composite so the Creator Hub can reposition them; looked up here by
  // name. If one is missing from the composite (deleted in the editor, or the composite
  // hasn't been regenerated yet) it is recreated in code at its original spot so the scene
  // never loses a piece. Collider policy matches the environment: physics only, so pointer
  // rays reach the invisible button volumes rather than the pieces' own collider shells.
  // Entities that overlay a piece (click volumes, captions, texts, the translator) are
  // parented to it, so moving a piece carries its overlays along.
  function pieceEntity(name: string, src: string, position: Vector3): Entity {
    const fromComposite = engine.getEntityOrNullByName(name)
    if (fromComposite) return fromComposite
    console.log(`[env] "${name}" missing from main.composite — creating it in code`)
    const e = engine.addEntity()
    Transform.create(e, { position })
    GltfContainer.create(e, {
      src,
      visibleMeshesCollisionMask: ColliderLayer.CL_NONE,
      invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
    return e
  }
  const consoleRoot = pieceEntity('Console', CONSOLE_MODEL, CONSOLE_POS)
  const boothRoot = pieceEntity('Translator Booth', TRANSLATOR_BOOTH_MODEL, TRANSLATOR_BOOTH_POS)
  pieceEntity('Spawn Pad', SPAWN_PAD_MODEL, SPAWN_PAD_POS)
  const glyphPanelRoot = pieceEntity('Glyph Panel', GLYPH_PANEL_MODEL, GLYPH_PANEL_POS)

  setupWalls()
  setupLighting()

  // The alien half of the exchange lives on the canted panel, whose glass is a dark surface
  // in the model so light text actually reads against it. Heights are chosen by viewing
  // angle from the console (eye 1.78 at z 8.2), because DCL's ~60 deg vertical FOV puts
  // anything past ~30 deg off screen when the player is looking level:
  //   The panel tilts BACK, so a line lower on it needs a LOWER z to stay in front of the
//   glass: the implementation line at z 14.6 sat 0.135 m behind the panel face and was
//   invisible. Each line now clears its own local face depth by ~0.27 m.
//   3rd person: glyph 14.0 deg — and the panel's lower edge sits at 6.1 deg, clear of
//   the caged human's head at 2.8 deg, which it used to cover.
  // The day counter moved off the panel entirely and onto the player's own console at
  // 13.4 deg, which is where a score readout belongs anyway.
  // There is deliberately no text on the back wall screen: from the console the glass globe
  // covers its centre, and no height on that wall clears the bowl's silhouette.
  dayText = makeText(
    Vector3.subtract(Vector3.create(16, 2.35, 10.6), CONSOLE_POS),
    0.9, Color4.create(1, 0.85, 0.4, 1), '', false, FACE_PLAYER, consoleRoot
  )
  // The panel model was re-exported at 70% size (it had far more area than the text used):
  // it now spans y 4.31..5.83, z 14.41..15.29 at the original anchor. Both lines sit
  // ~0.45 m in front of the canted face at their heights.
  glyphText = makeText(
    Vector3.subtract(Vector3.create(16, 5.35, 14.6), GLYPH_PANEL_POS),
    1.9, Color4.create(0.85, 0.75, 1, 1), '', false, FACE_PLAYER, glyphPanelRoot
  )
  implementationText = makeText(
    Vector3.subtract(Vector3.create(16, 4.65, 14.2), GLYPH_PANEL_POS),
    1.45, Color4.create(0.7, 1, 0.78, 1), '', false, FACE_PLAYER, glyphPanelRoot
  )

  // ---------- the translator's speech bubble ----------
  // Her reading is the human half of the exchange, so it comes out of her rather than off a
  // screen. Billboarded: it floats in open air with nothing to clip into. Her podium sits at
  // (20.8, 12.8) — between console and bowl, off to the right — which is the one spot that
  // is both 46 deg off the player's forward view (so it reads without turning away from the
  // tank) and clear of the right console pylon, which cut straight through earlier placements.
  // The panel is deliberately SMALLER than the original 6.2 x 3.2 m — that one had several
  // times more area than the text ever used. Root height keeps the panel's bottom edge at
  // ~2.6 m, which is what clears the right console pylon's cap.
  bubbleRoot = engine.addEntity()
  Transform.create(bubbleRoot, {
    parent: boothRoot,
    position: Vector3.subtract(Vector3.create(20.8, 3.9, 12.8), TRANSLATOR_BOOTH_POS)
  })
  Billboard.create(bubbleRoot, { billboardMode: BillboardMode.BM_Y })
  VisibilityComponent.create(bubbleRoot, { visible: false, propagateToChildren: true })

  const bubbleBack = engine.addEntity()
  Transform.create(bubbleBack, { parent: bubbleRoot, position: Vector3.create(0, 0, 0.07), scale: Vector3.create(5.0, 2.6, 0.1) })
  MeshRenderer.setBox(bubbleBack)
  Material.setPbrMaterial(bubbleBack, {
    albedoColor: Color4.create(0.03, 0.03, 0.05, 0.9),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    emissiveColor: Color3.create(0.06, 0.06, 0.12),
    emissiveIntensity: 0.6,
    roughness: 0.9
  })
  const bubbleRim = engine.addEntity()
  Transform.create(bubbleRim, { parent: bubbleRoot, position: Vector3.create(0, 0, 0.13), scale: Vector3.create(5.16, 2.76, 0.06) })
  MeshRenderer.setBox(bubbleRim)
  Material.setPbrMaterial(bubbleRim, {
    albedoColor: Color4.create(0.35, 0.85, 0.95, 1),
    emissiveColor: Color3.create(0.25, 0.75, 0.9),
    emissiveIntensity: 1.4
  })
  // tail: a cone tapering down toward her head
  const bubbleTail = engine.addEntity()
  Transform.create(bubbleTail, { parent: bubbleRoot, position: Vector3.create(0, -1.55, 0.07), scale: Vector3.create(0.85, 1.0, 0.25) })
  MeshRenderer.setCylinder(bubbleTail, 0.4, 0.0)
  Material.setPbrMaterial(bubbleTail, {
    albedoColor: Color4.create(0.03, 0.03, 0.05, 0.9),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 0.9
  })

  translatorText = engine.addEntity()
  Transform.create(translatorText, { parent: bubbleRoot, position: Vector3.Zero() })
  TextShape.create(translatorText, {
    text: '',
    // 1.4, not 1.5: at TEXT_SCALE 2.0 the 32-char lines spilled past the panel edge by a
    // couple of characters. Shrinking the font ~7% instead of narrowing the wrap keeps the
    // line count (and so the text block height) unchanged.
    fontSize: 1.4 * TEXT_SCALE,
    textColor: Color4.White(),
    outlineColor: Color3.Black(),
    outlineWidth: 0.4,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })

  // ---------- meter readouts, one per physical panel on the flanking posts ----------
  // billboarded: the posts are canted 32 deg toward the console, and the player circles the
  // bowl, so letting these turn is more legible than pinning them flat to the panel.
  for (const panel of METER_PANELS) {
    meterTexts.set(panel.key, makeText(panel.pos, 1.25, Color4.White(), '', true))
  }

  // the human — a naked base avatar on the platform inside the fishbowl, facing the console
  humanAvatar = engine.addEntity()
  Transform.create(humanAvatar, {
    position: Vector3.create(16.2, PLATFORM_Y, 19.2),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(humanAvatar, {
    id: 'human-c4e1',
    name: '',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
    // face features only — no clothing wearables: the specimen arrived as-is
    wearables: [
      'urn:decentraland:off-chain:base-avatars:eyebrows_00',
      'urn:decentraland:off-chain:base-avatars:mouth_00',
      'urn:decentraland:off-chain:base-avatars:eyes_00',
      'urn:decentraland:off-chain:base-avatars:short_hair'
    ],
    hairColor: { r: 0.3, g: 0.2, b: 0.1 },
    skinColor: { r: 0.85, g: 0.65, b: 0.5 },
    emotes: []
  })

  // The human's line floats just outside the front of the glass. Deliberately not
  // billboarded — a wide billboard this close to the globe swings into it when the player
  // steps sideways, and the line is meant to be read from the console anyway. It gets its
  // own dark backing slab, because otherwise it sits against lit glass and disappears.
  speechBacking = engine.addEntity()
  // scaled with TEXT_SCALE; at 2.1 tall its top edge (4.1) still clears the glyph panel's
  // lower edge (y 4.31 on the exported model)
  Transform.create(speechBacking, { position: Vector3.create(16, 3.05, 15.12), scale: Vector3.create(9.3, 2.1, 0.06) })
  MeshRenderer.setBox(speechBacking)
  Material.setPbrMaterial(speechBacking, {
    albedoColor: Color4.create(0.02, 0.02, 0.04, 0.88),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 0.9
  })
  // hidden whenever he has nothing to say, so an empty slab never sits in front of the cage
  VisibilityComponent.create(speechBacking, { visible: false })
  // Sits BELOW the glyph panel, not beside it: at y 4.5 this line was inside the raised
  // panel's volume (y 3.9..6.0, z 14.4..15.3) and completely buried. At y 3.05 it reads at
  // 10.6 deg first-person / 2.3 deg third-person, clear of the panel's 18.8 / 6.8 deg lower
  // edge and level with the caged human's head, so it still reads as his line.
  speechText = makeText(Vector3.create(16, 3.05, 15.0), 1.7, Color4.create(1, 1, 0.8, 1), '', false)

  // the translator — on her podium beside the console, turned toward the player
  translatorAvatar = engine.addEntity()
  Transform.create(translatorAvatar, {
    parent: boothRoot,
    position: Vector3.subtract(Vector3.create(20.8, 0.6, 12.8), TRANSLATOR_BOOTH_POS),
    rotation: Quaternion.fromEulerDegrees(0, 226, 0)
  })
  AvatarShape.create(translatorAvatar, {
    id: 'translator-0001',
    name: 'Translator',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseFemale',
    wearables: [
      'urn:decentraland:off-chain:base-avatars:f_eyebrows_00',
      'urn:decentraland:off-chain:base-avatars:f_mouth_00',
      'urn:decentraland:off-chain:base-avatars:f_eyes_00',
      'urn:decentraland:off-chain:base-avatars:standard_hair',
      'urn:decentraland:off-chain:base-avatars:f_simple_yellow_tshirt',
      'urn:decentraland:off-chain:base-avatars:f_brown_trousers',
      'urn:decentraland:off-chain:base-avatars:bun_shoes'
    ],
    hairColor: { r: 0.2, g: 0.15, b: 0.1 },
    skinColor: { r: 0.7, g: 0.55, b: 0.45 },
    emotes: []
  })

  // ---------- the three buttons ----------
  // The domes, bezels and halos are modelled in the GLB. These entities are invisible
  // pointer volumes sitting exactly on top of them, so the click target matches the art.
  for (let i = 0; i < 3; i++) {
    const b = engine.addEntity()
    // parented to the console model so the click volumes track the art if the console moves
    Transform.create(b, {
      parent: consoleRoot,
      position: Vector3.subtract(BUTTON_POS[i], CONSOLE_POS),
      scale: Vector3.create(0.92, 0.55, 0.92)
    })
    MeshCollider.setBox(b, ColliderLayer.CL_POINTER) // no MeshRenderer -> invisible but clickable
    const idx = i
    // registered exactly once — never re-register from inside a callback
    pointerEventsSystem.onPointerDown(
      { entity: b, opts: { button: InputAction.IA_POINTER, hoverText: 'press', maxDistance: 14 } },
      () => onButtonPressed(idx)
    )
    buttons.push(b)
    // caption sits on the modelled plate behind each dome
    buttonCaptions.push(
      makeText(
        Vector3.subtract(CAPTION_POS[i], CONSOLE_POS),
        0.9, Color4.White(), '', false, Quaternion.fromEulerDegrees(0, CAPTION_YAW[i], 0), consoleRoot
      )
    )
  }

  // end-of-run plaque (hidden until death); clicking it restarts
  plaqueBox = engine.addEntity()
  Transform.create(plaqueBox, { position: Vector3.create(16, 3.6, 13.4), scale: Vector3.create(8.1, 3.9, 0.1) })
  MeshRenderer.setBox(plaqueBox)
  Material.setPbrMaterial(plaqueBox, {
    albedoColor: Color4.create(0.08, 0.07, 0.1, 0.92),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    emissiveColor: Color3.create(0.25, 0.05, 0.05),
    emissiveIntensity: 0.5
  })
  VisibilityComponent.create(plaqueBox, { visible: false })
  plaqueText = makeText(Vector3.create(16, 3.6, 13.28), 1.5, Color4.create(1, 0.9, 0.6, 1), '', false)
  VisibilityComponent.create(plaqueText, { visible: false })
  pointerEventsSystem.onPointerDown(
    { entity: plaqueBox, opts: { button: InputAction.IA_POINTER, hoverText: 'RESTART', maxDistance: 14 } },
    () => {
      if (state === 'gameover') restart()
    }
  )

  // ---------- staged consequences (pre-built, hidden), all inside the glass ----------
  // hot vapor: translucent volume filling the globe
  vaporRoot = engine.addEntity()
  Transform.create(vaporRoot, {
    position: Vector3.create(16, 3.6, 19),
    scale: Vector3.create(6.2, 6.2, 6.2)
  })
  MeshRenderer.setSphere(vaporRoot)
  Material.setPbrMaterial(vaporRoot, {
    albedoColor: Color4.create(1, 1, 1, 0.45),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 1
  })
  VisibilityComponent.create(vaporRoot, { visible: false })

  // Turbine: two crossed blades, spun by a system. Hangs at head height rather than up in
  // the dome — at y 5.8 it sat directly behind the lowered glyph panel and was invisible.
  turbineRoot = engine.addEntity()
  Transform.create(turbineRoot, { position: Vector3.create(16, 3.9, 19) })
  VisibilityComponent.create(turbineRoot, { visible: false, propagateToChildren: true })
  const bladeA = engine.addEntity()
  Transform.create(bladeA, { parent: turbineRoot, position: Vector3.Zero(), scale: Vector3.create(2.4, 0.08, 0.3) })
  MeshRenderer.setBox(bladeA)
  Material.setPbrMaterial(bladeA, { albedoColor: Color4.create(0.7, 0.7, 0.75, 1), metallic: 0.8, roughness: 0.3 })
  const bladeB = engine.addEntity()
  Transform.create(bladeB, { parent: turbineRoot, position: Vector3.Zero(), scale: Vector3.create(0.3, 0.08, 2.4) })
  MeshRenderer.setBox(bladeB)
  Material.setPbrMaterial(bladeB, { albedoColor: Color4.create(0.7, 0.7, 0.75, 1), metallic: 0.8, roughness: 0.3 })
  engine.addSystem((dt) => {
    if (!turbineActive) return
    const t = Transform.getMutable(turbineRoot)
    t.rotation = Quaternion.multiply(t.rotation, Quaternion.fromEulerDegrees(0, dt * 720, 0))
  })

  // snow: scattered ice cubes on the specimen platform
  snowRoot = engine.addEntity()
  Transform.create(snowRoot, { position: Vector3.create(16, PLATFORM_Y, 19) })
  VisibilityComponent.create(snowRoot, { visible: false, propagateToChildren: true })
  const snowSpots: [number, number, number][] = [
    [-1.5, 0.15, -1.1], [1.0, 0.15, -1.6], [1.6, 0.15, 0.9], [-0.8, 0.15, 1.5],
    [0.25, 0.15, 0.4], [-1.8, 0.15, 0.5], [1.1, 0.15, 1.7], [-0.25, 0.15, -1.8]
  ]
  for (const [x, y, z] of snowSpots) {
    const cube = engine.addEntity()
    Transform.create(cube, { parent: snowRoot, position: Vector3.create(x, y, z), scale: Vector3.create(0.3, 0.3, 0.3) })
    MeshRenderer.setBox(cube)
    Material.setPbrMaterial(cube, { albedoColor: Color4.create(0.85, 0.95, 1, 0.9), transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND, roughness: 0.1, metallic: 0.1 })
  }

  // predator: a large glossy red box that appears next to the human
  predatorRoot = engine.addEntity()
  Transform.create(predatorRoot, {
    position: Vector3.create(14.5, PLATFORM_Y + 0.7, 19.4),
    scale: Vector3.create(1.3, 1.4, 1.6)
  })
  MeshRenderer.setBox(predatorRoot)
  Material.setPbrMaterial(predatorRoot, {
    albedoColor: Color4.create(0.75, 0.1, 0.1, 1),
    emissiveColor: Color3.create(0.4, 0.02, 0.02),
    emissiveIntensity: 0.7,
    roughness: 0.2
  })
  VisibilityComponent.create(predatorRoot, { visible: false })

  // first card
  order = shuffle()
  render()
}

// ---------- walls ----------
// The third-person camera only treats geometry as solid when its collider carries BOTH
// CL_PHYSICS and CL_POINTER; with CL_PHYSICS alone the camera slides straight through, which
// is what let it end up outside the room. These four invisible slabs replace the wall
// colliders that used to live in the GLB, so the walls can carry both layers without
// dragging the console's colliders (which enclose the clickable domes) along with them.
const WALLS: { pos: Vector3; scale: Vector3 }[] = [
  { pos: Vector3.create(0.55, 4, 16), scale: Vector3.create(1.1, 8, 32) }, // west
  { pos: Vector3.create(31.45, 4, 16), scale: Vector3.create(1.1, 8, 32) }, // east
  { pos: Vector3.create(16, 4, 0.55), scale: Vector3.create(32, 8, 1.1) }, // south (behind spawn)
  { pos: Vector3.create(16, 4, 31.45), scale: Vector3.create(32, 8, 1.1) } // north (screen wall)
]

function setupWalls() {
  for (const w of WALLS) {
    const e = engine.addEntity()
    Transform.create(e, { position: w.pos, scale: w.scale })
    // no MeshRenderer -> invisible; both layers -> blocks the player AND the camera
    MeshCollider.setBox(e, ColliderLayer.CL_PHYSICS | ColliderLayer.CL_POINTER)
  }
}

// ---------- lighting ----------
// The GLB carries no lights — glTF punctual lights are not imported by Decentraland, so the
// Blender rig stays in the .blend for previews only and the room is lit by LightSource
// entities here. They are deliberately spread out: the renderer only draws the handful
// closest to the player (roughly 4–10 depending on quality settings).
interface Lamp {
  name: string
  pos: Vector3
  color: Color3
  intensity: number
  range: number
}

const LAMPS: Lamp[] = [
  // the fishbowl is the only bright object in the room — two lights carry it
  { name: 'bowl-uplight', pos: Vector3.create(16, 2.2, 19), color: Color3.create(0.35, 0.92, 1.0), intensity: 13000, range: 13 },
  { name: 'bowl-key', pos: Vector3.create(16, 7.8, 19), color: Color3.create(0.72, 0.9, 1.0), intensity: 10000, range: 15 },
  // warm pool over the console so the three buttons read from the spawn point
  { name: 'console', pos: Vector3.create(16, 2.8, 9.4), color: Color3.create(1.0, 0.78, 0.45), intensity: 7000, range: 11 },
  // screen spill
  { name: 'display', pos: Vector3.create(16, 6.6, 16.6), color: Color3.create(0.62, 0.42, 1.0), intensity: 6000, range: 12 },
  { name: 'backwall', pos: Vector3.create(16, 7.2, 29.0), color: Color3.create(0.55, 0.38, 1.0), intensity: 15000, range: 20 },
  // Giger rim light on the ribs, cool one side and hot the other
  { name: 'rim-west', pos: Vector3.create(3.8, 4.2, 16.0), color: Color3.create(0.85, 0.25, 0.8), intensity: 8000, range: 16 },
  { name: 'rim-east', pos: Vector3.create(28.2, 4.2, 16.0), color: Color3.create(0.3, 0.55, 1.0), intensity: 8000, range: 16 },
  // arrival and the translator's podium
  { name: 'spawn', pos: Vector3.create(16, 3.0, 4.2), color: Color3.create(0.3, 0.7, 0.85), intensity: 5000, range: 12 },
  { name: 'podium', pos: Vector3.create(20.8, 2.4, 12.8), color: Color3.create(0.9, 0.35, 0.8), intensity: 3200, range: 7 }
]

function setupLighting() {
  for (const lamp of LAMPS) {
    const e = engine.addEntity()
    Transform.create(e, { position: lamp.pos })
    LightSource.create(e, {
      type: LightSource.Type.Point({}),
      color: lamp.color,
      intensity: lamp.intensity,
      range: lamp.range
    })
  }
}

// ---------- rendering helpers ----------
function currentCard() {
  return DECK[order[(round - 1) % DECK_SIZE]]
}

// The human's line and its backing slab are one unit — the slab is only there to make the
// text legible against lit glass, so it must never outlive the text and hang in front of
// the cage on its own.
function setSpeech(text: string) {
  TextShape.getMutable(speechText).text = text
  setVisible(speechBacking, text.length > 0)
}

function setVisible(e: Entity, v: boolean) {
  VisibilityComponent.getMutable(e).visible = v
}

function hideStaged() {
  turbineActive = false
  setVisible(vaporRoot, false)
  setVisible(turbineRoot, false)
  setVisible(snowRoot, false)
  setVisible(predatorRoot, false)
}

function showStaged(kind: DeckOption['staged']) {
  if (!kind) return
  if (kind === 'vapor') setVisible(vaporRoot, true)
  if (kind === 'snow') setVisible(snowRoot, true)
  if (kind === 'predator') setVisible(predatorRoot, true)
  if (kind === 'turbine') {
    setVisible(turbineRoot, true)
    turbineActive = true
  }
}

function updateMetersDisplay(blank = false) {
  for (const panel of METER_PANELS) {
    const t = TextShape.getMutable(meterTexts.get(panel.key)!)
    if (blank) {
      t.text = ''
      continue
    }
    const v = meters[panel.key]
    t.text = `${panel.label} ${v}${v <= 3 ? ' !' : ''}`
    t.textColor = v <= 2 ? Color4.create(1, 0.35, 0.3, 1) : v <= 3 ? Color4.create(1, 0.75, 0.35, 1) : Color4.White()
  }
}

function render() {
  const card = currentCard()
  const r = ((round - 1) % ROUNDS_PER_DAY) + 1
  TextShape.getMutable(dayText).text = `DAY ${dayOf(round)}  ·  ${r}/${ROUNDS_PER_DAY}`
  TextShape.getMutable(glyphText).text = card.glyphs
  TextShape.getMutable(translatorText).text = wrap(card.translation, 32)
  setVisible(bubbleRoot, true)
  TextShape.getMutable(implementationText).text = ''
  setSpeech('')
  updateMetersDisplay()
  for (let i = 0; i < 3; i++) {
    const opt = card.options[i]
    TextShape.getMutable(buttonCaptions[i]).text = wrap(`${opt.glyph}\n${opt.caption}`, 12)
    setHoverText(buttons[i], opt.caption)
  }
  // the translator relays each new question with her trademark confidence
  playEmote(translatorAvatar, 'shrug')
}

// ---------- turn resolution ----------
function onButtonPressed(i: number) {
  if (state !== 'question') return
  const card = currentCard()
  const opt = card.options[i]
  state = 'resolving'

  for (let k = 0; k < 3; k++) TextShape.getMutable(buttonCaptions[k]).text = ''
  TextShape.getMutable(translatorText).text = ''
  setVisible(bubbleRoot, false)
  // wrapped narrower than the old 44: at TEXT_SCALE a 44-char line overhangs the panel
  TextShape.getMutable(implementationText).text = wrap(`THE ALIENS ${opt.implementation}`, 34)
  showStaged(opt.staged)

  delay(REACTION_BEAT, () => {
    let net = 0
    if (!opt.instantDeath) {
      for (const key of Object.keys(opt.effects) as MeterKey[]) {
        const v = opt.effects[key] ?? 0
        net += v
        meters[key] = Math.max(0, Math.min(10, meters[key] + v))
      }
    }
    updateMetersDisplay()
    setSpeech(wrap(`"${opt.reaction}"`, 30))
    // the human reacts in body language too
    if (opt.instantDeath || net < 0) playEmote(humanAvatar, 'getHit')
    else if (net > 0) playEmote(humanAvatar, 'handsair')
    else playEmote(humanAvatar, 'shrug')
    console.log(
      `[H1-02] day=${dayOf(round)} round=${round} pick="${opt.caption}" ` +
        `meters=W${meters.water}/A${meters.air}/T${meters.temp}/M${meters.mood}` +
        (opt.instantDeath ? ' INSTANT DEATH' : '')
    )
  })

  delay(ROUND_HOLD, () => {
    if (opt.instantDeath) return gameOver(opt.instantDeath, true)
    const dead = (Object.keys(meters) as MeterKey[]).find((k) => meters[k] <= 0)
    if (dead) return gameOver(DEATH_LINES[dead], false)
    round++
    if ((round - 1) % DECK_SIZE === 0) order = shuffle() // deck exhausted — endless run, fresh order
    hideStaged()
    state = 'question'
    render()
  })
}

function gameOver(line: string, instant: boolean) {
  state = 'gameover'
  playEmote(humanAvatar, instant ? 'headexplode' : 'knockOut')
  playEmote(translatorAvatar, 'dontsee')
  setSpeech('')
  TextShape.getMutable(translatorText).text = ''
  setVisible(bubbleRoot, false)
  updateMetersDisplay(true)
  TextShape.getMutable(plaqueText).text = wrap(line, 34) + `\n\nDAYS SURVIVED: ${dayOf(round)}\n\n[ CLICK TO RESTART ]`
  MeshCollider.setBox(plaqueBox)
  setVisible(plaqueBox, true)
  setVisible(plaqueText, true)
  console.log(`[H1-02] GAME OVER day=${dayOf(round)} round=${round} — ${line}`)
}

function restart() {
  meters = { water: 5, air: 5, temp: 5, mood: 5 }
  round = 1
  order = shuffle()
  hideStaged()
  playEmote(humanAvatar, 'wave') // a new specimen is wheeled in, remarkably similar to the last
  MeshCollider.deleteFrom(plaqueBox)
  setVisible(plaqueBox, false)
  setVisible(plaqueText, false)
  state = 'question'
  render()
  console.log('[H1-02] RESTART')
}
