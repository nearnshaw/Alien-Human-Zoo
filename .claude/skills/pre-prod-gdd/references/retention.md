# Retention — The Section Graded Double

Load this **before** asking §4.1, so the first question already carries a benchmark and a pattern.

## The platform fact everything follows from

**Decentraland cannot send push notifications.** Nothing will remind a player this experience exists.
So the reason to return must live in exactly one of two places:

1. **the player's own memory** — "my crop is ready at 6pm", "the league resets Sunday";
2. **their friends** — "my crew races every Friday".

Any third answer is a wish. Run the no-push test over every hook: assume no reminder ever fires. What
survives is a hook.

## The three-horizon model

**Day 1 is bought with fun, Day 7 with appointments, Day 30 with friends.** This maps weaknesses to
fixes with no guesswork:

| Symptom | Real problem | Where to fix it |
|---|---|---|
| Players do not finish session one | D1 — the experience is not fun *yet* | §2 FTUE, §3 loop |
| They enjoy it and never come back | D7 — nothing is scheduled | §4.3 hooks |
| They return for a fortnight then drift | D30 — no people, no meta | §5 social, §4.4 long-term goal |

**Benchmarks, so nobody promises 40%.** Industry median D7 for mobile F2P across all games is ~4–8%.
A *good* game does 13–16%. The program's 20% target is top-decile — it matches top-grossing midcore
and Roblox's "Excellent" tier. Sims, collection games and social-progression designs have natural
pull toward it; arcade one-shot session games almost never get there. If the design is the latter,
say so early and push toward a meta layer plus social obligations rather than letting the number sit
unchallenged in §10.

## 4.1 — The Day-2 sentence

*"A player who enjoyed Day 1 comes back on Day 2 because ___."*

The answer must be **concrete and time-anchored**. "Because it's fun" and "because there's more
content" both fail for the same reason: content is consumed once, and fun is what got them to Day 1,
not what gets them back. An appointment is a different kind of object — it exists in the player's
calendar, not in the build.

Good answers name a *when*: "their plot finishes in 20 hours", "the league resets Sunday 00:00 UTC",
"their crew races Friday at 20:00".

## 4.2 — The Day-7 player

Ask what is **different** for them, and demand persistent state with a name: a rank, a collection at
7/20, a crew, an upgraded thing, a cosmetic other players can see. "They have seen more levels"
means the design churns by default — every player is on a conveyor toward the end of the content.

The multiplier: state that is **visible to strangers**. An invisible XP number motivates nobody in a
social world; a wearable, a title or a spot on a board does the motivating for free, and doubles as
marketing to everyone who sees it.

## 4.3 — The hooks, with what each one actually costs

At least two, each explained *as it works in this experience*. Naming them is worth zero — the rubric
scores integration.

| Hook | Why it works with no push | What it demands from the design | How it fails |
|---|---|---|---|
| **Appointment timer** — something finishes, respawns or unlocks at a known future time | The player's memory is the notification | Persistent state per player; a readable countdown; the timer must gate something they *want* | Waiting becomes the gameplay — that is gate G8. The timer must shorten a future session, never fill the current one |
| **Daily goals + streak** — rotating tasks, escalating reward track | Loss aversion is the strongest short-horizon force | Enough loop variety that a rotation is not arbitrary; milestone recovery, never a punishing reset to zero | Retention theatre: dailies bolted onto an experience nobody opens daily. Match the cadence to the real session rhythm |
| **Weekly leaderboard reset / small leagues** — rank inside small groups, fresh weekly | Near-zero content cost, automatic weekly event, the deadline drives a surge | A comparable score; group sizes small enough that mid-table players can still move | One global board — the top ten own it and everyone else stops looking. Small leagues, always |
| **Collection** — visible x/N toward a displayable reward | An unfinished set feels unfinished; evergreen once shipped | N items that are cheap to author and visibly different; the reward must be *displayable* | A grind disguised as a set. If item 14 of 20 takes ten hours, the set is a wall |
| **Recurring scheduled event** — e.g. every Friday 20:00 UTC | The event calendar is the real notification system, in-world plus Discord | One reusable template, automated; someone has to actually show up to run it week after week | A different bespoke event every week from a two-person team. Documented burnout trap |
| **Team / crew obligation** — small persistent groups with shared goals | "My crew expects me" is the strongest known retention force | A grouping mechanic, a shared goal, and something a group can lose by not showing | Churn is contagious — one big fragile community collapses at once. Small, re-formable groups |
| **Season track** — a free time-limited progress track, 6–8 weeks | A deadline plus a comeback moment at each new season | Enough progression breadth to fill a season; alignment with the program's own cycles | Season one is authored lovingly, season two never ships |
| **Async traces** — things players leave behind for others to find | The world feels alive at quiet hours, at zero ongoing cost | Persistence and a place to put traces; traces must be legible without explanation | Traces nobody notices. They have to be on the path the loop already walks |

**Choosing well.** Pick hooks whose rhythm matches the measured session rhythm from §3 — a 60-second
loop with a 20-minute session supports a weekly league and a collection; it does not support three
daily quest chains. Prefer hooks that reuse the loop already designed over hooks that add a system.
Cheap and automatic beats rich and manual, every time, for a team this size.

## 4.4 — The long-term goal

More than two weeks to achieve, and — the load-bearing half — **other players can see progress toward
it**. Ask specifically: at what moment does a stranger notice? If the answer needs an inspect screen,
it is invisible.

## What this section always parks

Every hook is a hypothesis about human behaviour, and their test costs differ by an order of
magnitude. Park each as its own row, ordered by cheapest killing test:

- appointment and timer lengths → arithmetic on paper, sometimes before any build;
- collection pacing and season length → a spreadsheet, then a session;
- "the crew obligation actually forms" → needs real people in a live World; the most expensive claim
  in the section, and the one most often assumed.

Do not let §4 close with all hooks resting at "obviously true". The Day-2 sentence itself is a
hypothesis until a live World says otherwise.
