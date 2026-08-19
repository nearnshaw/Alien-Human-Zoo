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
  VirtualCamera,
  MainCamera,
  InputModifier,
  TouchScreenControls,
  pointerEventsSystem,
  PointerEvents,
  InputAction,
  ColliderLayer
} from '@dcl/sdk/ecs'
import { getPlatform, isMobile } from '@dcl/sdk/platform'
import { Vector3, Quaternion, Color4, Color3 } from '@dcl/sdk/math'
import { DECK, DECK_SIZE, DeckOption, MeterKey, DEATH_LINES } from './deck'
import { GlyphRow, createGlyphRow, setGlyphRowText } from './glyphs'

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
// x/z 0..32 here at an identity Transform.
const ENV_MODEL = 'assets/scene/models/alien_zoo_interior.glb'

// The main set pieces are split out of the environment GLB so they can be moved
// independently. All declared in assets/scene/main.composite — their live Transform is
// whatever the Creator Hub editor last saved; reposition them there, not here.
const CONSOLE_MODEL = 'assets/scene/models/alien_console.glb' // arc, buttons, pylons + floor feed cables
const TRANSLATOR_BOOTH_MODEL = 'assets/scene/models/alien_translator_booth.glb' // podium, ring + cable
const SPAWN_PAD_MODEL = 'assets/scene/models/alien_spawn_pad.glb' // dais + ring at the arrival point
const GLYPH_PANEL_MODEL = 'assets/scene/models/alien_glyph_panel.glb' // the canted alien-glyph display

// Each piece was exported with its origin at the bottom-center of its bounding box, and
// these are the positions that reproduce the original combined-model layout: the fallback
// spot if a piece is missing from the composite, and the anchor that turns this file's
// tuned absolute coordinates into piece-relative offsets for the parented overlays.
const CONSOLE_POS = Vector3.create(16, 0, 12.7982)
const TRANSLATOR_BOOTH_POS = Vector3.create(21.2941, 0, 14.9951)
const SPAWN_PAD_POS = Vector3.create(16, -0.03, 7.6)
const GLYPH_PANEL_POS = Vector3.create(16, 4.3138, 14.85)

const PLATFORM_Y = 1.54 // top of the specimen platform inside the bowl
const FACE_PLAYER = Quaternion.Identity()

// Global multiplier on every TextShape font size (mobile readability).
const TEXT_SCALE = 2.0

// the three domed buttons modelled on the console arc, and their caption plates
const BUTTON_POS: Vector3[] = [
  Vector3.create(14.271, 1.165, 9.746),
  Vector3.create(16.0, 1.165, 10.145),
  Vector3.create(17.729, 1.165, 9.746)
]
const CAPTION_POS: Vector3[] = [
  Vector3.create(14.023, 1.57, 10.254),
  Vector3.create(16.0, 1.57, 10.71),
  Vector3.create(17.977, 1.57, 10.254)
]
const CAPTION_YAW = [-26, 0, 26]

// The four meter panels on the posts flanking the bowl.
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
  // When parented to a set piece, `position` must already be piece-relative: subtract the
  // piece's ORIGINAL anchor (CONSOLE_POS etc.), never its live transform.
  Transform.create(e, { position, rotation, parent })
  TextShape.create(e, {
    text,
    fontSize: fontSize * TEXT_SCALE,
    textColor: color,
    outlineColor: Color3.Black(),
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

// ---------- mobile mode ----------
// On mobile the 3D console/glyph panel are unusable (tap targets are tiny and the camera
// fights the touch joystick), so the scene switches interaction models entirely:
//   - a fixed VirtualCamera frames everything readable at once
//   - the console and glyph panel models (and their colliders) are moved out of the room
//   - question glyphs, translator reading, consequence line, day counter, answer
//     buttons and restart all render as screen-space UI (src/ui.tsx) via `uiState`
// Desktop is untouched. The platform is reported asynchronously shortly after scene
// start, so setupGame() defers building until it is known (3 s fallback = desktop).
const FORCE_MOBILE_PREVIEW = false // set true to preview the mobile layout on desktop

let MOBILE = false

// read by src/ui.tsx every frame; mutated from render()/onButtonPressed()/gameOver()
export const uiState = {
  mobile: false,
  day: '',
  glyphs: '', // the alien question, drawn as atlas sprites (3D quads don't render on mobile)
  captions: ['', '', ''],
  translation: '', // the translator's reading — her 3D bubble is not shown on mobile
  implementation: '', // "THE ALIENS ..." — its 3D mount (the glyph panel) is gone on mobile
  showButtons: false,
  showRestart: false
}

export function uiPress(i: number) {
  onButtonPressed(i)
}

export function uiRestart() {
  if (state === 'gameover') restart()
}

function setupMobileCamera() {
  // One fixed shot tuned against the real set (framed with the Explorer's free camera).
  const cam = engine.addEntity()
  const camPos = Vector3.create(16, 5.2, 4)
  // target y 3.2: the downward tilt lifts the set in the frame so the translator's
  // upper body clears the UI button row at the bottom edge
  const camTarget = Vector3.create(16.3, 3.2, 16)
  Transform.create(cam, { position: camPos, rotation: Quaternion.fromLookAt(camPos, camTarget) })
  VirtualCamera.create(cam, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0) }
  })
  MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: cam })
  // The whole game is played through the UI under a fixed camera — freeze the player.
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: InputModifier.Mode.Standard({ disableAll: true })
  })
  // ...and strip the native touch controls: joystick, crosshair and all on-screen
  // gamepad buttons are dead weight overlapping our buttons. The client's own HUD
  // (emote wheel, profile) is not scene-controllable. No-op on desktop.
  TouchScreenControls.create(engine.RootEntity, {
    hideJoystick: true,
    hideCrosshair: true,
    touchInputs: [
      InputAction.IA_POINTER,
      InputAction.IA_PRIMARY,
      InputAction.IA_SECONDARY,
      InputAction.IA_JUMP,
      InputAction.IA_ACTION_3,
      InputAction.IA_ACTION_4,
      InputAction.IA_ACTION_5,
      InputAction.IA_ACTION_6
    ].map((inputAction) => ({ inputAction, hide: true }))
  })
}

// ---------- entities (created once in buildScene) ----------
const meterTexts = new Map<MeterKey, Entity>()
let dayText: Entity
let glyphRow: GlyphRow
const buttonGlyphRows: GlyphRow[] = []
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
  // platform is reported async shortly after scene start; the layout depends on it
  let waited = 0
  engine.addSystem(function bootWhenPlatformKnown(dt: number) {
    waited += dt
    if (getPlatform() === null && waited < 3) return
    engine.removeSystem(bootWhenPlatformKnown)
    MOBILE = FORCE_MOBILE_PREVIEW || isMobile()
    uiState.mobile = MOBILE
    if (MOBILE) console.log('[H1-02] mobile mode: fixed camera + UI, console hidden')
    buildScene()
  })
}

function buildScene() {
  // ---------- the environment and movable set pieces ----------
  // All declared in main.composite so the Creator Hub can reposition them; looked up here
  // by name, recreated in code at the original spot if missing. Colliders stay on
  // CL_PHYSICS alone deliberately (console colliders enclose the button volumes).
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
  pieceEntity('Environment', ENV_MODEL, Vector3.Zero())
  const consoleRoot = pieceEntity('Console', CONSOLE_MODEL, CONSOLE_POS)
  const boothRoot = pieceEntity('Translator Booth', TRANSLATOR_BOOTH_MODEL, TRANSLATOR_BOOTH_POS)
  pieceEntity('Spawn Pad', SPAWN_PAD_MODEL, SPAWN_PAD_POS)
  const glyphPanelRoot = pieceEntity('Glyph Panel', GLYPH_PANEL_MODEL, GLYPH_PANEL_POS)

  if (MOBILE) {
    // console + glyph panel replaced by screen-space UI: sink both (model AND colliders)
    for (const piece of [consoleRoot, glyphPanelRoot]) {
      const t = Transform.getMutable(piece)
      t.position = Vector3.create(t.position.x, t.position.y - 60, t.position.z)
    }
    setupMobileCamera()
  }

  setupWalls()
  setupLighting()

  if (!MOBILE) {
    // on mobile the day counter lives in the UI (uiState.day) — its console mount is gone
    dayText = makeText(
      Vector3.subtract(Vector3.create(16, 2.35, 10.6), CONSOLE_POS),
      0.9, Color4.create(1, 0.85, 0.4, 1), '', false, FACE_PLAYER, consoleRoot
    )
  }
  // The alien question line is symbol quads over the glyph atlas — see src/glyphs.ts.
  glyphRow = createGlyphRow({
    parent: glyphPanelRoot,
    position: Vector3.subtract(Vector3.create(16, 5.35, 14.6), GLYPH_PANEL_POS),
    size: 0.52,
    maxGlyphs: 12,
    color: Color3.create(0.85, 0.75, 1)
  })
  implementationText = makeText(
    Vector3.subtract(Vector3.create(16, 4.65, 14.2), GLYPH_PANEL_POS),
    1.45, Color4.create(0.7, 1, 0.78, 1), '', false, FACE_PLAYER, glyphPanelRoot
  )

  // ---------- the translator's speech bubble (desktop only — mobile uses UI) ----------
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
    fontSize: 1.4 * TEXT_SCALE,
    textColor: Color4.White(),
    outlineColor: Color3.Black(),
    outlineWidth: 0.4,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })

  // ---------- meter readouts, one per physical panel on the flanking posts ----------
  for (const panel of METER_PANELS) {
    meterTexts.set(panel.key, makeText(panel.pos, 1.25, Color4.White(), '', true))
  }

  // the human — a naked base avatar on the platform inside the fishbowl
  humanAvatar = engine.addEntity()
  Transform.create(humanAvatar, {
    position: Vector3.create(16.2, PLATFORM_Y, 19.2),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(humanAvatar, {
    id: 'human-c4e1',
    name: '',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
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

  // The human's line floats just outside the front of the glass, with a dark backing slab.
  speechBacking = engine.addEntity()
  Transform.create(speechBacking, { position: Vector3.create(16, 3.05, 15.12), scale: Vector3.create(9.3, 2.1, 0.06) })
  MeshRenderer.setBox(speechBacking)
  Material.setPbrMaterial(speechBacking, {
    albedoColor: Color4.create(0.02, 0.02, 0.04, 0.88),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 0.9
  })
  VisibilityComponent.create(speechBacking, { visible: false })
  speechText = makeText(Vector3.create(16, 3.05, 15.0), 1.7, Color4.create(1, 1, 0.8, 1), '', false)

  // the translator — on her podium beside the console
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

  // ---------- the three buttons (desktop only — mobile renders them in UI) ----------
  // Invisible pointer volumes sitting exactly on the modelled domes.
  if (!MOBILE) {
    for (let i = 0; i < 3; i++) {
      const b = engine.addEntity()
      Transform.create(b, {
        parent: consoleRoot,
        position: Vector3.subtract(BUTTON_POS[i], CONSOLE_POS),
        scale: Vector3.create(0.92, 0.55, 0.92)
      })
      MeshCollider.setBox(b, ColliderLayer.CL_POINTER)
      const idx = i
      // registered exactly once — never re-register from inside a callback
      pointerEventsSystem.onPointerDown(
        { entity: b, opts: { button: InputAction.IA_POINTER, hoverText: 'press', maxDistance: 14 } },
        () => onButtonPressed(idx)
      )
      buttons.push(b)
      buttonCaptions.push(
        makeText(
          Vector3.subtract(CAPTION_POS[i], CONSOLE_POS),
          0.9, Color4.White(), '', false, Quaternion.fromEulerDegrees(0, CAPTION_YAW[i], 0), consoleRoot
        )
      )
      buttonGlyphRows.push(
        createGlyphRow({
          parent: consoleRoot,
          position: Vector3.subtract(Vector3.add(CAPTION_POS[i], Vector3.create(0, 0.52, 0)), CONSOLE_POS),
          rotation: Quaternion.fromEulerDegrees(0, CAPTION_YAW[i], 0),
          size: 0.3,
          maxGlyphs: 6,
          color: Color3.create(0.6, 0.95, 1)
        })
      )
    }
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
interface Lamp {
  name: string
  pos: Vector3
  color: Color3
  intensity: number
  range: number
}

const LAMPS: Lamp[] = [
  { name: 'bowl-uplight', pos: Vector3.create(16, 2.2, 19), color: Color3.create(0.35, 0.92, 1.0), intensity: 13000, range: 13 },
  { name: 'bowl-key', pos: Vector3.create(16, 7.8, 19), color: Color3.create(0.72, 0.9, 1.0), intensity: 10000, range: 15 },
  { name: 'console', pos: Vector3.create(16, 2.8, 9.4), color: Color3.create(1.0, 0.78, 0.45), intensity: 7000, range: 11 },
  { name: 'display', pos: Vector3.create(16, 6.6, 16.6), color: Color3.create(0.62, 0.42, 1.0), intensity: 6000, range: 12 },
  { name: 'backwall', pos: Vector3.create(16, 7.2, 29.0), color: Color3.create(0.55, 0.38, 1.0), intensity: 15000, range: 20 },
  { name: 'rim-west', pos: Vector3.create(3.8, 4.2, 16.0), color: Color3.create(0.85, 0.25, 0.8), intensity: 8000, range: 16 },
  { name: 'rim-east', pos: Vector3.create(28.2, 4.2, 16.0), color: Color3.create(0.3, 0.55, 1.0), intensity: 8000, range: 16 },
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
  const dayLine = `DAY ${dayOf(round)}  ·  ${r}/${ROUNDS_PER_DAY}`
  // on mobile the question glyphs live in the UI instead (the 3D quads don't render
  // there anyway — see uiState.glyphs)
  if (!MOBILE) setGlyphRowText(glyphRow, card.glyphs)
  TextShape.getMutable(implementationText).text = ''
  setSpeech('')
  updateMetersDisplay()
  if (MOBILE) {
    // console and glyph panel are gone — question glyphs, translator reading, day
    // counter and option buttons all render in src/ui.tsx
    uiState.day = dayLine
    uiState.glyphs = card.glyphs
    uiState.translation = wrap(card.translation, 44)
    uiState.implementation = ''
    for (let i = 0; i < 3; i++) uiState.captions[i] = card.options[i].caption
    uiState.showButtons = true
  } else {
    TextShape.getMutable(dayText).text = dayLine
    TextShape.getMutable(translatorText).text = wrap(card.translation, 32)
    setVisible(bubbleRoot, true)
    for (let i = 0; i < 3; i++) {
      const opt = card.options[i]
      TextShape.getMutable(buttonCaptions[i]).text = wrap(opt.caption, 12)
      setGlyphRowText(buttonGlyphRows[i], opt.glyph)
      setHoverText(buttons[i], opt.caption)
    }
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

  if (MOBILE) {
    uiState.showButtons = false
    uiState.translation = ''
    uiState.implementation = wrap(`THE ALIENS ${opt.implementation}`, 40)
  } else {
    for (let k = 0; k < 3; k++) {
      TextShape.getMutable(buttonCaptions[k]).text = ''
      setGlyphRowText(buttonGlyphRows[k], '')
    }
    TextShape.getMutable(translatorText).text = ''
    setVisible(bubbleRoot, false)
    // wrapped narrower than the old 44: at TEXT_SCALE a 44-char line overhangs the panel
    TextShape.getMutable(implementationText).text = wrap(`THE ALIENS ${opt.implementation}`, 34)
  }
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
  if (MOBILE) {
    uiState.showButtons = false
    uiState.glyphs = '' // the run is over — clear every question element off the screen
    uiState.translation = ''
    uiState.implementation = ''
    uiState.showRestart = true // the plaque is tappable too, but a big UI button is surer
  }
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
  uiState.showRestart = false
  state = 'question'
  render()
  console.log('[H1-02] RESTART')
}
