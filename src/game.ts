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
  pointerEventsSystem,
  PointerEvents,
  InputAction,
  ColliderLayer
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4, Color3 } from '@dcl/sdk/math'
import { DECK, DECK_SIZE, DeckOption, MeterKey, DEATH_LINES } from './deck'

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
  billboard = true
): Entity {
  const e = engine.addEntity()
  Transform.create(e, { position, rotation: Quaternion.Identity() })
  TextShape.create(e, {
    text,
    fontSize,
    textColor: color,
    outlineColor: Color3.Black(),
    outlineWidth: 0.25,
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
let metersText: Entity
let dayText: Entity
let glyphText: Entity
let translatorText: Entity
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

const CAGE_CENTER = Vector3.create(8, 1.5, 10)

export function setupGame() {
  // floor + backdrop
  const floor = engine.addEntity()
  Transform.create(floor, { position: Vector3.create(8, 0.02, 8), scale: Vector3.create(16, 0.04, 16) })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, { albedoColor: Color4.create(0.13, 0.13, 0.17, 1), roughness: 0.9 })

  const backdrop = engine.addEntity()
  Transform.create(backdrop, { position: Vector3.create(8, 3.5, 14.6), scale: Vector3.create(14, 7, 0.1) })
  MeshRenderer.setBox(backdrop)
  Material.setPbrMaterial(backdrop, { albedoColor: Color4.create(0.09, 0.08, 0.14, 1), roughness: 1 })

  // the screen (question panel) above/behind the cage
  const screen = engine.addEntity()
  Transform.create(screen, { position: Vector3.create(8, 4.3, 13.9), scale: Vector3.create(12, 4.6, 0.08) })
  MeshRenderer.setBox(screen)
  Material.setPbrMaterial(screen, {
    albedoColor: Color4.create(0.02, 0.02, 0.05, 1),
    roughness: 0.9
  })

  dayText = makeText(Vector3.create(8, 6.1, 13.4), 3, Color4.create(1, 0.85, 0.4, 1), '', false)
  glyphText = makeText(Vector3.create(8, 5.4, 13.4), 3.5, Color4.create(0.75, 0.6, 1, 1), '', false)
  translatorText = makeText(Vector3.create(8, 4.5, 13.4), 2.2, Color4.White(), '', false)
  implementationText = makeText(Vector3.create(8, 4.5, 13.4), 2.2, Color4.create(0.6, 1, 0.7, 1), '', false)

  // the cage
  const cage = engine.addEntity()
  Transform.create(cage, { position: CAGE_CENTER, scale: Vector3.create(4, 3, 4) })
  MeshRenderer.setBox(cage)
  MeshCollider.setBox(cage, ColliderLayer.CL_PHYSICS)
  Material.setPbrMaterial(cage, {
    albedoColor: Color4.create(0.55, 0.85, 0.95, 0.25),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    metallic: 0.2,
    roughness: 0.1
  })

  // meters above the cage front, on a dark backing strip
  const metersStrip = engine.addEntity()
  Transform.create(metersStrip, { position: Vector3.create(8, 3.1, 7.98), scale: Vector3.create(7.2, 0.6, 0.06) })
  MeshRenderer.setBox(metersStrip)
  Material.setPbrMaterial(metersStrip, { albedoColor: Color4.create(0.03, 0.03, 0.06, 1), roughness: 0.9 })
  metersText = makeText(Vector3.create(8, 3.1, 7.9), 1.8, Color4.White(), '', false)

  // the human — a naked base avatar in the cage, facing the console
  humanAvatar = engine.addEntity()
  Transform.create(humanAvatar, {
    position: Vector3.create(8, 0, 10),
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

  speechText = makeText(Vector3.create(8, 2.4, 9.2), 2, Color4.create(1, 1, 0.75, 1))

  // the translator — beside the console, generic wearables for now
  translatorAvatar = engine.addEntity()
  Transform.create(translatorAvatar, {
    position: Vector3.create(4.2, 0, 7.6),
    rotation: Quaternion.fromEulerDegrees(0, 160, 0)
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

  // console + three buttons
  const consoleBase = engine.addEntity()
  Transform.create(consoleBase, { position: Vector3.create(8, 0.45, 6.5), scale: Vector3.create(6.6, 0.9, 1.1) })
  MeshRenderer.setBox(consoleBase)
  Material.setPbrMaterial(consoleBase, { albedoColor: Color4.create(0.3, 0.26, 0.45, 1), metallic: 0.4, roughness: 0.5 })

  const buttonColors = [
    Color4.create(0.95, 0.72, 0.25, 1),
    Color4.create(0.35, 0.8, 0.65, 1),
    Color4.create(0.9, 0.45, 0.45, 1)
  ]
  for (let i = 0; i < 3; i++) {
    const b = engine.addEntity()
    Transform.create(b, {
      position: Vector3.create(5.6 + i * 2.4, 1.05, 6.5),
      scale: Vector3.create(1.1, 0.35, 0.8)
    })
    MeshRenderer.setBox(b)
    MeshCollider.setBox(b) // default layers include CL_POINTER
    Material.setPbrMaterial(b, {
      albedoColor: buttonColors[i],
      emissiveColor: Color3.create(buttonColors[i].r * 0.5, buttonColors[i].g * 0.5, buttonColors[i].b * 0.5),
      emissiveIntensity: 0.2,
      roughness: 0.3
    })
    const idx = i
    // registered exactly once — never re-register from inside a callback
    pointerEventsSystem.onPointerDown(
      { entity: b, opts: { button: InputAction.IA_POINTER, hoverText: 'press', maxDistance: 14 } },
      () => onButtonPressed(idx)
    )
    buttons.push(b)
    buttonCaptions.push(makeText(Vector3.create(5.6 + i * 2.4, 1.7, 6.5), 1.6, Color4.White()))
  }

  // end-of-run plaque (hidden until death); clicking it restarts
  plaqueBox = engine.addEntity()
  Transform.create(plaqueBox, { position: Vector3.create(8, 2.3, 7.7), scale: Vector3.create(5, 2.4, 0.1) })
  MeshRenderer.setBox(plaqueBox)
  Material.setPbrMaterial(plaqueBox, {
    albedoColor: Color4.create(0.08, 0.07, 0.1, 0.92),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    emissiveColor: Color3.create(0.25, 0.05, 0.05),
    emissiveIntensity: 0.5
  })
  VisibilityComponent.create(plaqueBox, { visible: false })
  plaqueText = makeText(Vector3.create(8, 2.3, 7.55), 1.8, Color4.create(1, 0.9, 0.6, 1))
  VisibilityComponent.create(plaqueText, { visible: false })
  pointerEventsSystem.onPointerDown(
    { entity: plaqueBox, opts: { button: InputAction.IA_POINTER, hoverText: 'RESTART', maxDistance: 14 } },
    () => {
      if (state === 'gameover') restart()
    }
  )

  // ---------- staged consequences (pre-built, hidden) ----------
  // hot vapor: translucent volume filling the cage
  vaporRoot = engine.addEntity()
  Transform.create(vaporRoot, { position: CAGE_CENTER, scale: Vector3.create(3.7, 2.7, 3.7) })
  MeshRenderer.setBox(vaporRoot)
  Material.setPbrMaterial(vaporRoot, {
    albedoColor: Color4.create(1, 1, 1, 0.45),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    roughness: 1
  })
  VisibilityComponent.create(vaporRoot, { visible: false })

  // turbine: two crossed blades at the cage ceiling, spun by a system
  turbineRoot = engine.addEntity()
  Transform.create(turbineRoot, { position: Vector3.create(8, 2.85, 10) })
  VisibilityComponent.create(turbineRoot, { visible: false, propagateToChildren: true })
  const bladeA = engine.addEntity()
  Transform.create(bladeA, { parent: turbineRoot, position: Vector3.Zero(), scale: Vector3.create(3.4, 0.08, 0.35) })
  MeshRenderer.setBox(bladeA)
  Material.setPbrMaterial(bladeA, { albedoColor: Color4.create(0.7, 0.7, 0.75, 1), metallic: 0.8, roughness: 0.3 })
  const bladeB = engine.addEntity()
  Transform.create(bladeB, { parent: turbineRoot, position: Vector3.Zero(), scale: Vector3.create(0.35, 0.08, 3.4) })
  MeshRenderer.setBox(bladeB)
  Material.setPbrMaterial(bladeB, { albedoColor: Color4.create(0.7, 0.7, 0.75, 1), metallic: 0.8, roughness: 0.3 })
  engine.addSystem((dt) => {
    if (!turbineActive) return
    const t = Transform.getMutable(turbineRoot)
    t.rotation = Quaternion.multiply(t.rotation, Quaternion.fromEulerDegrees(0, dt * 720, 0))
  })

  // snow: scattered ice cubes on the cage floor
  snowRoot = engine.addEntity()
  Transform.create(snowRoot, { position: Vector3.create(8, 0, 10) })
  VisibilityComponent.create(snowRoot, { visible: false, propagateToChildren: true })
  const snowSpots: [number, number, number][] = [
    [-1.2, 0.15, -0.9], [0.8, 0.15, -1.3], [1.3, 0.15, 0.7], [-0.6, 0.15, 1.2],
    [0.2, 0.15, 0.3], [-1.4, 0.15, 0.4], [0.9, 0.15, 1.4], [-0.2, 0.15, -1.4]
  ]
  for (const [x, y, z] of snowSpots) {
    const cube = engine.addEntity()
    Transform.create(cube, { parent: snowRoot, position: Vector3.create(x, y, z), scale: Vector3.create(0.3, 0.3, 0.3) })
    MeshRenderer.setBox(cube)
    Material.setPbrMaterial(cube, { albedoColor: Color4.create(0.85, 0.95, 1, 0.9), transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND, roughness: 0.1, metallic: 0.1 })
  }

  // predator: a large glossy red box that appears next to the human
  predatorRoot = engine.addEntity()
  Transform.create(predatorRoot, { position: Vector3.create(6.9, 0.7, 10.8), scale: Vector3.create(1.3, 1.4, 1.6) })
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

function updateMetersDisplay() {
  const mark = (v: number) => `${v}${v <= 3 ? '!' : ''}`
  TextShape.getMutable(metersText).text =
    `WATER ${mark(meters.water)}   AIR ${mark(meters.air)}   TEMP ${mark(meters.temp)}   MOOD ${mark(meters.mood)}`
  const anyCritical = (Object.values(meters) as number[]).some((v) => v <= 2)
  TextShape.getMutable(metersText).textColor = anyCritical ? Color4.create(1, 0.4, 0.35, 1) : Color4.White()
}

function render() {
  const card = currentCard()
  const r = ((round - 1) % ROUNDS_PER_DAY) + 1
  TextShape.getMutable(dayText).text = `DAY ${dayOf(round)}  ·  ${r}/${ROUNDS_PER_DAY}`
  TextShape.getMutable(glyphText).text = card.glyphs
  TextShape.getMutable(translatorText).text = wrap(`TRANSLATOR: ${card.translation}`, 44)
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
  TextShape.getMutable(metersText).text = ''
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
