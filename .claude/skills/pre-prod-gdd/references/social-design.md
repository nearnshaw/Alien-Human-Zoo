# Social by Design

The program requirement: **playable alone, better with others.** "Better with others" has to be
designed. Hoped-for social is solo play with strangers in the room.

## The concurrency reality

Most visits happen at a quiet hour with almost nobody else present. That is not the edge case to
handle last — it is the common case, and a design that only works at peak is a design that mostly does
not work. The reviewer's sharpest question is deliberately brutal: *what does your world look like at
4 a.m. with 2 concurrent players?* Silence is a failing answer.

The inverse also holds and gets forgotten: **ambient multiplayer is not optional.** Other avatars are
present in a Decentraland scene whether the design wants them or not. So the social section always has
to answer at minimum: what does a bystander see, and what can a bystander *break*?

## Better, not merely possible

Patterns that make a second player an upgrade rather than a witness:

- **Group-scaled rewards** — the same act pays more with more people doing it. The cheapest possible
  answer, and it survives low concurrency because two is already a group.
- **Multiplayer-only moments** — something in the loop that literally cannot resolve alone: a
  two-lever door, a carry, a pass, a vote. Use sparingly; anything on the critical path becomes a
  blocker at 2 CCU.
- **Competition with a comparable number** — a race, a score, a board. Nearly free once the loop
  produces a number.
- **An audience** — the loop is worth watching, and the performer knows they are being watched. Most
  under-used pattern on the platform, and the one that costs the least.

## The quiet-hour toolkit

How a player who arrives alone still ends up interacting with someone — **by design, not by luck**:

- **Async traces.** Things earlier players left that later players find: a scoreboard, a ghost run, a
  built thing, a message, a mark on the ground. Zero ongoing cost, works at 1 CCU, and it is the only
  pattern that makes an empty world feel inhabited. Traces must sit on the path the loop already
  walks, or nobody notices them.
- **Spawn placement near activity.** Do not spawn players at the edge of the parcel. Spawn them where
  the loop is happening, facing it.
- **Concentrated space.** A small area that feels full with three people beats a large one that feels
  abandoned with twelve. Cutting the footprint is a social design decision.
- **Scheduled peak windows.** Do not fight the concurrency curve — pick a weekly hour and make
  everyone come then. An announced Friday 20:00 UTC window converts scattered visits into a crowd,
  and doubles as §4's recurring-event hook.
- **Two-second social verbs a stranger can use on you.** A wave, a challenge, a pass, a gift, a
  high-five. The bar is: no coordination, no chat, no explanation, and it works on someone whose name
  you do not know. Chat is not a social verb — it is a text box.

## The bystander test

What does someone understand by *watching* another player play? Visible gameplay is simultaneously
the tutorial (see [core-loop-and-ftue.md](core-loop-and-ftue.md)) and the marketing — a passer-by who
understands the game in five seconds of watching is a player. A loop whose interesting part happens
inside a UI panel is invisible, and invisible loops do not spread.

## Bring-a-friend

What in the design makes a player *invite* someone? Working patterns: invitation as gameplay (you need
a second person for the thing you want), "both earn double", things only unlockable together, and a
gift a new player receives immediately. What does not work: a share button.

## The memorable moment

One specific moment somebody would screenshot or clip. Ask for it concretely, then ask which systems
must exist for the moment to be possible — designs fall out of this question. If no moment can be
named, the experience produces no stories, and stories are the only distribution channel a small
experience has.

## Social retention, honestly

Social ties are the strongest late-retention force in the literature — friend count predicts longevity
better than achievement at high engagement, and players without a group abandon significantly more.
That is the case for investing here.

The cost side: **churn is socially contagious.** Groups amplify retention and they also collapse
together — when one member of a four-person crew stops, the other three often follow within days.
Design for small, *re-formable* groups rather than one large fragile community, so a collapse is
recoverable rather than terminal.

## What this section always parks

- "Two players do better than one" — testable on desktop with two accounts, cheaply.
- "A stranger uses a social verb on another stranger within the first session" — needs real people; a
  live-World hypothesis, and usually the most optimistic claim in the document.
- "The world still feels alive at 2 CCU" — testable by walking the empty scene, which is why it should
  never sit parked for long.
