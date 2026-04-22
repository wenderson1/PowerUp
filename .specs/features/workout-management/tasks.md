# Workout Management Tasks

**Spec**: `.specs/features/workout-management/spec.md`
**Design**: `.specs/features/workout-management/design.md`
**Status**: Ready

---

## Test Strategy

**Unit tests:** None for screen modules (DOM manipulation + DAL calls — DAL is already unit-tested in M1).
**Gate command (quick):** `npx vitest run`
**Gate command (build):** `npx vite build`
**All screen layers:** `Tests: none` — manual verification on device/emulator after T3.

---

## Execution Plan

```
Phase 1 — Router Extension (Sequential)
  T1

Phase 2 — Screens (Parallel — both depend only on T1, touch different files)
  T1 done → T2 [P], T3 [P]
```

```
T1 ──┬──→ T2 [P]  (workouts.js rewrite — only file touched)
     └──→ T3 [P]  (workout-detail.js new + router.js route entry)
```

---

## Task Breakdown

### T1: Extend router — parameterized routes + back button ID

**What**: Add parameterized route matching for `#/workout/:id` to `router.js` (infrastructure only — no workout-detail import yet). Export `getRouteParams()`. Update `screen.render()` call to pass params. Add `id="btn-back"` and `class="invisible"` to the back button in `index.html`.
**Where**: `src/js/router.js`, `src/index.html`
**Depends on**: None (M1 complete)
**Reuses**: Existing `getScreen()` and `render()` logic in `router.js`
**Requirements**: WM-10, WM-11

**Done when**:

- [ ] `currentParams` module-level variable added to `router.js` (default `{}`)
- [ ] `getScreen(hash)` updated: if hash matches `/^#\/workout\/(\d+)$/`, sets `currentParams = { id: match[1] }` — fallback to workouts screen for now (workout-detail imported in T3)
- [ ] `getScreen(hash)` clears `currentParams = {}` for exact-match routes
- [ ] `getRouteParams()` exported from `router.js`; returns current `currentParams`
- [ ] Internal `render()` calls `screen.render(container, currentParams)` instead of `screen.render(container)`
- [ ] `id="btn-back"` added to the back `<button>` in `src/index.html` header
- [ ] Back button in `index.html` has `class="invisible"` by default (hidden until a screen shows it)
- [ ] `npx vite build` passes with no errors
- [ ] Existing navigation (`#/`, `#/history`) still works after the change

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(workout-management): extend router with parameterized routes and back button`

---

### T2: Rewrite `workouts.js` — full workout management screen [P]

**What**: Replace the static placeholder with a fully functional screen that lists workouts from the DAL, lets the user create new workouts via an inline form triggered by the FAB, navigate to workout detail by tapping a card, and delete workouts with a confirmation dialog. Hides the back button on render.
**Where**: `src/js/screens/workouts.js`
**Depends on**: T1 (back button `id="btn-back"` exists in DOM)
**Reuses**: `getWorkouts`, `createWorkout`, `deleteWorkout` from `dal.js`; `navigate` from `router.js`; empty-state markup pattern from current `workouts.js`; card and FAB styles from `UI/code.html`
**Requirements**: WM-01, WM-02, WM-03, WM-04, WM-05

**Done when**:

- [ ] `render(container)` calls `getWorkouts()` and builds a card for each workout, or renders empty state if none
- [ ] Each workout card is fully tappable (click on card → `navigate('#/workout/' + workout.id)`) with `data-workout-id` attribute
- [ ] Each card has a delete `<button>` with `data-workout-id`; click stops event propagation to card, calls `window.confirm()`, on confirm calls `deleteWorkout(id)` then re-renders
- [ ] FAB (+ button) click shows an inline create form at the top of the workout list (or prepended to container)
- [ ] Create form has a text `<input>` with `id="workout-name-input"` that is auto-focused
- [ ] Create form "Salvar" button: trims input, validates non-empty (shows `input.setCustomValidity` or adds error class), calls `createWorkout(name)` then re-renders
- [ ] Create form "Cancelar" button: clears and hides form without creating a workout
- [ ] Back button hidden on render: `document.getElementById('btn-back').classList.add('invisible')` + `onclick = null`
- [ ] All async operations wrapped in try/catch; on error, renders an error message into container
- [ ] Styled with existing design tokens (dark theme, `bg-surface-container` cards, `primary` accent)
- [ ] `npx vite build` passes with no errors

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(workout-management): implement workouts screen with create, delete, and navigation`

---

### T3: Create `workout-detail.js` + register route in `router.js` [P]

**What**: Create a new screen module that displays exercises for a specific workout (identified by `params.id`), lets the user add exercises via an inline form, and remove exercises with confirmation. Shows and binds the back button. Register the `#/workout/:id` route in `router.js` by importing the new module and updating `getScreen()`.
**Where**: `src/js/screens/workout-detail.js` (new), `src/js/router.js` (add import + route)
**Depends on**: T1 (parameterized matching infrastructure + `id="btn-back"` in DOM)
**Reuses**: `getWorkouts`, `getExercises`, `addExercise`, `removeExercise` from `dal.js`; `navigate`, `getRouteParams` from `router.js`; card and empty-state patterns from `workouts.js` and `UI/code.html`
**Requirements**: WM-06, WM-07, WM-08, WM-09, WM-11

**Done when**:

- [ ] `render(container, params)` exported; reads `params.id` (parseInt); calls `getWorkouts()` to find workout name and `getExercises(id)` to get exercises
- [ ] Workout name displayed as page heading (`<h2>` styled with `text-headline-lg font-headline-lg text-primary`)
- [ ] Exercise list rendered with a row per exercise (icon + name + remove button), or empty state if none
- [ ] Each exercise row has a remove `<button>` with `data-exercise-id`; click calls `window.confirm()`, on confirm calls `removeExercise(id)` then re-renders
- [ ] Add exercise button (styled as secondary action button below list or as FAB) shows an inline form with text `<input>` auto-focused
- [ ] Add form "Salvar": trims input, validates non-empty, calls `addExercise(workoutId, name)` then re-renders
- [ ] Add form "Cancelar": hides form without adding exercise
- [ ] Back button shown and wired on render: `document.getElementById('btn-back').classList.remove('invisible')` + `onclick = () => navigate('#/')`
- [ ] If `params.id` is missing or workout not found, renders a graceful error message (no crash)
- [ ] All async operations wrapped in try/catch; on error, renders error message into container
- [ ] `router.js` updated: `import * as workoutDetailScreen from './screens/workout-detail.js'` added at top; `getScreen()` returns `workoutDetailScreen` (not fallback) when hash matches `#/workout/:id`
- [ ] `npx vite build` passes with no errors
- [ ] Manual verify: navigate to `#/workout/1` → exercises screen renders with correct workout name and back button works

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(workout-management): add workout detail screen with exercise management`

---

## Diagram-Definition Cross-Check

| Task | Depends on (diagram) | Depends on (definition) | Match? |
| ---- | -------------------- | ----------------------- | ------ |
| T1   | —                    | None                    | ✅     |
| T2   | T1                   | T1                      | ✅     |
| T3   | T1                   | T1                      | ✅     |

T2 and T3 touch different files (`workouts.js` vs `workout-detail.js` + router import), so parallel execution has no conflict. ✅

---

## Test Co-location Validation

| Task | Code Layer Created/Modified                                                          | Required Test Type                               | Tests Field | Match? |
| ---- | ------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------- | ------ |
| T1   | `router.js` (logic), `index.html`                                                    | none (per M1 precedent — router tested manually) | none        | ✅     |
| T2   | `screens/workouts.js` (UI + DAL integration)                                         | none (UI screen — DAL already tested)            | none        | ✅     |
| T3   | `screens/workout-detail.js` (UI + DAL integration), `router.js` (route registration) | none (UI screen)                                 | none        | ✅     |

---

## Granularity Check

| Task                                | Scope                                      | Status                                     |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------ |
| T1: Router extension + back button  | 2 files, 1 focused concern (routing infra) | ✅ Cohesive — all routing infrastructure   |
| T2: `workouts.js` rewrite           | 1 file                                     | ✅ Granular                                |
| T3: `workout-detail.js` + route reg | 1 new file + 1 small addition to router.js | ✅ Cohesive — new screen + its route entry |
