# Session Execution Tasks

**Spec**: `.specs/features/session-execution/spec.md`
**Design**: `.specs/features/session-execution/design.md`
**Status**: Ready

---

## Test Strategy

**Unit tests:** None for screen modules (UI + DAL integration — DAL already unit-tested).
**Gate command (quick):** `npx vitest run`
**Gate command (build):** `npx vite build`
**All screen layers:** `Tests: none` — manual verification on device/emulator after T3.

---

## Execution Plan

```
Phase 1 — Router Extension (Sequential)
  T1

Phase 2 — Screens (Parallel — touch different files)
  T1 done → T2 [P], T3 [P]
```

```
T1 ──┬──→ T2 [P]  (workout-detail.js — add "Iniciar Treino" button)
     └──→ T3 [P]  (session.js new screen + router import)
```

---

## Task Breakdown

### T1: Extend router — `#/session/:id` route

**What**: Add parameterized route matching for `#/session/:id` to `router.js`. Import `session.js` and return it when hash matches. Same pattern as the `#/workout/:id` extension done in M2-T1.
**Where**: `src/js/router.js`
**Depends on**: None (M2 complete)
**Reuses**: Existing `#/workout/:id` match pattern in `router.js`
**Requirements**: SE-03

**Done when**:

- [ ] `import * as sessionScreen from './screens/session.js'` added at top of `router.js`
- [ ] `getScreen(hash)` updated: hash matching `/^#\/session\/(\d+)$/` sets `currentParams = { id: match[1] }` and returns `sessionScreen`
- [ ] Existing routes (`#/`, `#/history`, `#/workout/:id`) unaffected
- [ ] `npx vite build` passes (even before `session.js` exists it will fail — create a stub `session.js` with `export function render() {}` as part of this task)

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(session-execution): add #/session/:id route to router`

---

### T2: Add "Iniciar Treino" button to `workout-detail.js` [P]

**What**: Add a "Iniciar Treino" button at the bottom of the exercise list (only when exercises exist). On tap, call `createSession(workoutId)`, store `window._sessionWorkoutId = workoutId`, then navigate to `#/session/:sessionId`. On error, show an alert.
**Where**: `src/js/screens/workout-detail.js`
**Depends on**: T1 (route exists to navigate to)
**Reuses**: `createSession` from `dal.js`; `navigate` from `router.js`; button style from `UI/code.html`
**Requirements**: SE-01, SE-02

**Done when**:

- [ ] `createSession` imported from `../dal.js`
- [ ] When `exercises.length > 0`, the rendered HTML includes a "Iniciar Treino" button (`id="btn-start-workout"`) below the exercise list
- [ ] When `exercises.length === 0`, the button is NOT rendered
- [ ] Button click: `await createSession(workoutId)` → `window._sessionWorkoutId = workoutId` → `navigate('#/session/' + session.id)`
- [ ] On `createSession` error: `alert('Erro ao iniciar treino: ' + err.message)` — no navigation
- [ ] Button styled with primary color, rounded-full, play_arrow icon, "Iniciar Treino" label
- [ ] `npx vite build` passes

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(session-execution): add start workout button to workout detail screen`

---

### T3: Create `session.js` — active session screen [P]

**What**: Full session execution screen. Loads workout name and exercises, renders rows with weight input + done toggle, tracks done state in a `Set`, updates progress live, enables "Finalizar Treino" only when ≥1 done, calls `finishSession` on finish, wires back button to workout detail.
**Where**: `src/js/screens/session.js` (replace stub from T1)
**Depends on**: T1 (route + stub file)
**Reuses**: `getWorkouts`, `getExercises`, `logWeight`, `markExerciseDone`, `finishSession` from `dal.js`; `navigate` from `router.js`; card markup from `workout-detail.js`; done-state visual pattern from `UI/code.html`
**Requirements**: SE-04, SE-05, SE-06, SE-07, SE-08, SE-09, SE-10, SE-11, SE-12

**Done when**:

- [ ] `render(container, params)` exported; parses `params.id` as `sessionId`; reads `window._sessionWorkoutId` as `workoutId`
- [ ] Fetches workout name via `getWorkouts()` + filter; fetches exercises via `getExercises(workoutId)`
- [ ] Graceful error shown (no crash) if `sessionId` invalid or `workoutId` missing
- [ ] Each exercise row renders: done-toggle button + exercise name + weight number input + "kg" label
- [ ] `doneSet` (module-level `Set`) and `seMap` (`exerciseId → sessionExerciseId`) initialized on each render call
- [ ] Done toggle (first tap): reads weight input value (parseFloat, default `0`), calls `logWeight(sessionId, exerciseId, kg)`, then `markExerciseDone(se.id)` → adds `se.id` to `doneSet`, stores in `seMap`, applies done visual to row (opacity-50, line-through name, filled check icon in primary color), updates progress counter, enables/disables finish button
- [ ] Done toggle (second tap — undo): removes from `doneSet`, restores row visual, updates progress counter, enables/disables finish button. No DB change.
- [ ] On `logWeight` or `markExerciseDone` error: shows alert, does NOT change visual state
- [ ] Progress indicator: `X / N exercícios feitos` text updated live (no full re-render)
- [ ] "Finalizar Treino" button disabled (`opacity-50 pointer-events-none`) when `doneSet.size === 0`; enabled when ≥1 done
- [ ] "Finalizar Treino" click: calls `finishSession(sessionId)` → `navigate('#/')` on success; alert on error
- [ ] Back button shown and wired: `navigate('#/workout/' + workoutId)`
- [ ] `npx vite build` passes
- [ ] Manual verify: start session, log weights, mark exercises, finish — navigates home, DB has `finished_at` set on session

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(session-execution): add active session screen with weight logging and finish flow`

---

## Diagram-Definition Cross-Check

| Task | Depends on (diagram) | Depends on (definition) | Match? |
| ---- | -------------------- | ----------------------- | ------ |
| T1   | —                    | None                    | ✅     |
| T2   | T1                   | T1                      | ✅     |
| T3   | T1                   | T1                      | ✅     |

T2 and T3 touch different files (`workout-detail.js` vs `session.js`), no conflict. ✅

---

## Test Co-location Validation

| Task | Code Layer                   | Required Test Type            | Tests Field | Match? |
| ---- | ---------------------------- | ----------------------------- | ----------- | ------ |
| T1   | `router.js` route addition   | none (routing infra — manual) | none        | ✅     |
| T2   | `workout-detail.js` addition | none (UI screen — DAL tested) | none        | ✅     |
| T3   | `session.js` new screen      | none (UI screen — DAL tested) | none        | ✅     |

---

## Granularity Check

| Task                                | Scope                                 | Status      |
| ----------------------------------- | ------------------------------------- | ----------- |
| T1: Router `#/session/:id` + stub   | 1 file + 1 stub file                  | ✅ Granular |
| T2: workout-detail "Iniciar Treino" | 1 file, 1 focused addition            | ✅ Granular |
| T3: `session.js` full screen        | 1 file — self-contained screen module | ✅ Granular |
