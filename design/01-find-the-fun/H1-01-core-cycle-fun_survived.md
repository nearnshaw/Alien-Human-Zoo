# H1-01 · Core cycle is fun with nothing attached

- **IF/THEN:** IF the core cycle (inspect meters → read the alien's oddly-translated question →
  answer with one of the alien's own proposed options → learn the literal implementation → hear the
  human's reaction) is run with placeholder text only — no 3D, no art, no score — THEN a first-time
  player voluntarily continues for at least 5 consecutive cycles without being asked to.
- **Source section:** §3 Core Loop — the "Watch" punchline step
- **Cheapest killing test:** paper/text prototype — ~10 handwritten cards with 2–3 interpretations
  each, run on the owner and one other person; no build needed
- **Key metric:** consecutive voluntary cycles before the tester stops; < 5 = failed
- **Mobile-sensitive:** no
- **Tested on:** —
- **Parked:** 2026-08-12

## Brief

- **Criterion (external):** consecutive voluntary cycles by a first-time player — ≥5 of a 10-cycle
  deck, unprompted. Failure looks like: a first-time player stops before completing cycle 5.
  (Unmeasured at v0 — needs players the owner does not have.)
- **Kill-check (owner-testable):** playing the deck blind, the owner still wants the next question
  after cycle 5. If the inventor is bored of their own game before cycle 5, the claim dies.
- **Rung:** paper/text in chat — the claim is about the decision-punchline cycle, which exists
  entirely in text; no build can be cheaper.
- **Who tests:** the owner by hand (feel verdict); the agent dry-runs the meter math first
  (mechanical smoke only).
- **Who launches:** the agent deals questions in chat; no software to launch.
- **Real:** the cycle itself — visible meter state before each choice; ambiguous alien-proposed
  options; deterministic hidden outcomes revealed only after choosing; the human's reaction line; a
  day counter.
- **Faked:** the 3D cage and staging (one text line each), the score plaque (a text line), art,
  the translator NPC (plain shaky captions), random draw order (fixed arbitrary order).
- **Instrumented:** the day counter in the transcript; the owner's stop-point is the number.
- **Not building:** any SDK7 scene, any UI, any balancing beyond "no unavoidable death before
  cycle 3".
- **Sessions:** the owner, one pass, ~5–10 minutes.
- **Task given to the tester:** "Keep your human alive as long as you can. Stop whenever you've
  had enough."
- **Collected per session:** cycles completed before stopping; which outcomes got a
  laugh/comment; which options confused rather than amused.
- **Briefed:** 2026-08-12

## Sessions

- smoke: agent mechanical dry-run of the deck's meter math — a careless path dies on day 5
  (MOOD 0), a full 10-day survival is reachable, no unavoidable death before day 3; both verdicts
  reachable · 2026-08-12
- session 1 (owner, chat deck) · 2026-08-12 — **instrument failure, partial signal.** The chat UI
  did not show the owner the outcome reveals or the human's reaction lines; only meters +
  questions + options were seen. Owner completed all 10 cycles and reports **genuine pull** after
  cycle 5 ("questions and options were amusing"), i.e. the choose-half of the cycle pulls on its
  own. The punchline-half (Watch + Hear) went untested. Run: DAYS SURVIVED 10, final meters
  W5 A1 T5 M9.
- instrument fix before session 2: deliver the outcome log (the owner's own run: implementation +
  reaction + meter change per day) as a readable recap; session 2 judges whether the punchline
  half lands and adds replay pull. Criterion unchanged.

- session 2 (owner, reading their run's outcome log) · 2026-08-12 — punchline half judged after
  the fact: "what the aliens did" column works; human reactions occasionally good, sometimes
  forced (writing pass needed, not a mechanic problem). Owner liked questions + options overall.
  Feedback routed: translator narration → decision; intern gag → cut; deadlier deck → decision;
  multiple humans → ideas.md. Replay-pull question not directly answered — H2-01 stays parked.

## Verdict

**Verdict:** survived — kill-check held: genuine pull after cycle 5 on the question/options half
alone; punchline half read post-hoc and partially landed (owner self-test) · criterion not
measured · 2026-08-12 · tested on: paper (chat deck)

The fun claim now rests on the choose-half with direct evidence; the staged-punchline half
transfers to H1-02.
