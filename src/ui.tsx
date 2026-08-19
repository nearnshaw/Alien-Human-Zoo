// Screen-space UI — only used in MOBILE mode (see the "mobile mode" section of
// src/game.ts). On mobile the 3D console is gone, so the alien question glyphs, the
// day counter, the three answer options and the game-over restart render here as
// large touch targets instead. On desktop `uiState.mobile` is false and this
// renders nothing.
//
// Layout notes:
//   - ScreenInsetArea keeps everything clear of notches / home indicators.
//   - The glyph row + day counter sit top-center, between the client's profile
//     cluster (top-left) and the translator's 3D speech bubble (top-right).
//   - The button row hugs the bottom and is deliberately short: the translator
//     stands bottom-right in the fixed camera shot and her upper body must stay
//     visible above the buttons.
//   - The glyphs are drawn as UV-cropped sprites straight from the same atlas the
//     3D panel uses (the 3D alpha-tested quads don't render on the mobile client).
//   - No borderRadius anywhere: it is unsupported on the mobile renderer.
import ReactEcs, { ReactEcsRenderer, ScreenInsetArea, UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { uiState, uiPress, uiRestart } from './game'
import { ATLAS_SRC, GRID, cellOf } from './glyphs'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiMenu, { virtualWidth: 1920, virtualHeight: 1080 })
}

// palette matched to the set: dark indigo panels, cyan rims (the bubble's colours),
// lavender glyphs (the 3D panel's tint)
const PANEL_BG = Color4.create(0.05, 0.05, 0.12, 0.92)
const RIM_CYAN = Color4.create(0.35, 0.85, 0.95, 1)
const DAY_GOLD = Color4.create(1, 0.85, 0.4, 1)
const GLYPH_LAVENDER = Color4.create(0.85, 0.75, 1, 1)
const ALIEN_GREEN = Color4.create(0.7, 1, 0.78, 1) // the 3D panel's implementation-line tint

// atlas cell -> UI uvs (order per SDK: bottom-left, top-left, top-right, bottom-right;
// atlas rows count from the top, texture v grows upward — same math as glyphs.ts)
function cellUiUVs(cell: number): number[] {
  const col = cell % GRID
  const row = Math.floor(cell / GRID)
  const cs = 1 / GRID
  const left = col * cs
  const right = (col + 1) * cs
  const top = 1 - row * cs
  const bottom = 1 - (row + 1) * cs
  return [left, bottom, left, top, right, top, right, bottom]
}

// One alien symbol as a tinted sprite on a dark chip; spaces become gaps.
// The chip is a nested element: the outer entity paints the flat backing colour, the
// inner one carries the atlas texture — deliberately separate, so if a client ever
// fails to draw the texture the chips still appear (blank), which tells us the atlas
// is the problem rather than the layout.
function GlyphSprite(ch: string, index: number) {
  if (ch === ' ') return <UiEntity key={`g${index}`} uiTransform={{ width: 22, height: 58 }} />
  return (
    <UiEntity
      key={`g${index}`}
      uiTransform={{
        width: 58,
        height: 58,
        margin: { left: 3, right: 3 },
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <UiEntity
        uiTransform={{ width: 50, height: 50 }}
        uiBackground={{
          textureMode: 'stretch',
          texture: { src: ATLAS_SRC },
          uvs: cellUiUVs(cellOf(ch)),
          color: GLYPH_LAVENDER
        }}
      />
    </UiEntity>
  )
}

function OptionButton(index: number) {
  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 110,
        margin: { left: 12, right: 12 },
        borderWidth: 3,
        borderColor: RIM_CYAN,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: PANEL_BG }}
      uiText={{
        value: uiState.captions[index],
        fontSize: 30,
        color: Color4.White(),
        textAlign: 'middle-center'
      }}
      onMouseDown={() => uiPress(index)}
    />
  )
}

export const uiMenu = () => (
  <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
    {uiState.mobile ? (
      <ScreenInsetArea>
        <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
          {uiState.translation !== '' ? (
            // The translator's reading — a UI stand-in for her 3D speech bubble, in
            // roughly the same screen region the bubble occupies on desktop (upper
            // right, above where she stands in the fixed camera shot).
            <UiEntity
              uiTransform={{
                positionType: 'absolute',
                position: { top: 70, right: 40 },
                width: 620,
                // explicit height: uiText does NOT grow its element to fit multiline
                // text — sized for the longest wrapped reading (5 lines at 27px)
                height: 210,
                borderWidth: 3,
                borderColor: RIM_CYAN,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              uiBackground={{ color: PANEL_BG }}
              uiText={{ value: uiState.translation, fontSize: 27, color: Color4.White(), textAlign: 'middle-center' }}
            />
          ) : null}
          {uiState.implementation !== '' ? (
            // "THE ALIENS ..." — the consequence beat. Lands in the band the answer
            // buttons vacate the moment one is pressed, right where the player is
            // already looking.
            <UiEntity
              uiTransform={{
                positionType: 'absolute',
                position: { bottom: 60, left: 0 },
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <UiEntity
                uiTransform={{
                  width: 900,
                  // explicit height, same reason as the translation panel above
                  // (3 wrapped lines at 30px)
                  height: 160,
                  borderWidth: 3,
                  borderColor: ALIEN_GREEN,
                  padding: 16,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                uiBackground={{ color: PANEL_BG }}
                uiText={{ value: uiState.implementation, fontSize: 30, color: ALIEN_GREEN, textAlign: 'middle-center' }}
              />
            </UiEntity>
          ) : null}
          {uiState.glyphs !== '' ? (
            // The alien question + day counter, bottom-anchored just above the button
            // row (fixed band, so it doesn't jump when the buttons hide during the
            // consequence beat). Deliberately NOT top-anchored: the top edge gets
            // clipped on some clients/aspect ratios, while bottom-anchored UI is
            // proven to render on the mobile client.
            <UiEntity
              uiTransform={{
                positionType: 'absolute',
                position: { bottom: 136, left: 0 },
                width: '100%',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <UiEntity uiTransform={{ flexDirection: 'row', justifyContent: 'center' }}>
                {[...uiState.glyphs].map((ch, i) => GlyphSprite(ch, i))}
              </UiEntity>
              <Label value={uiState.day} fontSize={26} color={DAY_GOLD} uiTransform={{ height: 34, margin: { top: 2 } }} />
            </UiEntity>
          ) : null}
          {uiState.showButtons ? (
            <UiEntity
              uiTransform={{
                positionType: 'absolute',
                position: { bottom: 14, left: 0 },
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              {OptionButton(0)}
              {OptionButton(1)}
              {OptionButton(2)}
            </UiEntity>
          ) : null}
          {uiState.showRestart ? (
            <UiEntity
              uiTransform={{
                positionType: 'absolute',
                position: { bottom: 40, left: 0 },
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <UiEntity
                uiTransform={{
                  width: 520,
                  height: 140,
                  borderWidth: 4,
                  borderColor: DAY_GOLD,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                uiBackground={{ color: PANEL_BG }}
                uiText={{ value: 'RESTART', fontSize: 46, color: DAY_GOLD, textAlign: 'middle-center' }}
                onMouseDown={() => uiRestart()}
              />
            </UiEntity>
          ) : null}
        </UiEntity>
      </ScreenInsetArea>
    ) : null}
  </UiEntity>
)
