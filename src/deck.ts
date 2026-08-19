// ============================================================================
//  GAME CONTENT FILE — edit this file to change the game's writing.
//
//  Everything the game says lives here: the aliens' questions, the three
//  options on the console, what the aliens actually do, the human's reactions,
//  and the death messages. No other file needs touching to add content.
//
//  HOW TO ADD A NEW QUESTION CARD
//  ------------------------------
//  Copy this template, paste it into the DECK list below (between two cards),
//  and fill in the text. Every card needs EXACTLY 3 options.
//
//  {
//    glyphs: '◆▲■ ●◇',
//    translation: "'WHAT THE ALIENS ARE ASKING.'\nThe translator's doubtful comment.",
//    options: [
//      {
//        caption: 'BUTTON LABEL',
//        glyph: '~~~',
//        implementation: 'do something absurd. (Shown as "THE ALIENS do something absurd.")',
//        reaction: "The human's spoken reaction.",
//        effects: { water: +2, mood: -3 }
//      },
//      // ...two more options like the one above
//    ]
//  },
//
//  WHAT EACH FIELD DOES
//  --------------------
//  glyphs        The alien symbols shown on the big panel. The characters are
//                just IDs — each distinct character (◆, ▲, ~, any letter…)
//                is assigned one abstract symbol from the atlas, and the SAME
//                character always shows the SAME symbol on every card. Spaces
//                make word gaps. Repeat a character to repeat its symbol
//                (that's how the "▲▲▲" gags work). Fits at most 12 symbols.
//
//  translation   The translator's reading, shown in her speech bubble.
//                Use \n for a line break. Lines wrap every ~32 characters;
//                keep it to 2-3 short sentences so the bubble doesn't overflow.
//
//  caption       The label on the console button. Keep it SHORT — it wraps
//                every 12 characters, so 1-2 short words is ideal.
//
//  glyph         The alien symbols floating above that button (same character
//                rules as `glyphs` above). Fits at most 6 symbols.
//
//  implementation  What the aliens actually do. Shown on the panel as
//                "THE ALIENS <implementation>" — so start lowercase and write
//                it to follow "THE ALIENS…". Wraps every ~34 characters.
//
//  reaction      What the human says (or does) in response, shown as a quoted
//                speech line. Stage directions in (parentheses) work well.
//
//  effects       How the choice moves the four survival meters. Meters go
//                from 0 to 10 and start at 5; if ANY meter hits 0 the game
//                ends with that meter's DEATH_LINES message below. Use any
//                mix of: water, air, temp, mood — with values like +3 / -4.
//                Leave it as {} for no meter change. Typical range -5…+5;
//                +5/-5 are big swings.
//
//  staged        OPTIONAL. Triggers a physical prop in the scene while the
//                consequence plays. Must be one of:
//                  'vapor'    — hot fog floods the cage
//                  'snow'     — indoor snowfall
//                  'turbine'  — the ceiling fan spins up
//                  'predator' — the companion creature appears
//
//  instantDeath  OPTIONAL. If present, picking this option ends the run
//                immediately with this message (meters are ignored). The
//                `reaction` still plays first — great for cut-off lines.
//
//  Cards are shuffled each run and the deck repeats endlessly, so order in
//  this list doesn't matter. Save the file and the scene hot-reloads; if a
//  card breaks a rule (wrong option count, too many symbols, a typo in an
//  effect name) a clear [deck] warning appears in the scene console.
// ============================================================================

export type MeterKey = 'water' | 'air' | 'temp' | 'mood'

export interface DeckOption {
  caption: string
  glyph: string
  implementation: string // shown as "THE ALIENS: ..."
  reaction: string // the human's line
  effects: Partial<Record<MeterKey, number>>
  staged?: 'vapor' | 'turbine' | 'snow' | 'predator'
  instantDeath?: string // death line; overrides effects and meters
}

export interface DeckCard {
  glyphs: string
  translation: string // translator's doubtful reading
  options: DeckOption[]
}

// ---------------------------------------------------------------------------
//  THE DECK — the question cards. Add, remove, or edit cards freely.
// ---------------------------------------------------------------------------
export const DECK: DeckCard[] = [
  {
    glyphs: '◆▲■ ●◇ ▲▲?',
    translation: "Okay. I *think* it says: 'HUMAN GETTING DRY.'\nThe third glyph could also mean 'crunchy'. I hope it doesn't.",
    options: [
      {
        caption: 'WATER',
        glyph: '~~~',
        implementation: 'flood the cage with hot vapor. 100% humidity achieved.',
        reaction: 'I said water, not a sauna. I cant drink this!',
        effects: { water: +5, air: -4 },
        staged: 'vapor'
      },
      {
        caption: 'ICE CRISTALS',
        glyph: '◇·◇',
        implementation: 'make it snow crushed ice. Indoors.',
        reaction: "It's snowing. Indoors. On me.",
        effects: { water: +4, temp: -4 },
        staged: 'snow'
      },
      {
        caption: 'GOOD',
        glyph: '●',
        implementation: 'change nothing. Machinery powers down contentedly.',
        reaction: 'Cool. Dying of thirst. Great consulting.',
        effects: { water: -3 }
      }
    ]
  },
  {
    glyphs: '■■ ◇● >>>',
    translation: "'AIR IN BOX NOT MOVING. CIRCULATE?'\n…why do they ask me. I majored in linguistics.",
    options: [
      {
        caption: 'BIG WIND',
        glyph: '>>>',
        implementation: 'deploy a ceiling turbine. 100 km/h sustained.',
        reaction: 'My hair is always going to be a mess now',
        effects: { air: +5, temp: -3, mood: -3 },
        staged: 'turbine'
      },
      {
        caption: 'TINY HOLE',
        glyph: '.',
        implementation: 'drill one 3 mm hole.',
        reaction: '(presses nose to the hole)',
        effects: { air: +2 }
      },
      {
        caption: 'NO. AIR IS GOOD AIR',
        glyph: '●◆',
        implementation: 'certify the existing air as good air.',
        reaction: 'It smells like a gym bag in here.',
        effects: { air: -3 }
      }
    ]
  },
  {
    glyphs: '◇▲■ ~~ ●●?',
    translation: "'HUMAN LEAKING SALT WATER FROM FACE. REFILL?'\n— they sound genuinely worried. That's sweet. Sort of.",
    options: [
      {
        caption: 'MORE WATER',
        glyph: '~~ ~~',
        implementation: 'activate the sprinklers to refill lost moisture.',
        reaction: 'Those were TEARS.',
        effects: { water: +3, mood: -2 }
      },
      {
        caption: 'PLUG LEAK',
        glyph: '[●]',
        implementation: 'fit tiny suction cups under the eyes.',
        reaction: '(muffled outrage)',
        effects: { mood: -4 }
      },
      {
        caption: 'HUMAN SOUNDS',
        glyph: '♪?',
        implementation: 'play recorded human sounds: dial-up internet noises.',
        reaction: '…why is this comforting.',
        effects: { mood: +4 }
      }
    ]
  },
  {
    glyphs: '▲▲▲ +◇ ■●',
    translation: "'HUMAN FUR INSUFFICIENT. COLD?'\nI told them you don't have fur.",
    options: [
      {
        caption: 'HEAT LAMP',
        glyph: '* * *',
        implementation: 'install three sun-lamps. Desert preset.',
        reaction: 'I can see my own bones.',
        effects: { temp: +5, water: -4 }
      },
      {
        caption: 'DONATE FUR',
        glyph: '◆■',
        implementation: 'glue on donated staff hair clippings. Generously.',
        reaction: "It's ITCHY and it SMELLS.",
        effects: { temp: +3, mood: -3 }
      },
      {
        caption: 'BLANKET?',
        glyph: '■?',
        implementation: 'provide an actual blanket. Someone read a book about you.',
        reaction: '…thank you? Genuinely?',
        effects: { temp: +3, mood: +3 }
      }
    ]
  },
  {
    glyphs: '● ◇◇ ▲+■?',
    translation: "'HUMAN ALONE. PROVIDE COMPANION?'\nCareful with this one. Their idea of 'companion' has teeth. Probably.",
    options: [
      {
        caption: 'COMPANION',
        glyph: 'VVV',
        implementation: 'introduce a large predator. It also has a face.',
        reaction: "IT'S LICKING MY AR—",
        effects: {},
        staged: 'predator',
        instantDeath: 'The companion was hungry.'
      },
      {
        caption: 'MIRROR',
        glyph: '| |',
        implementation: 'install a mirror. Now there are two.',
        reaction: 'At least I can tell I lost weight. More than Id like.',
        effects: { mood: +2 }
      },
      {
        caption: 'NO. HUMANS SELF-CONTAIN',
        glyph: '●■',
        implementation: 'Human membrane fully covers all body, no holes need to be patched by other humans',
        reaction: "I've started narrating my own actions.",
        effects: { mood: -3 }
      }
    ]
  },
  {
    glyphs: '▼▼ ◆● =▲',
    translation: "'FEEDING TIME. HUMAN FUEL TYPE?'\nI'm begging you to read all the options first.",
    options: [
      {
        caption: 'ORGANIC MATTER',
        glyph: '(*)',
        implementation: 'deliver a metric ton of raw soil. Certified organic.',
        reaction: 'This is dirt. This is nothing but dirt.',
        effects: { mood: -3, water: -2 }
      },
      {
        caption: 'HUMAN PELLET',
        glyph: '...',
        implementation: 'throw nutrient pellets from above, fish-food style.',
        reaction: "Don't. Catch it with your mouth— he caught it.",
        effects: { mood: -2 }
      },
      {
        caption: 'SWEET LIQUID',
        glyph: '●',
        implementation: 'pour in 200 liters of syrup.',
        reaction: 'This is a health hazard and delicious.',
        effects: { water: +3, mood: +2, air: -2 }
      }
    ]
  },
  {
    glyphs: '■+■ ◇▲ ●=?',
    translation: "'BOX DIRTY. CLEAN WITH HUMAN INSIDE?'\nThat preposition is doing a lot of work.",
    options: [
      {
        caption: 'YES. FULL RINSE',
        glyph: '~■',
        implementation: 'power-wash the enclosure. Contents included.',
        reaction: '(windshield-wiper arm movements)',
        effects: { water: +3, temp: -4, mood: -4 }
      },
      {
        caption: 'VACUUM',
        glyph: '(O)',
        implementation: 'deploy the industrial vacuum.',
        reaction: 'MY BLANKET— wait, WAIT—',
        effects: {},
        instantDeath: 'The vacuum was industrial.'
      },
      {
        caption: 'HUMAN CLEANS',
        glyph: '* ●',
        implementation: 'hand in one (1) tiny brush.',
        reaction: "Finally, a task. I've named the brush.",
        effects: { mood: +3 }
      }
    ]
  },
  {
    glyphs: '■■■ ●? ◆◆',
    translation: "'HUMAN HORIZONTAL 8 HOURS. BROKEN?'\nThey think he's broken. I lament everything.",
    options: [
      {
        caption: 'REBOOT',
        glyph: '<--',
        implementation: 'flip the cage upside down and shake it.',
        reaction: 'I WAS SLEEPING.',
        effects: { mood: -4, air: -2 }
      },
      {
        caption: 'DO NOT DISTURB',
        glyph: 'zzz',
        implementation: 'dim the lights. Somewhere, an alien gets it.',
        reaction: '(contented snoring)',
        effects: { mood: +4 }
      },
      {
        caption: 'MUSIC FIX',
        glyph: '♫♫',
        implementation: 'play alien opera at full volume. One sustained note.',
        reaction: "It's been one note for an hour.",
        effects: { mood: -3 }
      }
    ]
  },
  {
    glyphs: '◇●◇ ▲■+ ???',
    translation: "'HUMAN REQUESTS PRIVACY. UNKNOWN WORD.'\nI tried to explain privacy. There is no glyph for it.",
    options: [
      {
        caption: 'MORE EYES',
        glyph: '● ● ●',
        implementation: 'install additional observation cameras. It asked for attention, surely.',
        reaction: 'That is the opposite. The exact opposite.',
        effects: { mood: -4 }
      },
      {
        caption: 'CURTAIN',
        glyph: '■■',
        implementation: 'hang an opaque curtain around the cage.',
        reaction: 'Bless whoever invented fabric.',
        effects: { mood: +4 }
      },
      {
        caption: 'QUARANTINE',
        glyph: '[x]',
        implementation: 'seal the cage airtight. Unknown words are usually diseases.',
        reaction: 'Worth it. …wait, is it getting stuffy?',
        effects: { air: -5, mood: +2 }
      }
    ]
  },
  {
    glyphs: '◆▲◆ ■■● !!',
    translation: "'ANNIVERSARY OF ACQUISITION. CELEBRATE HUMAN.'\nOne year. Congratulations? I'm so sorry.",
    options: [
      {
        caption: 'FIREWORKS',
        glyph: '* ! *',
        implementation: 'hold a full pyrotechnic display. Inside the cage.',
        reaction: 'Terrifying. Gorgeous. Mostly terrifying.',
        effects: { air: -4, temp: +3, mood: +3 }
      },
      {
        caption: 'CAKE',
        glyph: '●▲',
        implementation: 'serve a cake of compressed pellets. One candle.',
        reaction: "It's the thought that counts.",
        effects: { mood: +3 }
      },
      {
        caption: 'SIMULATE FREEDOM',
        glyph: '^^',
        implementation: 'The pressure instantly lowers to 0 like in open space. The human explodes',
        reaction: 'AAAAHHH',
        effects: {},
        instantDeath: 'Free from the enclosure of the ship. And of a space suit.'
      }
    ]
  }
]

// ---------------------------------------------------------------------------
//  DEATH MESSAGES — shown on the memorial plaque when a meter hits 0.
//  One line per meter; edit freely.
// ---------------------------------------------------------------------------
export const DEATH_LINES: Record<MeterKey, string> = {
  water: 'The human has achieved raisin form.',
  air: 'The human is doing an extended mime performance. It is not a performance.',
  temp: 'The human is now a decorative ice sculpture. Visitors love it.',
  mood: 'The human has turned to face the wall and declines further consulting.'
}

// ============================================================================
//  Nothing to edit below this line.
// ============================================================================

export const DECK_SIZE = DECK.length

// Content sanity check, run once when the scene loads. Problems are reported
// as "[deck] ..." warnings in the scene console — the game still runs, but a
// card with the wrong option count is skipped-proofed here rather than
// crashing mid-round.
const METER_KEYS: MeterKey[] = ['water', 'air', 'temp', 'mood']
const STAGED_KINDS = ['vapor', 'turbine', 'snow', 'predator']
const symbolCount = (s: string) => [...s].filter((ch) => ch !== ' ').length
{
  const warn = (msg: string) => console.log(`[deck] WARNING: ${msg}`)
  DECK.forEach((card, ci) => {
    const id = `card ${ci + 1} ('${card.glyphs}')`
    if (card.options.length !== 3) warn(`${id} has ${card.options.length} options — the console has exactly 3 buttons`)
    if (symbolCount(card.glyphs) > 12) warn(`${id}: glyphs has ${symbolCount(card.glyphs)} symbols — only 12 fit on the panel`)
    if (!card.translation) warn(`${id}: empty translation`)
    card.options.forEach((opt, oi) => {
      const oid = `${id} option ${oi + 1} ('${opt.caption}')`
      if (!opt.caption) warn(`${oid}: empty caption`)
      if (symbolCount(opt.glyph) > 6) warn(`${oid}: glyph has ${symbolCount(opt.glyph)} symbols — only 6 fit above a button`)
      if (opt.staged && !STAGED_KINDS.includes(opt.staged)) warn(`${oid}: unknown staged effect '${opt.staged}' — use one of ${STAGED_KINDS.join(', ')}`)
      for (const key of Object.keys(opt.effects)) {
        if (!METER_KEYS.includes(key as MeterKey)) warn(`${oid}: unknown meter '${key}' in effects — use water, air, temp, mood`)
      }
      if (!opt.instantDeath && Object.keys(opt.effects).length === 0) warn(`${oid}: no effects and no instantDeath — picking it changes nothing`)
    })
  })
  if (DECK.length === 0) warn('the DECK is empty — the game cannot start')
}
