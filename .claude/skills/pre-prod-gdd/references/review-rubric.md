# The Review Rubric — Used Openly

Vendored from the Creator Success internal reviewer guide (`proposal-review-checklist.md`). Keep the
two in sync; if they ever disagree, the program's own file wins.

**Why the skill shows the exam paper.** The rubric is not a secret. It encodes what makes an
experience survive on this platform, and aligning the studio's incentives with it is the point of the
program. Two things stop it from degrading into rubric cosplay, and you must keep both alive:

- the rubric itself scores **integration, not naming** — R4 demands hooks explained "in their design";
- the Hypothesis Log makes every claim **falsifiable**, so rubric-words with no testable row show up
  as empty rows.

Use it three ways: **G1–G8 as an entry self-check in phase 0**, **the probe questions as ready-made
interview questions**, and **R1–R8 as the acceptance bar in phase 3** — never as a score to optimize.

---

## Gates — any "yes" stops everything

Structural problems that no amount of polish fixes. Run these in phase 0 over whatever already
exists, and report a hit immediately rather than interviewing around it.

**A gate can burn in two ways, and only one of them stops anything.** *Structural*: the design
refuses the requirement ("players wait in a queue for their turn" — that *is* the design). *By
absence*: the section was simply never asked — on hobbyist documents in Adapt/Solidify, G4 and G5
burn by absence almost every time, and closing them **is the interview**, not a verdict on it.
Report absences as the interview's targets, structural hits as blockers. Stage matters too: G4
(retention) and G5 (social) judge the *submitted* proposal — their sections become real at stage 2
([stages-and-gates.md](stages-and-gates.md)); at stage 1 record the intention and move on.

| # | Gate |
|---|---|
| G1 | No identifiable core loop — a theme, a story or a feature list, but never what the player repeatedly *does* |
| G2 | Starting requires reading, a tutorial or an NPC explanation (violates the 5–10 second rule) |
| G3 | Desktop-only interaction model with no touch plan — mouse-precision aiming, keyboard combos, hover states |
| G4 | Retention missing, or answered with "the game is fun / there will be more content" |
| G5 | Social absent by design — pure single-player, gameplay invisible to bystanders, no reason for a second player to exist |
| G6 | Unlicensed third-party IP anywhere in the concept or the references |
| G7 | Scope obviously exceeds 6 weeks × stated hours — "MMO", "10 minigames", progression + housing + pets in v1 |
| G8 | The design depends on waiting or queues as a core element |

## Rubric — 0 / 1 / 2 per dimension, retention counts double, max 18

| # | Dimension | 2 looks like | 0 looks like |
|---|---|---|---|
| R1 | **Hook** | Anchor + one twist; repeatable from memory | Generic, or five twists, or pure adjectives |
| R2 | **First 10 seconds / FTUE** | The spawn camera frame communicates the verb; first reward inside a minute; tomorrow's hook shown before session end | "A sign/NPC/tutorial explains…"; first minutes are walking and reading |
| R3 | **Core loop** | 3–5 verbs, 30–90 s cycle, credible answer for repetition 10 with the variability source named | Feature list; steps are systems not actions; no cycle length |
| R4 | **Retention hypothesis (×2)** | Day-2 sentence concrete and time-anchored; ≥2 real hooks explained *in their design*; Day-7 player has named persistent state | "Because it's fun"; hooks name-dropped; Day-7 = "saw more content" |
| R5 | **Social design** | Better-with-others is designed — group-scaled rewards, multiplayer-only moments; quiet-hour answered; gameplay legible to bystanders | Social optional — "there's chat", "they can team up if they want" = solo by default |
| R6 | **Mobile readiness** | Every core-loop verb mapped to touch; UI small-screen-first; biggest perf risk named with a plan | Mobile as afterthought; perf unmentioned |
| R7 | **Scope realism** | Week plan matches stated hours; 3 cuts that genuinely hurt; risk + fallback named | No cuts or trivial cuts; week plan is a wish list; no risk named |
| R8 | **Team & evidence** | Hours/week stated; links to anything playable (jams and open calls count); skill gaps acknowledged with a plan | Anonymous ambition; no links; no hours; gaps unmentioned |

| Total | Outcome |
|---|---|
| 14–18 | Fund v1, possibly with notes for Week 1 |
| 9–13 | One revision round — targeted probe questions on the 0–1 dimensions |
| < 9 | Decline for now; redirect to open calls / community builds |

**Hard rule: R4 = 0 → not fundable at any total.** Everything else can be coached during the cycle; a
missing retention theory cannot.

When you report the score in phase 3, name every 0–1 dimension, say what would raise it, and
distinguish **what is blocked on writing** from **what is blocked on a playtest** — the second kind is
a Hypothesis Log row, not a rewrite.

## Probe questions — reuse them verbatim as interview questions

Each maps to the dimension in brackets, and carries what a good and a bad answer sound like.

1. **"What does the player repeatedly do, how long is one cycle, and why is the 10th repetition still fun?"** (R3) — *good:* one verb, 30–90 s, a variability source. *Bad:* features, story, "exploring".
2. **"A new player spawns in. What in the first camera frame tells them what to do — without text?"** (R2) — *good:* one dominant affordance, or other players visibly mid-loop. *Bad:* anything starting with "a tutorial…".
3. **"Decentraland can't send push notifications. What exactly will a Day-1 player *remember*, or *who* will call them back on Day 2?"** (R4) — *good:* "their plot finishes in 20 h", "Sunday reset", "crew race Friday". *Bad:* "the fun", "new content".
4. **"What's different for a Day-7 player vs Day-1?"** (R4) — *good:* named persistent state visible to others. *Bad:* "they've seen more levels".
5. **"How does a player who arrives alone end up interacting with someone — by design, not luck?"** (R5) — *good:* spawn near activity, shared objectives, 2-second social verbs usable on strangers, async traces. *Bad:* "there's a chat".
6. **"What do two friends do here that they can't do alone, and what rewards bringing a friend?"** (R5) — *good:* multiplayer-*better* activities plus an invite or gift mechanic. *Bad:* parallel solo play in one room.
7. **"What does your world look like at 4 a.m. with 2 concurrent players? How do you concentrate liveness?"** (R5) — *good:* scheduled peak windows, async traces, small spaces that feel full. *Bad:* silence.
8. **"Show one week of your live-ops calendar and its cost in person-days."** (R7) — *good:* one weekly anchor event from a reusable template, automated leaderboard reset, ≤1–2 person-days/week. *Bad:* "new content every week" from a 1–2 person team.
9. **"Which numbers will you watch in week 1, and what threshold makes you change the design?"** (R7/R4) — *good:* named funnel steps, a threshold, a fix priority. *Bad:* "we'll gather feedback".
10. **"What takes more than two weeks to achieve, and how do other players *see* progress toward it?"** (R4) — *good:* visible status — wearable, title, board. *Bad:* invisible XP, or an endless grind.

## Red flags — fast pattern list

Lore walls (>50% story) · feature lists instead of player experience · "they return because it's
fun/beautiful" · optional social ("they *can* play together") · weekly-content promises from a tiny
team · delusional comparables · no answer to low concurrency · **polished document, no playable
evidence** · everything "will be added later" · a design leaning on push notifications the platform
does not have.

## Green flags

Concrete time-anchored hooks integrated into the design · the quiet-hour question answered before
being asked · honest `TBD:`s with a plan · a cut list that visibly hurt · non-goals present, each
with a visible cost — every `never X, because Y` names something concrete it refused · playable
evidence linked in §0 · `survived` rows in the Hypothesis Log — the expected v0 evidence state, not
an incomplete `validated` · small-league and weekly-reset thinking · rewards that live on the
avatar · second-person first-session text that reads like a real game.

## Calibration — read before scoring, and before promising anything

- **20% D7 is a top-decile target.** Industry median D7 for mobile F2P across all games is ~4–8%; a
  *good* game reaches 13–16%; 20%+ matches top-grossing midcore and the "Excellent" tier on Roblox.
  Genres with natural pull: sims, collection games, social-progression designs. Arcade one-shot
  session games almost never get there — push those toward a meta layer and social obligations, or
  reset expectations out loud and early.
- **D1 is bought with fun, D7 with appointments, D30 with friends.** Map weaknesses to fixes: weak
  FTUE → a D1 problem; no hooks → a D7 problem; no social or meta → a D30 problem.
- **Social ties are the strongest late-retention force in the literature.** A proposal that nails
  social design earns benefit of the doubt elsewhere.
- **Churn is socially contagious** — teams amplify retention *and* collapse together. Prefer small,
  re-formable groups over one big fragile community.
- **Familiar genre + one twist beats novelty** for inexperienced teams. Do not penalize a derivative
  anchor; penalize a missing twist.
