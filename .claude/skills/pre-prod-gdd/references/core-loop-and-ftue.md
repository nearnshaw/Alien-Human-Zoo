# Core Loop and the First Session

The loop is the spine — §2, §4, §5, §6 and §9 are all expansions of it. Load this at Step C and keep
it for Step D; the two sections are one design problem seen from two ends.

## Verbs, not features

A loop step is something a **player does**, in a word they would use: *grab, throw, stack, race,
trade, plant, dodge, vote*. If a step reads "the economy rebalances" or "the leaderboard updates",
that is a system doing something, and the player is missing from their own loop.

How to get verbs out of a feature list: ask *"what does the player's hand do?"* for each feature. Some
features produce no verb at all — those are not part of the loop, and often not part of v1.

Write the loop as **3–5 steps with a closing arrow**. The value of a loop is in the edge that returns
to step 1: what the last step *gives* the player that makes step 1 worth doing again. A list without
that edge is a sequence, and a sequence ends.

## The numbers

- **One cycle: 30–90 seconds.** Longer and a mobile session holds too few repetitions to build skill
  or rhythm; shorter and nothing accumulates.
- **One session: minutes, not hours.** Mobile sessions are short, and several short sessions beat one
  long one — for retention and for the platform. Design the exit as much as the entrance.
- Cycle length constrains every hook in §4. Take the numbers there.

## "Why is the 10th repetition still fun?"

The most valuable question in the document, and the one whose answer is always a hypothesis. A real
answer names **what changes between repetitions**, and there are only so many sources:

| Source | What it needs | Cost |
|---|---|---|
| **Other players** — they are the variety | Enough concurrency, or async traces standing in | Cheapest and strongest; requires §5 to be real |
| **Randomness** — layout, spawn, order, modifier | A generator, and a floor on how bad a roll can be | Cheap, but reads as arbitrary without player agency over the roll |
| **Rising difficulty** — the loop tightens | A tuning curve and a fail state worth avoiding | Cheap; ends when the curve ends |
| **New combinations** — the player's toolkit grows | Authored content per unlock; scope risk lives here | Expensive; the usual over-scope trap |
| **Skill expression** — the ceiling is the player | Depth in one verb, and visible mastery | Cheap to build, hard to design; the best answer when it works |
| **Escalating stakes** — the same act matters more | Persistent state to risk | Cheap; leans on §4's persistence |

"It's procedural so it's different every time" restates the question. "There are lots of levels" is
content, not variability — it is consumed.

**Toys before games.** If one repetition of the core verb is not enjoyable with no goal, no score and
no reward attached, adding goals and scores will not fix it. That is the find-the-fun rung's whole
job, and it is the first hypothesis worth parking.

## §2 — The first session, written as "you"

Second person, present tense, 200 words, four beats. The point is not the prose: writing a session
you have to narrate concretely is the fastest way to find out whether the loop is real — for the owner
and for the reviewer.

### Seconds 0–10 — what do you SEE

The program gate: **80% of testers start playing within 5 seconds.** So the spawn camera frame has to
communicate the verb with nothing to read. What works:

- **one dominant affordance** in frame — one obviously interactive thing, at the centre of attention,
  at a scale that reads on a phone screen;
- **other players visibly mid-loop** — the best tutorial in any multiplayer experience, and free;
- **motion** where the verb happens; the eye goes to movement before it goes to text.

Banned by the template, and for good reason: signs with instructions, a tutorial, a tutorial NPC, UI
narration ("you click the button"), and lore before the first action. Each one is an admission that
the scene does not teach itself. G2 fails on any of them.

### The first minute — first action, first reward

Reward inside sixty seconds. It does not have to be economically meaningful; it has to be *legible* —
sound, motion, a number, something changing state. The program's publishable bar asks for sound and a
tooltip on **every** interaction, which is the same idea stated as a quality gate.

### The first ten minutes — first goal completed, next goal visible

Two things must happen: something *closes* (a goal completed, so the session has a shape), and
something *opens* (the next goal already visible, so leaving costs something).

### The last thing you see before leaving

This is §4's hook, staged inside session one. If the return hook is a Sunday league reset, the player
must see the league table before they log off on Wednesday. A hook the player never meets on Day 1
cannot bring them back on Day 2 — this is the most common silent break between §2 and §4, and worth
checking explicitly.

## Failure, feedback and readability

Cheap to skip, expensive to skip. For each core verb: how does the player know it worked, how do they
know it failed, and can they tell from a phone screen at arm's length? Sound plus a visible state
change on every interaction. A loop the player cannot read is a loop they cannot learn.

## What this section always parks

- **"One repetition is fun with nothing attached"** — the find-the-fun hypothesis; cheapest possible
  test, highest possible value.
- **"The 10th repetition is still fun"** — the core-loop rung's reason to exist.
- **"Players start within 5 seconds without being told anything"** — three testers and a greybox.
- **Cycle length** — a number to measure, not to argue about.
