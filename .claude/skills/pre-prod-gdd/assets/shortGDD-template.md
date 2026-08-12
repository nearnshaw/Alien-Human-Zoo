<!--
  Vendored copy of the Creator Success `experience-proposal-template.md`. Identical to it — keep the
  two in sync; the program's file wins any disagreement. The only skill-side addition is the
  "generated table" note in Appendix A.

  Strip this comment when creating shortGDD.md.
-->

# Decentraland Experience Proposal

**Creator Success Program — Proposal Template (short GDD)**

| | |
|---|---|
| Experience name | |
| Studio / team name | |
| Date | |
| Contact (Discord + email) | |

---

## Before you start (read this, then delete it)

- This document should take you **a few focused hours**, not weeks. If a section is hard to answer, that section is telling you the design needs more thought. That is the point of the template.
- **Respect the word caps.** Short writing forces clear thinking. We can always ask for more detail later.
- **A rough sketch or greybox screenshot beats polished concept art.** We fund games, not documents. Do not spend time making this document pretty.
- **Anything playable is a bonus — and the more playable, the bigger the bonus.** You do not need one to apply, but it is the strongest signal you can send, in this order: a rough prototype of your core mechanic (any engine, even a web demo) is *good*; a playable core loop in SDK7 is *great*; a small vertical slice live in a World is *excellent*. One link like this outweighs pages of description — put it in the TL;DR.
- Write simple, direct English (B2 level). Your experience must also work for non-English speakers, so practice here.
- If you don't know something yet, write `TBD:` and how you plan to find out. **An honest gap builds more trust than a vague claim.** If it is something only a playtest can settle, park it in **Appendix A — Hypothesis Log** with the cheapest test that could prove you wrong.
- Every section starts with guidance in *italics*. Replace the guidance with your answers.
- Before writing, read **How the Creator Success Program Works** and **What Makes a Great Experience**. This template assumes you know both.

What we fund: **social-first, replayable, mobile-ready experiences with clear progression.** Program goal: **more than 20% of new players return within 7 days (D7 retention).**

---

## 0. TL;DR

*Fill this table last, after everything else. A reviewer reads it first.*

| | |
|---|---|
| **One-line concept** | |
| **Team & total hours/week** | e.g. "2 people, ~30h/week combined" |
| **Current status** | idea / sketches / greybox / core-mechanic prototype / playable core loop / vertical slice in a World — **link anything playable; playable evidence is the strongest plus in review** |
| **Live at end of Week 6** | one sentence: what a player can do in your World |
| **Requested round** | v1 |

---

## 1. The Hook

*Maximum 2 sentences. Use this shape:*

> **"It's like [a game or experience people already know], but [your one twist]."**

*Anchor first, twist second. One twist, not five — data shows familiar-genre-plus-one-twist beats wild genre mashups. Test: could a stranger repeat your hook to a friend after hearing it once?*

*Avoid: adjectives nobody would ever claim the opposite of ("immersive", "unique", "fun") — they carry no information.*

[Your hook]

---

## 2. First Session — written as "you"

*Maximum 200 words. Second person, present tense: "You spawn at… you see… you grab…". This is the fastest way to find out whether your game has a real core loop — for you and for us.*

*Your text must cover:*

- ***Seconds 0–10:** what do you SEE at spawn that tells you what to do — without reading anything? (Program gate: 80% of testers must start playing within 5 seconds.)*
- ***First minute:** your first action and your first reward.*
- ***First 10 minutes:** the first goal you complete — and the next goal you can already see.*
- ***The last thing you see before leaving:** the thing that will bring you back tomorrow. Show the hook inside the first session.*

*Rules: no UI narration ("you click the button"), no lore, no tutorial NPC, no signs with instructions. The scene itself is the tutorial. Other players doing the loop are the best instructions of all.*

[Your first-session description]

---

## 3. Core Loop

*The core loop is the cycle of actions a player repeats. Verbs, not features. 3–5 steps.*

| # | Step (verb) | What the player does | Why do it again? |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

*Then answer:*

- **One loop takes:** ___ (aim for 30–90 seconds)
- **One session lasts:** ___ minutes (mobile sessions are short; several short sessions beat one long one)
- **Why is the 10th repetition still fun?** What changes between repetitions — other players, randomness, rising difficulty, new combinations?

[Your answers]

---

## 4. Why Players Come Back

*This is the section we grade hardest.*

*Hard fact about the platform: **Decentraland cannot send push notifications.** Nothing will remind a player that your experience exists. The reason to return must live in the player's own memory ("my crop is ready at 6pm", "the leaderboard resets Sunday") or in their friends ("my crew races every Friday").*

*A simple way to think about it: **Day 1 is bought with fun, Day 7 with appointments, Day 30 with friends.***

### 4.1 The Day-2 sentence

*Complete it. Be concrete and time-anchored.*

> "A player who enjoyed Day 1 comes back on Day 2 because ______."

*Bad answer: "because the game is fun / there is more content." Content gets consumed once; appointments and people bring players back.*

### 4.2 The Day-7 player

*What is different for a player on Day 7 compared to Day 1? Name the persistent state they have built: a rank, a collection at 7/20, a team, an upgraded thing, a cosmetic other players can see. If the only difference is "they have seen more levels", the design churns by default.*

[Your answer]

### 4.3 Your return hooks — pick at least two

*Choose from this menu (or add your own) and describe exactly how each works in your experience:*

| Hook | Why it works without push notifications |
|---|---|
| **Appointment timer** — something finishes, respawns or unlocks at a known future time | The player's memory is the notification ("ready at 18:00") |
| **Daily goals + streak** — rotating daily tasks, escalating reward track | Loss aversion; use milestone recovery, never punishing resets |
| **Weekly leaderboard reset / small leagues** — rank inside small groups, fresh start weekly | Near-zero content cost; automatic weekly event; deadline drives a surge |
| **Collection** — visible x/N progress toward a displayable reward | An unfinished set feels unfinished (proven effect); evergreen once shipped |
| **Recurring scheduled event** — e.g. every Friday 20:00 UTC | The event calendar is your real notification system (in-world + Discord) |
| **Team / crew obligation** — small persistent groups with shared goals | "My crew expects me" is the strongest known retention force |
| **Season track** — a free time-limited progress track, 6–8 weeks | Deadline + comeback moment at each new season; align with the program's cycles |
| **Async traces** — things players leave behind that others discover later | The world feels alive even at quiet hours; zero ongoing cost |

[Hook 1: name + how it works in your experience]

[Hook 2: name + how it works in your experience]

### 4.4 The long-term goal

*What takes more than two weeks to achieve — and how do OTHER players see someone's progress toward it? (An invisible XP number motivates nobody in a social world. A wearable, a title, a spot on a board — those do.)*

[Your answer]

---

## 5. Social by Design

*Program requirement: playable alone, better with others. "Better with others" must be designed, not hoped for.*

- **What is better — not just possible — when 2+ players are present?** (group-scaled rewards, multiplayer-only moments, competition, an audience)

  [Your answer]

- **The quiet-hour test.** A player arrives alone at a low-traffic hour. What do they see and do so the world still feels alive — and how do they end up interacting with another player *by design, not by luck*? (spawn placement near activity, traces left by earlier players, social verbs a stranger can use on you in 2 seconds)

  [Your answer]

- **The bystander test.** What does someone understand by *watching* another player play? Visible gameplay is both your marketing and your tutorial.

  [Your answer]

- **Bring-a-friend.** What in the game makes a player invite someone? (invitation as gameplay, "both earn double", things you can only unlock together)

  [Your answer]

- **The memorable moment.** Describe one specific moment a player would screenshot or clip and share.

  [Your answer]

---

## 6. Mobile-First

*Mobile is not a port target — it is the primary design target. Build for touch first, scale UI up to desktop.*

**Every core-loop verb on touch.** Copy your verbs from Section 3:

| Core-loop verb | How it works with touch controls |
|---|---|
| | |
| | |

**UI plan.** *One or two sentences: how is your UI designed for a small screen first?*

[Your answer]

**Performance.** *Target: 60fps on recommended desktop hardware / 30fps on minimum hardware, with up to 20 players in the scene. What is your single biggest performance risk (asset weight? physics? effects?) and your plan for it?*

[Your answer]

**Desktop-only dependencies.** *Do you rely on any feature not yet available on mobile? (Check the Desktop vs Mobile Feature Gap tracker.) If yes: how is the design built so the feature can switch on later without a redesign?*

[Your answer]

---

## 7. World, Look & Story

**Story / world — maximum 2 sentences.** *Yes, really. Reviewers across the industry name "walls of lore" as the #1 pitch mistake. Story matters only where it changes what the player does.*

[Your 2 sentences]

**Visual direction.** *Your experience must be recognizable as Decentraland: stylized PBR with baked lighting, quality consistent with Genesis Plaza, while keeping its own identity. Name 2–3 references — existing Decentraland scenes or images.*

[Your references]

**Required: at least one image.** *A rough sketch, a blockout/greybox screenshot, or a map of the space. No polish needed — we want to see the space and the activity, not your art budget.*

[Image]

---

## 8. Comparables — exactly two

*One from outside Decentraland, and — if you know one — one from inside. A Decentraland comparable is a plus, not a requirement: two outside games are fine. "What didn't work" is where the insight lives — be honest.*

| | Comparable A — a Decentraland experience, if you know one: ___ | Comparable B — a game outside Decentraland: ___ |
|---|---|---|
| What worked | | |
| What didn't work | | |
| What we do differently | | |

---

## 9. Six-Week Plan (v1 scope)

*Program milestones are fixed: **Week 2** — functional test version of the core loop (basic single-player and multiplayer working). **Week 6** — live in your own World, public repository delivered.*

| Week | What is playable / done |
|---|---|
| 1 — Prototype definition | |
| 2 — Core interaction test version | |
| 3 — Core systems refinement | |
| 4 — Playable prototype, final design direction (mobile playtest) | |
| 5–6 — Live testing and sign-off | |

**Not building in v1 — list exactly 3 things you are explicitly cutting.** *This is a realism check. "Nothing to cut" means the scope hasn't been thought through. Good cuts hurt a little.*

1.
2.
3.

**Standing non-goals — optional, 0–3 lines, each as `never X, because Y`.** *A cut is wanted-and-deferred — v2 may bring it back. A non-goal is identity through negation — "never a rage game, so death never rolls back progress" — no expiry, a pillar with a minus sign. Write one only if it has already refused something concrete: an idea, a mechanic, a comparable. A generic line ("never boring") refuses nothing. Leaving this empty is a legitimate answer.*

-

**Top risk + fallback.** *The one thing most likely to go wrong (technical or design), and your plan B. Naming risks raises our confidence in you — it never lowers it.*

[Your answer]

*Rule of three: anywhere you list content (levels, minigames, items), give at most 3 examples. Three shows variety; ten shows unscoped ambition.*

---

## 10. Success Criteria — what you will measure

*Progression to the v2 round depends on retention evidence. Decide now what evidence you expect to see.*

- **The 2–3 numbers you will watch from Week 1 of being live** *(examples: % of new players who complete the first goal; median session length; % of sessions where the player interacts with another player; % returning within 7 days)*

  [Your numbers]

- **Your first-session funnel** *(the steps you will instrument: spawn → first interaction → first reward → first goal complete → session end). If you can't name the steps, you can't fix the drop-offs.*

  [Your funnel]

- **Your pivot threshold.** *What result after 2 weeks live would make you change the design? What result would make you say "this hypothesis failed"? Agreeing on this now makes iteration decisions easy and fair.*

  [Your answer]

---

## 11. Team

*Hours per week matter more than credentials. Jam games, open call builds and mods all count as proof.*

| Person (name/handle) | Role in this project | Hours/week | Links to past work |
|---|---|---|---|
| | | | |
| | | | |

**Coverage check:** *who covers code (SDK7 / TypeScript), 3D & art, and design? Name any gap and your plan for it.*

[Your answer]

---

## 12. Deliverables & Declaration

**With the v1 round (6 weeks) we will deliver:** *(3–5 concrete bullets — things a player can do, not internal tasks)*

-
-
-

**Content & IP declaration.** *Confirm that all assets are original, properly licensed, or from open sources, and comply with Decentraland's Content Policy. List any third-party assets and their licenses.*

[Your declaration]

---

## Before you submit — self-check

- [ ] A stranger could repeat my hook after hearing it once
- [ ] The first 10 seconds need no reading, no tutorial, no NPC
- [ ] My Day-2 sentence names a concrete, time-anchored reason — not "it's fun"
- [ ] I chose at least 2 return hooks and explained how each works here
- [ ] I answered the quiet-hour test (world alive at low traffic)
- [ ] Every core-loop verb has a touch mapping
- [ ] My story section is 2 sentences or less
- [ ] I listed exactly 3 things I am NOT building
- [ ] There is at least one image (sketch/greybox is fine)
- [ ] All guidance text in italics is deleted

*What happens next: the Creator Success team reviews your proposal, may invite you to a short call, and responds with a decision or targeted questions. You get feedback either way.*

---

## Appendix A — Hypothesis Log

*Some of what you wrote above is a **decision** ("one loop takes 45 seconds"). The rest is a **claim** about how players will behave ("the 10th repetition is still fun", "they come back for the Sunday reset"). Claims belong here, written so that a test could prove them wrong.*

*This is a feature, not an admission. A claim with a test plan is the strongest thing in a proposal; a claim without one is the weakest. Reviewers read this table as evidence that you know which parts of your design are still unknown.*

**How to fill one row:**

- **IF / THEN** — falsifiable, in one sentence: *"IF the drop cycle is 45s, THEN 4 of 5 first-time players complete three cycles without being told what to do."* If you cannot describe what failure looks like, it is not a hypothesis yet — write it as `TBD:` in the section instead.
- **Source section** — which section above makes the claim, so a result knows what to go back and rewrite.
- **Cheapest killing test** — the least expensive thing that could prove it wrong: paper or arithmetic (no build needed) → desktop Explorer (the Creator Hub default — a greybox is minutes, not days) → mobile. Order the table by this column. Never spend an expensive test on a question a cheap one could answer.
- **Status** — `parked` (written down, not started) · `active` (test in flight) · `validated` (measured and held) · `survived` (you tested it yourself and the kill-check held; the full criterion was not measured — the expected v0 state) · `failed` (a result, not a mistake — keep it) · `deferred` (skipped on purpose, kept visible).
- **Tested on** — `desktop` / `mobile`. A touch-input or performance claim that only saw desktop stays *mobile pending* — the phone check costs minutes (Creator Hub → the dropdown next to Preview → Show QR Code for Mobile), so run it before you submit if you can.

*This table is **generated** from the experiment files in `design/<stage>/` — status comes from each filename, verdicts from inside the files. Do not edit the status column by hand: rename the file and regenerate.*

| ID | IF / THEN (falsifiable) | Source section | Cheapest killing test | Status | Verdict / date | Tested on |
|---|---|---|---|---|---|---|
| H1-01 | | | | parked | | |
| | | | | | | |
