---
tags: [pronoscup, métier, guidelines]
---

# Business Rules Guidelines

This guide describes the project's **Business Rules** — the tournament/domain logic of *Pronoscup 2026*
(FIFA World Cup 2026 predictions). These rules are enforced in `src/app/domain/` (pure TypeScript, fully
tested) and are independent of the UI: the presentation layer only *displays* what the domain decides.

Each rule is written so it can be cited in reviews and PRs (e.g. "this breaks **Rule 02-02**"). The code is
the source of truth; the **Sources** section maps every section to its domain file(s).

## Table of Content

- [Business Rules Guidelines](#business-rules-guidelines)
    - [Table of Content](#table-of-content)
    - [How-to read these guidelines?](#how-to-read-these-guidelines)
        - [Understanding the legend](#understanding-the-legend)
    - [01 - Tournament format & structure](#01---tournament-format--structure)
        - [Rule 01-01 Teams and groups](#rule-01-01-teams-and-groups)
        - [Rule 01-02 FIFA ranking](#rule-01-02-fifa-ranking)
        - [Rule 01-03 Group matches (round-robin)](#rule-01-03-group-matches-round-robin)
        - [Rule 01-04 Knockout matches and rounds](#rule-01-04-knockout-matches-and-rounds)
        - [Rule 01-05 Frozen reference data](#rule-01-05-frozen-reference-data)
        - [Rule 01-06 Match schedule](#rule-01-06-match-schedule)
    - [02 - Group ranking](#02---group-ranking)
        - [Rule 02-01 Points system](#rule-02-01-points-system)
        - [Rule 02-02 Tiebreakers](#rule-02-02-tiebreakers)
        - [Rule 02-03 Group completion](#rule-02-03-group-completion)
        - [Rule 02-04 Tie flag](#rule-02-04-tie-flag)
    - [03 - Qualification](#03---qualification)
        - [Rule 03-01 Top two per group](#rule-03-01-top-two-per-group)
        - [Rule 03-02 Best eight third-placed teams](#rule-03-02-best-eight-third-placed-teams)
        - [Rule 03-03 Third-place ranking resolution](#rule-03-03-third-place-ranking-resolution)
        - [Rule 03-04 Third-place slot assignment](#rule-03-04-third-place-slot-assignment)
    - [04 - Knockout bracket & propagation](#04---knockout-bracket--propagation)
        - [Rule 04-01 Round of 32 seeding](#rule-04-01-round-of-32-seeding)
        - [Rule 04-02 Winner & loser propagation](#rule-04-02-winner--loser-propagation)
        - [Rule 04-03 Final standings](#rule-04-03-final-standings)
        - [Rule 04-04 Blocked propagation](#rule-04-04-blocked-propagation)
    - [05 - Ties & penalty shootouts](#05---ties--penalty-shootouts)
        - [Rule 05-01 Knockout draw needs a penalty winner](#rule-05-01-knockout-draw-needs-a-penalty-winner)
        - [Rule 05-02 Undecided knockout match](#rule-05-02-undecided-knockout-match)
        - [Rule 05-03 Group draws stay draws](#rule-05-03-group-draws-stay-draws)
    - [06 - Official results & match locking](#06---official-results--match-locking)
        - [Rule 06-01 Official results source](#rule-06-01-official-results-source)
        - [Rule 06-02 Official precedence](#rule-06-02-official-precedence)
        - [Rule 06-03 Lock on official result](#rule-06-03-lock-on-official-result)
        - [Rule 06-04 Lock at kick-off](#rule-06-04-lock-at-kick-off)
    - [07 - Prediction comparison & scoring](#07---prediction-comparison--scoring)
        - [Rule 07-01 Verdict categories](#rule-07-01-verdict-categories)
        - [Rule 07-02 Knockout verdict specifics](#rule-07-02-knockout-verdict-specifics)
        - [Rule 07-03 Prediction shown next to official](#rule-07-03-prediction-shown-next-to-official)
        - [Rule 07-04 Points scoring](#rule-07-04-points-scoring)
    - [08 - Progress](#08---progress)
        - [Rule 08-01 Progress counting](#rule-08-01-progress-counting)
    - [09 - Import / export & validation](#09---import--export--validation)
        - [Rule 09-01 Predictions schema](#rule-09-01-predictions-schema)
        - [Rule 09-02 Valid ids and scores](#rule-09-02-valid-ids-and-scores)
        - [Rule 09-03 Winner field constraints](#rule-09-03-winner-field-constraints)
        - [Rule 09-04 Official results import](#rule-09-04-official-results-import)
        - [Rule 09-05 Export & reset](#rule-09-05-export--reset)
    - [10 - State & persistence](#10---state--persistence)
        - [Rule 10-01 Two sources of truth](#rule-10-01-two-sources-of-truth)
        - [Rule 10-02 Everything else is computed](#rule-10-02-everything-else-is-computed)
        - [Rule 10-03 Reset scope](#rule-10-03-reset-scope)
    - [Sources](#sources)

<hr>

## How-to read these guidelines?

### Understanding the legend

ℹ️ **_Piece of information you have to be aware of._**

📚 Resources offering further details about the rules and tools to better your understanding.

⛔ A behaviour the domain forbids. Never produce data that violates it.

✅ Something the domain guarantees / something you should rely on.

💡 Ideas, reasons and whys behind the statement it follows.

🔥 Invariant verified by an automated test (`*.spec.ts`).

⚠️ Heads-up!

<hr>

## 01 - Tournament format & structure

### Rule 01-01 Teams and groups

✅ The tournament has **48 teams** split into **12 groups** `A`–`L` of **4 teams** each.

✅ Team ids follow the `{Group}{1-4}` shape (e.g. `A1`…`L4`); match ids are `M1`…`M104`.

🔥 Invariant tested: 48 unique teams, exactly 4 per group.

### Rule 01-02 FIFA ranking

✅ Each team carries a **pre-tournament FIFA ranking** (an integer > 0), displayed next to the team in the group view.

- 💡 Informational only — it never affects ranking or qualification (see [Rule 02-02](#rule-02-02-tiebreakers)).

### Rule 01-03 Group matches (round-robin)

✅ The group stage is a **round-robin**: 6 matches per group → **72 matches** (`M1`…`M72`), over 3 matchdays.

##### Example

```text
Matchday 1: (1-2) (3-4)
Matchday 2: (1-3) (4-2)
Matchday 3: (4-1) (2-3)
```

### Rule 01-04 Knockout matches and rounds

✅ The knockout stage has **32 matches** (`M73`…`M104`) over the rounds:

```text
Round of 32 (M73–M88) → Round of 16 (M89–M96) → Quarter-finals (M97–M100)
→ Semi-finals (M101–M102) → Third-place play-off (M103) → Final (M104)
```

✅ Total tournament size = **104 matches** (72 group + 32 knockout).

### Rule 01-05 Frozen reference data

ℹ️ **_Teams, groups and the bracket structure come from the official draw and are frozen constants._**

⛔ Team names / groups are **not** editable from the UI.

✅ They can only be corrected via the code (`domain/data/`) or a predictions import.

### Rule 01-06 Match schedule

✅ Every match has a **date**, a **venue**, and (where known) a **`kickoff`** timestamp in ISO 8601 with a timezone offset.

- 💡 The `kickoff` drives the write-lock (see [Rule 06-04](#rule-06-04-lock-at-kick-off)).

<hr>

## 02 - Group ranking

> Tiebreaking is a **Strategy** (`RankingComparator`): a new rule (e.g. head-to-head) can be added without touching the engine.

### Rule 02-01 Points system

✅ **Win = 3 points · Draw = 1 point · Loss = 0 point.**

### Rule 02-02 Tiebreakers

✅ Teams are ordered by, in strict priority:

```text
1. points        (desc)
2. goal diff     (desc)
3. goals for     (desc)
4. team id       (asc, alphabetical — deterministic fallback)
```

- 💡 The team-id fallback guarantees a **deterministic** order in the absence of an official draw/tiebreak.

### Rule 02-03 Group completion

✅ A group is **complete** only when **all 6 matches** have both `home` and `away` scores entered.

⛔ Winners/runners-up and third-place qualification are **not** computed for an incomplete group.

### Rule 02-04 Tie flag

ℹ️ **_When teams are equal on points, goal difference and goals for, they are flagged as tied._**

✅ This flag is **informational** (surfaced in the UI); the deterministic fallback ([Rule 02-02](#rule-02-02-tiebreakers)) still orders them.

<hr>

## 03 - Qualification

### Rule 03-01 Top two per group

✅ The **top 2** of each group qualify → **24 teams**.

### Rule 03-02 Best eight third-placed teams

✅ The **8 best 3rd-placed teams** (out of 12) also qualify, ranked with the same comparator as the groups.

### Rule 03-03 Third-place ranking resolution

✅ The 3rd-place ranking is **resolved only once all 12 groups are complete**.

- 💡 Before that, the standings are shown as provisional and no third is marked qualified.

### Rule 03-04 Third-place slot assignment

✅ The 8 qualified thirds are placed into **8 fixed slots**, each with a set of eligible groups, using **backtracking**.

🔥 Invariant tested: a valid assignment exists for **all 495** combinations of 8 groups out of 12.

- 💡 A greedy first-fit fails on many combinations — backtracking is required; slot order is fixed for determinism.

<hr>

## 04 - Knockout bracket & propagation

### Rule 04-01 Round of 32 seeding

✅ The 16 Round-of-32 matches are **seeded from group qualifiers** (winners, runners-up, best thirds) through **fixed cross-bracket links**.

🔥 Invariant tested: the bracket is a DAG terminating at the Final (`M104`), with no slot fed twice.

### Rule 04-02 Winner & loser propagation

✅ The **winner** of a match advances along its `winnerTo` link to the next round.

✅ The **two semi-final losers** drop to the third-place play-off (`M103`) via `loserTo`.

### Rule 04-03 Final standings

✅ **Champion** = winner of `M104` · **Runner-up** = loser of `M104` · **Third place** = winner of `M103`.

### Rule 04-04 Blocked propagation

⛔ Propagation **halts** at any match that is not yet decided: downstream slots stay empty until it resolves.

<hr>

## 05 - Ties & penalty shootouts

### Rule 05-01 Knockout draw needs a penalty winner

✅ A drawn knockout match must designate a **penalty-shootout winner** via `winner` (`'home'` | `'away'`).

### Rule 05-02 Undecided knockout match

ℹ️ **_A knockout draw with no `winner` is `needsAttention`._**

⛔ Such a match is **not decided** and **blocks propagation** (see [Rule 04-04](#rule-04-04-blocked-propagation)).

### Rule 05-03 Group draws stay draws

⛔ The `winner` field is **forbidden** in the group stage — a draw stays a draw.

<hr>

## 06 - Official results & match locking

### Rule 06-01 Official results source

✅ Official results come from a **manually-maintained server file** (`public/official-results.json`).

⛔ No official API/website is queried — **no scraping**. Results are entered by hand as real matches happen.

### Rule 06-02 Official precedence

✅ For every match, the **effective score = official ?? prediction**. The official result drives standings, qualification and the bracket.

### Rule 06-03 Lock on official result

✅ A match that has an **official result** is **read-only** — user input is ignored.

### Rule 06-04 Lock at kick-off

✅ A match also becomes **read-only once its kick-off has passed** (`now ≥ kickoff`).

- 💡 If no precise `kickoff` is set, the lock falls back to the **start of the match day** (`kickoffMsOf`).

ℹ️ **_Defense in depth_** — the lock is enforced both by a guard in the store (`setScore` / `pickPenaltyWinner`) **and** by the `disabled` state in the UI, never only in the view.

- 💡 The current time comes from a `Clock` port (the domain never reads the system clock directly); it can be frozen with `?now=<ISO>` to preview/test locks.

<hr>

## 07 - Prediction comparison & scoring

### Rule 07-01 Verdict categories

✅ For each match that has an official result, the prediction gets a verdict:

```text
exact    → identical score
outcome  → correct result (winner/draw) but a different score
wrong    → incorrect result
null     → prediction incomplete (a side is missing)
```

### Rule 07-02 Knockout verdict specifics

✅ In the knockout stage, **`exact` also requires the same penalty winner** on a draw, and **`outcome`** means the **correct advancing side** (by score, or by penalty winner on a draw).

### Rule 07-03 Prediction shown next to official

✅ Once an official result is integrated, the **player's own prediction is displayed next to it**, with its verdict.

##### Example

```text
🏟️ Official 2–1 · prono 1–1   [≈ outcome]
```

### Rule 07-04 Points scoring

✅ Scoring: **3 points per exact** + **1 point per outcome** (0 otherwise).

```text
total = 3 × (exact predictions) + 1 × (outcome predictions)
```

✅ The total ("Mon score") is **always displayed**; the exact/outcome/wrong breakdown appears once at least one official result exists.

<hr>

## 08 - Progress

### Rule 08-01 Progress counting

✅ Progress counts **fully-entered matches** (both sides present) across all 104, from the *effective* scores.

```text
pct = round(total / 104 × 100)
```

- 💡 A match with a single side entered is **not** counted.

<hr>

## 09 - Import / export & validation

### Rule 09-01 Predictions schema

✅ Imported predictions must match `{ version: 1, scores: { <matchId>: { home, away, winner? } } }`.

⛔ Any `version` other than **1** is rejected.

### Rule 09-02 Valid ids and scores

⛔ Match ids outside `M1`…`M104` are rejected.

⛔ Scores must be **non-negative integers** — negatives and decimals are rejected.

### Rule 09-03 Winner field constraints

⛔ `winner` is **forbidden** on group matches.

✅ `winner` is **optional** on knockout matches; if present it must be `'home'` or `'away'`.

### Rule 09-04 Official results import

✅ Official import accepts either `{ results: … }` or `{ scores: … }`; the `version` is optional.

⛔ It **requires** a `winner` on **every knockout draw** (an undecided KO official result is rejected).

##### Example

```json
{ "version": 1, "results": { "M1": { "home": 2, "away": 0 } } }
```

### Rule 09-05 Export & reset

✅ Export format is `{ version: 1, scores: … }`.

✅ `reset` clears **predictions only** — official results are untouched.

<hr>

## 10 - State & persistence

### Rule 10-01 Two sources of truth

✅ There are exactly **two** writable sources of truth:

- **user predictions** — persisted to LocalStorage (per browser);
- **official results** — fetched from the server, **not** persisted locally.

### Rule 10-02 Everything else is computed

✅ Standings, qualifiers, the bracket, comparisons and the score are **`computed`** from the two sources via the pure engine.

⛔ Never store derived state — it would risk going stale.

### Rule 10-03 Reset scope

✅ `reset` empties predictions and keeps official results, consistent with [Rule 09-05](#rule-09-05-export--reset).

<hr>

## Sources

The code is authoritative. Each section maps to the domain file(s) that enforce it:

| Section | Domain source(s) |
|---|---|
| 01 Format & structure | `domain/data/teams.ts`, `domain/data/fixtures.ts`, `domain/data/knockout-structure.ts`, `domain/data/schedule.ts`, `domain/data/data-invariants.spec.ts` |
| 02 Group ranking | `domain/engines/group-stage.engine.ts`, `domain/engines/ranking-comparator.ts` |
| 03 Qualification | `domain/engines/group-stage.engine.ts`, `domain/engines/tournament.engine.ts`, `domain/data/knockout-structure.ts` |
| 04 Knockout & propagation | `domain/data/knockout-structure.ts`, `domain/engines/knockout-stage.engine.ts` |
| 05 Ties & penalties | `domain/engines/knockout-stage.engine.ts`, `domain/validation/score-map.validator.ts` |
| 06 Official results & locking | `domain/policies/match-access.policy.ts`, `domain/data/schedule.ts`, `application/tournament.store.ts`, `infrastructure/remote-official-results.provider.ts` |
| 07 Comparison & scoring | `domain/engines/prediction-comparator.ts`, `domain/engines/tournament.engine.ts` |
| 08 Progress | `domain/engines/tournament.engine.ts` |
| 09 Import / export & validation | `domain/validation/score-map.validator.ts`, `application/tournament.store.ts` |
| 10 State & persistence | `application/tournament.store.ts` |
