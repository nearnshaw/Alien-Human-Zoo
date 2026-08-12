# The sGDD Section Map

The interview order, which is **not** the document order. Sections are ordered by dependency: each
answer constrains the ones below it. Write each resolved section into its numbered slot in
`shortGDD.md` immediately; the file fills in template order while you ask in this order.

Per step: **Ask** = what to put to the owner. **Good** = a resolved answer. **Smell** = an answer
that sounds resolved but is not. **Load** = the knowledge reference to read when this step begins.
**Park** = what in this section is *always* a claim rather than a decision, and therefore belongs in
the Hypothesis Log ([hypothesis-log.md](hypothesis-log.md)).

Roughly 2–5 questions per step. Past that without converging, propose a decision and ask for a
yes/no.

**On the Harvest route (1E):** fill every step from the repo first — scene code, experiment files,
`ideas.md`, `decisions.md` — and interview only the holes. The map's order still applies to the
holes; the steps filled from the repo are announced, not asked.

---

## Step A — The anchor (feeds §1 and §8)

Before the hook exists, find what this is *like*. Two comparables — the template requires exactly two
and no more. One from outside Decentraland; a second from inside is **a plus, not a requirement**
(two outside games are fine — hobbyist owners often don't know the DCL catalog yet, and an invented
Decentraland comparable is worse than an omitted one).

- **Ask:** Which game outside Decentraland is closest to what you want — and, if the owner knows the
  catalog, which Decentraland experience? For each: what worked, and — the useful half — what did
  **not**?
- **Good:** Two named, specific titles the owner has actually played, each with an honest failure.
  You research both before asking anything else, so the question already contains what you found.
- **Smell:** Fortnite / Elden Ring / "an MMO" as a comparable for a first project. A "what didn't
  work" row that is empty or flattering.
- **Leave open:** the *"what we do differently"* row. It cannot be answered before the twist exists —
  close it at Step H.

## Step B — §1 The Hook

- **Ask:** Fill in *"It's like [thing people already know], but [your one twist]."* Anchor first,
  twist second, one twist only. Then the test: could a stranger repeat it to a friend after hearing
  it once?
- **Good:** ≤2 sentences, names the anchor and exactly one strange thing. Survives being read aloud.
- **Smell:** Adjectives nobody would claim the opposite of — "immersive", "unique", "fun". Five
  twists. A genre label with "with a twist" appended and no twist named.
- **Cap:** 2 sentences. Hard.
- **Note:** familiar genre + one twist beats a novel mashup for inexperienced teams — do not penalize
  a derivative anchor, penalize a missing twist.

## Step C — §3 Core Loop

The spine. Everything below depends on it, so it is never deferred.

**Stage-aware:** at stage 1 this step resolves at *core-mechanic* level — the verb, and why it feels
good the *first* time. Park the loop questions (cycle length, session length, the 10th repetition)
as `[OPEN]` and mature the full loop table at stage 2
([stages-and-gates.md](stages-and-gates.md)) — it is not yet proven the first repetition is fun.

- **Ask:** What does the player repeatedly *do*? 3–5 steps, verbs not features. Then: how long is one
  cycle, how long is a session, and **why is the 10th repetition still fun** — what changes between
  repetitions?
- **Good:** Verbs a player would use. 30–90 s per cycle. A *named source of variability* (other
  players, randomness, rising difficulty, new combinations) for the 10th repetition.
- **Smell:** Loop steps that are systems ("the economy runs", "the leaderboard updates") rather than
  player actions. No cycle length. "It's fun because there's a lot to do."
- **Load:** [core-loop-and-ftue.md](core-loop-and-ftue.md)
- **Park:** the 10th-repetition answer is *always* `[HYPOTHESIS]` until a playtest says otherwise —
  this is the single most valuable row in the log and the cheapest to test.
- **Evidence rule applies here:** a "previously validated / tested by hand" claim surfacing in §3 is
  *words until openable* — do not record it as evidence; park *"the verb is fun"* and offer the jump
  ([scope-and-evidence.md](scope-and-evidence.md)).

## Step D — §2 First Session, written as "you"

- **Ask:** Second person, present tense, in four beats: seconds 0–10 (what do you SEE that tells you
  what to do, with nothing to read), the first minute (first action, first reward), the first ten
  minutes (first goal completed, next goal already visible), and the last thing you see before
  leaving (tomorrow's reason, shown inside session one).
- **Good:** Reads like someone describing a game they played. The spawn frame communicates the verb.
- **Smell:** UI narration ("you click the button"), a tutorial, an NPC, a sign with instructions,
  lore, or minutes 0–3 spent walking and reading.
- **Cap:** 200 words.
- **Load:** [core-loop-and-ftue.md](core-loop-and-ftue.md)
- **Park:** "80% of testers start playing within 5 seconds" is a program gate *and* a hypothesis —
  park it; it is testable with three people and a greybox.

## Step E — §4 Why Players Come Back

The section graded hardest, and the only one worth double. Do not let it be answered quickly.

- **Ask,** in this order: (4.1) complete *"a player who enjoyed Day 1 comes back on Day 2 because
  ___"* — concrete and time-anchored; (4.2) what is *different* for a Day-7 player, named as
  persistent state; (4.3) at least two return hooks from the menu, each described as it works **in
  this experience**; (4.4) the >2-week goal and how other players *see* progress toward it.
- **Good:** "Their plot finishes in 20 hours." "Sunday league reset." "Their crew races Friday
  20:00 UTC." Day-7 state that is visible to strangers — a rank, 7/20 collected, a wearable, a title.
- **Smell:** "Because it's fun." "More content." Hooks name-dropped from the menu with no mechanics
  behind them. Day-7 difference = "they have seen more levels". An invisible XP number.
- **Load:** [retention.md](retention.md) — read it before asking 4.1, not after.
- **Park:** every hook is a hypothesis about human behaviour. Park each as its own row; they are
  testable at wildly different costs, and the log is ordered by cost.

## Step F — §5 Social by Design

- **Ask:** What is *better* — not merely possible — with 2+ players? Then the three tests: the
  quiet-hour test (alone at a dead hour: what keeps the world alive, and how do they end up
  interacting with someone **by design, not luck**), the bystander test (what does watching teach),
  and bring-a-friend (what makes inviting someone pay off). Then: the one moment a player would clip.
- **Good:** Group-scaled rewards, multiplayer-only moments, an audience, async traces, 2-second
  social verbs a stranger can use on you. A quiet-hour answer that survives 2 concurrent players.
- **Smell:** "There's chat." "They can team up if they want." Parallel solo play in one room. A design
  that assumes a full world.
- **Load:** [social-design.md](social-design.md)
- **Loop back:** if Step E picked a crew or team hook, this section has to make it real — and if this
  section produced a strong social obligation, go back and check it is claimed in 4.3.

## Step G — §6 Mobile-First

- **Ask:** Copy the verbs from §3 and map every one to touch. Then: how is the UI small-screen-first?
  What is the single biggest performance risk and the plan for it? Any desktop-only dependency, and
  how does the design let that feature switch on later without a redesign?
- **Good:** A row per verb with a real touch gesture. One named perf risk (asset weight, physics,
  effects) with a plan. Honest desktop-only dependencies with a switch-on path.
- **Smell:** "We'll adapt it later." Mouse-precision aiming, keyboard combos, hover states. Perf
  unmentioned.
- **Load:** [mobile-first.md](mobile-first.md)
- **Park:** most input and performance claims are mobile-sensitive — mark them so in the log
  (`Mobile-sensitive: yes`). Their verdicts still close terminal on desktop; the index renders
  *… — mobile pending* until the mobile rung is settled — the QR pass costs minutes and is offered
  at core-loop stage close.

## Step H — §7 World, Look & Story, and closing §8

- **Ask:** the world in **2 sentences** — really two. Then 2–3 visual references, ideally existing
  Decentraland scenes. Then the required image: a sketch, a greybox screenshot, or a map of the
  space. Finally close §8's *"what we do differently"* row now that the twist exists, and re-read §1
  against it.
- **Good:** Story that changes what the player *does*. References that are lookable-up. A blockout
  screenshot.
- **Smell:** Lore walls — the single most reported pitch mistake industry-wide. Polished concept art
  in place of a space plan. "We do everything better."
- **Cap:** 2 sentences of story. No exceptions; if the story does not fit, it is not load-bearing.

## Step I — §11 Team

Asked before scope, because scope is arithmetic over hours.

- **Ask:** Who is on the team, doing what, for how many hours per week, with links to anything they
  have shipped — jams, open calls and mods all count. Then the coverage check: code (SDK7 /
  TypeScript), 3D and art, design. Name gaps and the plan.
- **Good:** Hours stated as numbers. Links. An acknowledged gap with a plan.
- **Smell:** Anonymous ambition. No hours. No links. Unmentioned gaps.
- **Load:** [scope-and-evidence.md](scope-and-evidence.md)

## Step J — §9 Six-Week Plan

- **Ask:** What is playable at each milestone, against the fixed program dates — **Week 2** a
  functional core-loop test version (basic single-player and multiplayer), **Week 6** live in their
  own World with a public repo. Then exactly **3** things explicitly not being built. Then the top
  risk and its fallback.
- **Good:** A plan whose content plan × per-unit cost fits the stated hours — show the arithmetic out
  loud, especially when it is ugly. Cuts that visibly hurt. A named risk with a plan B.
- **Smell:** "Nothing to cut." Trivial cuts. A wish list per week. Weekly-content promises from a
  1–2 person team.
- **Non-goals — ask next to the cuts, optional:** any standing `never X, because Y` lines (0–3). A
  *cut* is wanted-and-deferred — it has an expiry, v2 may return it, and it proves scope realism. A
  *non-goal* is identity through negation — no expiry, a pillar with a minus sign. A non-goal is
  legal only if it has already **refused something concrete** — an idea, a mechanic, a comparable;
  a generic "not boring" refuses nothing. Never press for them: an empty optional slot is itself
  informative. The template slot holds the current truth; `design/decisions.md` holds the history
  and the why.
- **Load:** [scope-and-evidence.md](scope-and-evidence.md)

## Step K — §10 Success Criteria

- **Ask:** The 2–3 numbers watched from week 1 live. The first-session funnel as named steps (spawn →
  first interaction → first reward → first goal → session end). The **pivot threshold**: what result
  after two weeks live changes the design, and what result means "this hypothesis failed".
- **Good:** Named funnel steps, a number, and a fix priority attached (D1 low → FTUE; D7 low →
  hooks).
- **Smell:** "We'll gather feedback." Metrics with no threshold.
- **Note:** this section is the seed of the parked `/live-readout` skill — write the thresholds so a
  future reader can check them mechanically.

## Step L — §12 Deliverables & Declaration

- **Ask:** 3–5 deliverables phrased as things a *player can do*, not internal tasks. Then the content
  and IP declaration, listing third-party assets and licenses.
- **Smell:** Deliverables that are tasks ("refactor the inventory"). Unlicensed IP anywhere in the
  concept or the references — that is gate G6 and it stops everything.

## Step M — §0 TL;DR, and the header table

Filled last, read first.

- **Ask:** nothing new. Compose it from what is already decided: one-line concept, team and total
  hours/week, current status, what a player can do in the World at end of Week 6, requested round.
- **Non-negotiable:** if anything playable exists, its **link goes here**. Playable evidence
  outweighs pages of description, weighed in this order: core-mechanic prototype (*good*) → playable
  core loop in SDK7 (*great*) → vertical slice live in a World (*excellent*).
- **A claim is not evidence.** A Decision-Log line or a remembered hand-test counts as words until
  the thing can be opened and played now. Nothing reachable → no link in §0: park the fun claim as a
  hypothesis and offer the jump ([scope-and-evidence.md](scope-and-evidence.md)).
- Fill the header table too: experience name, studio, date, contact.

---

## Appendix — the Hypothesis Log

Not interviewed. It is **generated**, at gates, by globbing the stage folders — see
[hypothesis-log.md](hypothesis-log.md). Never hand-maintain the status column.
