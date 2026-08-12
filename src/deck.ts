// H1-02 greybox deck — v2 of the H1-01 paper deck (deadlier: bigger swings, 2 instant deaths).
// Deterministic outcomes; variety comes from shuffle order (see design/shortGDD.md §3).

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

export const DECK: DeckCard[] = [
  {
    glyphs: '◆▲■ ●◇ ▲▲?',
    translation: "Okay. I *think* it says: 'HUMAN GETTING DRY.'\nThe third glyph could also mean 'crunchy'. I hope it doesn't.",
    options: [
      {
        caption: 'WATER',
        glyph: '~~~',
        implementation: 'flood the cage with hot vapor. 100% humidity achieved.',
        reaction: 'I said water, not a sauna.',
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
        reaction: 'MY PAPERS! I HAD A SYSTEM!',
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
        implementation: 'activate the sprinklers. Tears mean dryness, obviously.',
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
    translation: "'HUMAN FUR INSUFFICIENT. COLD?'\nI told them you don't have fur. They wrote it down. Ominously.",
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
        reaction: "IT'S LICKING THE GL—",
        effects: {},
        staged: 'predator',
        instantDeath: 'The companion was hungry.'
      },
      {
        caption: 'MIRROR',
        glyph: '| |',
        implementation: 'install a mirror. Now there are two.',
        reaction: 'Hi. Hi. Hi.',
        effects: { mood: +2 }
      },
      {
        caption: 'NO. HUMANS SELF-CONTAIN',
        glyph: '●■',
        implementation: 'cite a documentary nobody can find.',
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
        implementation: 'deliver a wheelbarrow of raw soil. Certified organic.',
        reaction: 'This is dirt. This is a barrow of dirt.',
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
    translation: "'HUMAN HORIZONTAL 8 HOURS. BROKEN?'\nThey think you're broken. You were sleeping. I lament everything.",
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
        caption: 'FREE BIRD CEREMONY',
        glyph: '^^',
        implementation: 'open the cage for ten ceremonial seconds. Then recapture.',
        reaction: 'I tasted freedom. It tastes like the parking lot.',
        effects: { mood: +5, water: -2 }
      }
    ]
  }
]

export const DECK_SIZE = DECK.length

export const DEATH_LINES: Record<MeterKey, string> = {
  water: 'The human has achieved raisin form.',
  air: 'The human is doing an extended mime performance. It is not a performance.',
  temp: 'The human is now a decorative ice sculpture. Visitors love it.',
  mood: 'The human has turned to face the wall and declines further consulting.'
}
