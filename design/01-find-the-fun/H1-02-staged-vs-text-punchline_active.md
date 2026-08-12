# H1-02 · Physically staged consequence beats text-only

- **IF/THEN:** IF the same consequence (e.g. the 100 km/h turbine) is shown once as a physical
  change in the greybox cage and once as text-only UI, THEN the staged version gets the stronger
  reaction — and it reads as part of the loop, not as a cutscene interrupting it.
- **Source section:** §3 Core Loop — hybrid staging decision ("Watch" step)
- **Cheapest killing test:** desktop Explorer greybox — 2–3 consequences built with primitive
  props, side-by-side against the text version, owner self-test
- **Key metric:** owner's side-by-side judgment per consequence (staged funnier: yes/no); staged
  loses or feels like a cutscene = failed
- **Mobile-sensitive:** no
- **Tested on:** —
- **Parked:** 2026-08-12

## Brief

- **Criterion (external):** per staged consequence, first-time players react visibly more (laugh,
  comment, screenshot) than to its text-only twin — 3 of 4 staged consequences win their pair.
  Failure looks like: staged consequences win no more often than text, or read as cutscenes that
  interrupt the loop. (Unmeasured at v0 — needs players the owner does not have.)
- **Kill-check (owner-testable):** playing the full cycle in-world, the owner judges the staged
  consequences funnier than their text-only versions, and they feel like part of the turn, not a
  cutscene. If staging adds nothing for its own inventor, it dies.
- **Rung:** desktop Explorer via Creator Hub preview — the claim is about physical staging in 3D;
  no cheaper rung can show it.
- **Who tests:** the owner by hand (feel verdict); the agent smoke-checks the build first
  (compile + logic dry-run; no Explorer MCP available this session).
- **Who launches:** the owner via Creator Hub preview.
- **Real:** the full cycle in-world — cage, meters, glyph question screen with translator line,
  2–3 answer buttons, deterministic outcomes, human reaction lines, day counter, death states
  (including instant deaths), run restart. Four consequences physically staged: turbine wind, hot
  vapor, crushed-ice snowfall, predator "companion". The rest resolve as text.
- **Faked:** all art (primitives + text only), the human (placeholder shape), the translator (a
  text line, not an NPC), sound, score persistence, multiplayer.
- **Instrumented:** owner judgment per staged/text pair; day counter on the plaque.
- **Not building:** models or animations, UI polish, sound, the multiple-humans idea, leaderboard,
  any second room.
- **Sessions:** the owner, 1–2 runs, ~10 minutes.
- **Task given to the tester:** "Keep your human alive as long as you can. Stop whenever you've
  had enough."
- **Collected per session:** for each staged consequence — funnier than text yes/no, cutscene-feel
  yes/no; days survived; where the loop dragged.
- **Briefed:** 2026-08-12

## Sessions

- smoke: agent dry-run — `npm run build` compiles clean (sdk-commands 7.25.0, type check OK); logic
  traced: 10-card shuffled deck, 4 staged consequences (vapor, turbine, snow, predator) vs
  text-only rest, 2 instant deaths, meter deaths at 0, restart loop. The implementation *text*
  always prints even for staged outcomes, so each staged consequence is judged as "does staging add
  on top of the text" — a clean within-run comparison. No Explorer MCP this session; in-world smoke
  falls to the owner's first minute. Build lives in the scene itself (`src/game.ts`, `src/deck.ts`),
  composite untouched (scene stays Creator-Hub-safe) · 2026-08-12
- validation session (agent via Explorer MCP, screenshots) · 2026-08-12 — owner reported unplayable
  text overlap; root causes found and fixed in-world: TextShape fontSize units ~4× larger than the
  skill's guidance implied (usable range ≈1.5–3.5, not 16–32); several glyphs rendered as tofu
  (kept to ▲◆●◇■▼+ASCII now); billboarded screen texts clipped into the fixed panel (screen texts
  are now fixed wall text); implementation line moved into the translator's band (never
  simultaneous); resolution window widened 3.4s → 6.0s (was unreadable-fast); meters cleared on
  game over; hidden plaque kept a live collider (phantom RESTART hover) — collider now toggles
  with visibility. Verified by screenshot/logs: full turn cycle with correct meter math, instant
  deaths (VACUUM, COMPANION), meter death, death plaque + restart, shuffle. Not yet visually
  confirmed up close: turbine spin, vapor/snow staging. Cosmetic: one engine warning about the
  collider-less hidden plaque. Owner began unprompted self-play during validation (3 runs, deaths
  on days 5/2/2/3) — the feel session is effectively in flight.
- build evolution between passes (owner-directed, tone approved) · 2026-08-12 — primitive human
  replaced by a naked male AvatarShape; translator embodied as a female AvatarShape in generic
  base wearables (f_-prefixed URNs required); emote reactions added (getHit/handsair/shrug per
  outcome, knockOut/headexplode deaths, translator shrug/dontsee); pacing changed to 3 rounds per
  day; deck now reshuffles on exhaustion (endless run, win plaque removed). Verified by
  screenshot: avatars render, handsair fired on a net-positive turn, DAY·round display correct.
  Criterion unchanged.

## Verdict
<!-- owned by /pre-prod-proto -->
