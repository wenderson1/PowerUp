# M4 — History & Progression

**Status:** Specifying
**Goal:** User can review completed workout sessions and track weight progression per exercise over time.

---

## Context

After completing a session (M3), the user has no way to review what they did. M4 surfaces that data through two entry points:

1. A global **History screen** — all completed sessions across all workouts, sorted by date.
2. An **Exercise History** view — weight log for a specific exercise, accessible from the workout detail.

---

## User Stories

### US-01 — View training history

As a user, I want to see a list of all my completed workouts (sorted by most recent), so I can track my consistency.

### US-02 — Review a past session

As a user, I want to tap a past session and see which exercises I did and what weights I used, so I can plan my next session.

### US-03 — Track weight progression per exercise

As a user, I want to see the last N weights I used for a specific exercise (in order), so I can see if I'm progressing.

---

## Requirements

### History Screen (`#/history`)

| ID    | Requirement                                                                                |
| ----- | ------------------------------------------------------------------------------------------ |
| M4-R1 | Shows all completed sessions (`finished_at IS NOT NULL`), sorted by most recent first      |
| M4-R2 | Each entry shows: workout name, formatted date (dd/mm/yyyy), number of completed exercises |
| M4-R3 | Tapping an entry navigates to Session Log (`#/session-log/:id`)                            |
| M4-R4 | Shows empty state — "Nenhum treino realizado ainda" — when no completed sessions exist     |
| M4-R5 | Back button is hidden (bottom nav is the primary navigation)                               |

### Session Log Screen (`#/session-log/:id`)

| ID     | Requirement                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------- |
| M4-R6  | Shows session workout name and formatted date at the top                                             |
| M4-R7  | Lists all exercises logged in the session with: name, weight used (or "—" if none), completed status |
| M4-R8  | Exercises marked as completed are visually distinct (e.g., checkmark, green text)                    |
| M4-R9  | Back button navigates to `#/history`                                                                 |
| M4-R10 | If session has no logged exercises, shows "Nenhum exercício registrado"                              |

### Exercise History (`#/exercise-history/:id`)

| ID     | Requirement                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------- |
| M4-R11 | Shows exercise name and workout name at the top                                                    |
| M4-R12 | Lists last 10 weight entries, most recent first                                                    |
| M4-R13 | Each entry shows: weight (kg) and formatted date                                                   |
| M4-R14 | Shows empty state — "Nenhum peso registrado ainda" — when no weight history exists                 |
| M4-R15 | Accessible from the exercise row in Workout Detail screen (new "history" icon button per exercise) |
| M4-R16 | Back button navigates back to `#/workout/:id`                                                      |

---

## Out of Scope (deferred to future milestones)

- Charts / sparkline graphs for weight trend
- Editing or deleting past sessions
- Personal records (PR) tracking
- Filtering history by workout or date range
