# Session Execution Specification

**Milestone**: M3 — Session Execution

## Problem Statement

The user can manage workout plans and exercises, but cannot actually perform a workout yet. M3 enables the core training loop: start a session from the workout detail screen, log the weight used per exercise, mark each exercise as done, and finish the session so it appears in history.

## Goals

- [ ] User can start a workout session from the workout detail screen.
- [ ] During a session, user can log a weight (kg) and mark each exercise as done.
- [ ] User can finish the session, persisting all data for the history screen (M4).

## Out of Scope

| Feature                                  | Reason                                               |
| ---------------------------------------- | ---------------------------------------------------- |
| Viewing session history                  | Belongs to M4 — History & Progression                |
| Rest timer between sets                  | Deferred — not in v1 requirements                    |
| Multiple sets per exercise               | Deferred — one weight log per exercise/session in v1 |
| Editing logged weight after marking done | Deferred — not in v1 requirements                    |
| Cancelling / abandoning a session        | Deferred — session simply stays unfinished           |

---

## Requirements

| ID    | Requirement                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SE-01 | The workout detail screen SHALL show a "Iniciar Treino" button when the workout has at least one exercise.                                                                                                          |
| SE-02 | Tapping "Iniciar Treino" SHALL call `createSession(workoutId)` and navigate to the active session screen.                                                                                                           |
| SE-03 | The router SHALL support the route `#/session/:id` and pass the session ID as a param.                                                                                                                              |
| SE-04 | The active session screen SHALL display the workout name and list all exercises for the session.                                                                                                                    |
| SE-05 | Each exercise row SHALL show a weight input (kg) and a "done" toggle button.                                                                                                                                        |
| SE-06 | When the user taps the "done" toggle on an exercise THEN `logWeight(sessionId, exerciseId, weightKg)` SHALL be called with the current input value (0 if empty), followed by `markExerciseDone(sessionExerciseId)`. |
| SE-07 | Once marked done, the exercise row SHALL be visually distinguished (dimmed + strikethrough name).                                                                                                                   |
| SE-08 | A done exercise's toggle SHALL be tappable again to undo (mark as not done — visual only, no DB undo in v1).                                                                                                        |
| SE-09 | The screen SHALL show a progress indicator (e.g. "2 / 4 exercícios feitos").                                                                                                                                        |
| SE-10 | A "Finalizar Treino" button SHALL be enabled only when at least one exercise is marked done.                                                                                                                        |
| SE-11 | Tapping "Finalizar Treino" SHALL call `finishSession(sessionId)` and navigate back to `#/`.                                                                                                                         |
| SE-12 | The back button during a session SHALL navigate back to the workout detail screen (`#/workout/:workoutId`), not home.                                                                                               |

---

## User Stories

### P1: Start a Session ⭐ MVP

**User Story**: As a user, I want to start a workout session from the workout detail screen so that I can begin tracking my training.

**Why P1**: Entry point for the entire training loop.

**Acceptance Criteria**:

1. WHEN the workout detail screen loads with at least one exercise THEN a "Iniciar Treino" button SHALL be visible.
2. WHEN the workout detail screen loads with zero exercises THEN the "Iniciar Treino" button SHALL NOT be shown.
3. WHEN the user taps "Iniciar Treino" THEN `createSession(workoutId)` SHALL be called and the app SHALL navigate to `#/session/:sessionId`.

**Independent Test**: Navigate to a workout with exercises, tap "Iniciar Treino" — URL changes to `#/session/1`.

---

### P1: Log Weight and Mark Exercise Done ⭐ MVP

**User Story**: As a user, I want to enter the weight I used and mark each exercise as done so that my session is recorded accurately.

**Why P1**: Core data capture — without this the session has no value.

**Acceptance Criteria**:

1. WHEN the active session screen loads THEN it SHALL display all exercises for that workout with a weight input and a done toggle each.
2. WHEN the user taps the done toggle THEN `logWeight` SHALL be called with the value from the weight input (defaulting to 0 if blank) and then `markExerciseDone` SHALL be called with the resulting `sessionExerciseId`.
3. WHEN an exercise is marked done THEN its row SHALL be visually dimmed and the exercise name SHALL have a strikethrough style.
4. WHEN the user taps the done toggle on an already-done exercise THEN the visual done state SHALL be toggled off (no DB change in v1).
5. WHEN any exercise is marked done THEN the progress indicator SHALL update (e.g. "1 / 3 exercícios feitos").

**Independent Test**: Open session, enter 80 in weight input, tap done — row dims, progress updates.

---

### P1: Finish Session ⭐ MVP

**User Story**: As a user, I want to finish my workout session so that it is saved and I can see it in my history later.

**Why P1**: Closes the training loop and persists data for M4.

**Acceptance Criteria**:

1. WHEN no exercises are marked done THEN the "Finalizar Treino" button SHALL be disabled (greyed out).
2. WHEN at least one exercise is marked done THEN the "Finalizar Treino" button SHALL be enabled.
3. WHEN the user taps "Finalizar Treino" THEN `finishSession(sessionId)` SHALL be called and the app SHALL navigate to `#/`.
4. WHEN the user navigates back via the back button THEN the app SHALL go to `#/workout/:workoutId` (not home).

**Independent Test**: Mark one exercise done, tap "Finalizar Treino" — navigates to home; session row exists in DB with `finished_at` set.

---

## Edge Cases

- WHEN `createSession` fails THEN an error message SHALL be shown on the workout detail screen — no navigation.
- WHEN the session screen loads with an invalid session ID THEN it SHALL show a graceful error, not crash.
- WHEN `logWeight` or `markExerciseDone` fails THEN an error alert SHALL be shown and the visual state SHALL NOT change.
- WHEN the weight input is left blank THEN `0` SHALL be used as the weight value (explicit zero, not null).
