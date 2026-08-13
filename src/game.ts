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

const BOWL_CENTER = Vector3.create(16, 3.9, 19) // glass globe centre, inner radius ~3.35
const PLATFORM_Y = 1.54 // top of the specimen platform inside the bowl
// A TextShape at identity rotation reads from the -Z side, i.e. from the console looking
// toward the bowl. Panel-mounted text therefore carries the same yaw as the panel it sits on.
const FACE_PLAYER = Quaternion.Identity()

// the three domed buttons modelled on the console arc, and their caption plates
// index 0 is the amber dome, 1 teal, 2 red — left to right as the player faces the bowl
const BUTTON_POS: Vector3[] = [
  Vector3.create(14.271, 1.165, 9.746),
  Vector3.create(16.0, 1.165, 10.145),
  Vector3.create(17.729, 1.165, 9.746)
]
// These are NOT billboarded. The plates used to be tilted 30 deg and yawed to follow the
// console arc, so a flat text plane only lined up head-on and swam across / clipped into the
// plate as the player moved. The plates are now squared to face straight down -Z in the
// model, so identity-rotated text sits flush on them from every angle. 0.06 m proud of a
// 0.05 m thick plate.
const CAPTION_POS: Vector3[] = [
  Vector3.create(13.997, 1.57, 10.247),
  Vector3.create(16.0, 1.57, 10.71),
  Vector3.create(18.003, 1.57, 10.247)
]

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
  rotation: Quaternion = FACE_PLAYER
): Entity {
  const e = engine.addEntity()
  Transform.create(e, { position, rotation })
  TextShape.create(e, {
    text,
    fontSize,
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
    // every walkable/blocking surface is a "*_collider" mesh inside the model
    visibleMeshesCollisionMask: ColliderLayer.CL_NONE,
    invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
  })

  setupLighting()

  // The alien half of the exchange lives on the canted panel above the bowl, whose glass is
  // now a dark surface in the model so light text actually reads against it. Each line sits
  // in front of the panel in z, clear of the gantry pipe that crosses at z 15.5.
  // There is deliberately no text on the back wall screen: from the console the glass globe
  // covers its centre, and no height on that wall clears the bowl's silhouette.
  dayText = makeText(Vector3.create(16, 8.7, 15.15), 1.9, Color4.create(1, 0.85, 0.4, 1), '', false)
  glyphText = makeText(Vector3.create(16, 7.55, 15.5), 1.9, Color4.create(0.85, 0.75, 1, 1), '', false)
  implementationText = makeText(Vector3.create(16, 6.25, 15.72), 1.25, Color4.create(0.7, 1, 0.78, 1), '', false)

  // ---------- the translator's speech bubble ----------
  // Her reading is the human half of the exchange, so it comes out of her rather than off a
  // screen. Billboarded: it floats in open air with nothing to clip into. Her podium sits at
  // (20.8, 12.8) — between console and bowl, off to the right — which is the one spot that
  // is both 46 deg off the player's forward view (so it reads without turning away from the
  // tank) and clear of the right console pylon, which cut straight through earlier placements.
  bubbleRoot = engine.addEntity()
  Transform.create(bubbleRoot, { position: Vector3.create(20.8, 4.2, 12.8) })
  Billboard.create(bubbleRoot, { billboardMode: BillboardMode.BM_Y })
  VisibilityComponent.create(bubbleRoot, { visible: false, propagateToChildren: true })

  const bubbleBack = engine.addEntity()
  Transform.create(bubbleBack, { parent: bubbleRoot, position: Vector3.create(0, 0, 0.07), scale: Vector3.create(4.8, 3.4, 0.1) })
  MeshRenderer.setBox(bubbleBack)
  Material.setPbrMaterial(bubbleBack, {
    albedoColor: Color4.create(0.03, 0.03, 0.05, 0.9),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    emissiveColor: Color3.create(0.06, 0.06, 0.12),
    emissiveIntensity: 0.6,
    roughness: 0.9
  })
  const bubbleRim = engine.addEntity()
  Transform.create(bubbleRim, { parent: bubbleRoot, position: Vector3.create(0, 0, 0.13), scale: Vector3.create(4.96, 3.56, 0.06) })
  MeshRenderer.setBox(bubbleRim)
  Material.setPbrMaterial(bubbleRim, {
    albedoColor: Color4.create(0.35, 0.85, 0.95, 1),
    emissiveColor: Color3.create(0.25, 0.75, 0.9),
    emissiveIntensity: 1.4
  })
  // tail: a cone tapering down toward her head
  const bubbleTail = engine.addEntity()
  Transform.create(bubbleTail, { parent: bubbleRoot, position: Vector3.create(0, -2.0, 0.07), scale: Vector3.create(0.7, 0.8, 0.25) })
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
    // 1.5 wrapped at 24 puts the longest card at 4.25 x 2.97 m inside the 4.8 x 3.4 m panel
    fontSize: 1.5,
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
  const speechBacking = engine.addEntity()
  Transform.create(speechBacking, { position: Vector3.create(16, 4.5, 15.26), scale: Vector3.create(6.2, 1.7, 0.06) })
  MeshRenderer.setBox(speechBacking)
  Material.setPbrMaterial(speechBacking, {
    albedoColor: Color4.create(0.02, 0.02, 0.04, 0.88),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 0.9
  })
  speechText = makeText(Vector3.create(16, 4.5, 15.15), 1.5, Color4.create(1, 1, 0.8, 1), '', false)

  // the translator — on her podium beside the console, turned toward the player
  translatorAvatar = engine.addEntity()
  Transform.create(translatorAvatar, {
    position: Vector3.create(20.8, 0.6, 12.8),
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
    Transform.create(b, { position: BUTTON_POS[i], scale: Vector3.create(0.92, 0.55, 0.92) })
    MeshCollider.setBox(b, ColliderLayer.CL_POINTER) // no MeshRenderer -> invisible but clickable
    const idx = i
    // registered exactly once — never re-register from inside a callback
    pointerEventsSystem.onPointerDown(
      { entity: b, opts: { button: InputAction.IA_POINTER, hoverText: 'press', maxDistance: 14 } },
      () => onButtonPressed(idx)
    )
    buttons.push(b)
    // caption sits on the modelled plate behind each dome
    buttonCaptions.push(makeText(CAPTION_POS[i], 0.75, Color4.White(), '', false))
  }

  // end-of-run plaque (hidden until death); clicking it restarts
  plaqueBox = engine.addEntity()
  Transform.create(plaqueBox, { position: Vector3.create(16, 3.6, 13.4), scale: Vector3.create(5.4, 2.6, 0.1) })
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

  // turbine: two crossed blades in the upper half of the globe, spun by a system
  turbineRoot = engine.addEntity()
  Transform.create(turbineRoot, { position: Vector3.create(16, 5.8, 19) })
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
  TextShape.getMutable(translatorText).text = wrap(card.translation, 24)
  setVisible(bubbleRoot, true)
  TextShape.getMutable(implementationText).text = ''
  TextShape.getMutable(speechText).text = ''
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
  TextShape.getMutable(implementationText).text = wrap(`THE ALIENS ${opt.implementation}`, 44)
  showStaged(opt.staged)

  delay(0.8, () => {
    let net = 0
    if (!opt.instantDeath) {
      for (const key of Object.keys(opt.effects) as MeterKey[]) {
        const v = opt.effects[key] ?? 0
        net += v
        meters[key] = Math.max(0, Math.min(10, meters[key] + v))
      }
    }
    updateMetersDisplay()
    TextShape.getMutable(speechText).text = wrap(`"${opt.reaction}"`, 30)
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

  delay(6.0, () => {
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
  TextShape.getMutable(speechText).text = ''
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
