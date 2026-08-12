# Scope, Evidence and Success Criteria

Covers §11 team, §9 the six-week plan, §10 success criteria and §12 deliverables — the reality-check
act. Two rubric dimensions live here (R7 scope realism, R8 team and evidence) and one gate (G7 scope).

## Why playable evidence outranks everything written

This is the part studios most often get backwards, and it is worth quoting the industry at them:

- Kowloon Nights states the ranking outright: **"Demo > Video > Concept Art > Words"**, and is
  "generally unable to assess projects without a build".
- Raw Fury's Head of Scouting: **"no deck can save a bad build"** — and the vast majority of publishers
  will not invest in a pitch with no playable build at all.
- Chucklefish: it is "unusual now to sign based on a design document or pitch deck alone". Indie Fund
  evaluates primarily by playing. Epic MegaGrants requires being past the idea phase with a working
  prototype. Wings: the deck covers only what the demo cannot show — team, business model, comparables.
- The funnel is brutal by construction: Raw Fury sees roughly 1,500 pitches a year and signs under 1%.

Hence the program's own gradation, which belongs in §0 as a link and nowhere else as a promise:

| Evidence | Weight |
|---|---|
| Rough prototype of the core mechanic, any engine, even a web demo | **good** |
| Playable core loop in SDK7 | **great** |
| Small vertical slice live in a World | **excellent** |

One link outweighs pages of description. If nothing playable exists, the useful question is not "how do
we describe it better" but **"what is the cheapest thing that could be linked here by next week?"** —
and that thing is a Hypothesis Log row, so go make it one.

**A claim of past validation is not evidence.** "We tested it by hand", a Decision-Log line, a memory
of a playtest — these are *words* until the artifact can be opened and played right now. If the owner
claims the mechanic was validated but nothing playable is reachable, do not record it as evidence:
park *"the verb is fun"* as a hypothesis and offer the jump to `/pre-prod-proto` to rebuild it as a
greybox. **Fun first, build first** — rebuilding a mechanic the owner already knows how to build takes
days, and it converts wind into a linkable artifact.

**Pre-production is cheap on purpose.** Pre-production runs about 10–15% of a budget against
production's 60–70%; killing a bad mechanic after two weeks of prototyping costs nothing next to
discovering it six months into production. That is the entire economic argument for the spiral, and it
is worth saying to an owner who wants to skip straight to building content.

## §11 Team — hours, not credentials

Ask for hours per week as a number, per person. Hours are the input to every scope calculation below;
credentials are not. Jam games, open-call builds and mods all count as proof, and a link to one beats a
paragraph of experience.

Then coverage: code (SDK7 / TypeScript), 3D and art, design. A named gap with a plan reads as
competence. An unnamed gap gets found in week 3.

## §9 The six-week plan — do the arithmetic out loud

Program milestones are fixed: **Week 2** a functional test version of the core loop with basic
single-player and multiplayer working; **Week 6** live in their own World with the public repository
delivered.

**Scope arithmetic.** Multiply the content plan by its per-unit cost and compare it to hours × 6 weeks.
State the result even when it is ugly — especially then. A plan that needs 240 person-hours from a team
providing 180 is not an ambitious plan, it is a plan that fails in week 5, and saying so now is the
most useful thing the document does. Note that live World, mobile playtest and sign-off consume weeks
5–6 almost entirely: the buildable window is shorter than six weeks.

**Rule of three.** Anywhere content is listed — levels, minigames, items, biomes — at most three
examples. Three shows variety; ten shows unscoped ambition, and reviewers read it exactly that way.

**Exactly three cuts, and they must hurt.** "Nothing to cut" means the scope was never thought
through. A cut list is the clearest evidence in the whole document that real decisions were made — a
painless cut list is decoration. If the owner cannot find three, use constraint injection: *"half the
hours and no artist — what survives?"*

**Top risk plus fallback.** One risk, technical or design, and the plan B. Naming a risk raises
reviewer confidence; it never lowers it. A document with no risk named is read as a document whose
author has not looked.

**Live-ops cost.** If §4 picked a recurring event or a rotating daily, price it: one week of live-ops in
person-days. The sustainable shape for a one-or-two-person team is a single weekly anchor event built
from a reusable template plus an automated reset — 1–2 person-days a week at most. "New content every
week" from a tiny team is a documented burnout trap, and it is a red flag on sight.

## §10 Success criteria — write them so a future reader can check them

Three parts, and the third is the one that gets skipped:

1. **2–3 numbers watched from week 1 live.** Named, not "engagement". Good candidates: % of new players
   completing the first goal, median session length, % of sessions with a player-to-player
   interaction, % returning within 7 days.
2. **The first-session funnel as steps:** spawn → first interaction → first reward → first goal
   complete → session end. If the steps cannot be named, the drop-offs cannot be fixed.
3. **The pivot threshold.** What result after two weeks live *changes the design*, and what result means
   "this hypothesis failed". Agreeing on it before launch is what makes the later iteration decision
   fair instead of an argument — and it is the seed the parked `/live-readout` skill will read, so write
   the numbers mechanically checkable.

Attach a fix priority to each number, using the three-horizon map: D1 low → FTUE; D7 low → hooks; D30
low → social and meta.

## §12 Deliverables

Three to five bullets, each phrased as **something a player can do**. "Refactor the inventory" is a
task; "players can trade two items at a market stall" is a deliverable. Then the content and IP
declaration, listing third-party assets and their licenses — unlicensed IP anywhere, including in the
visual references, is gate G6 and it stops everything.

## What this act always parks

Scope hypotheses are cheap to test and almost never tested. Park them anyway:

- "This content takes N hours to build" — testable by building one unit and measuring, which is the
  single most useful thing a team can learn in week 1.
- Economy, progression and timer pacing — paper and arithmetic, no build needed. These must never
  survive untested to a later rung.
