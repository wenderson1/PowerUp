# M4 — History & Progression · Tasks

**Status:** Ready to execute
**Design:** `.specs/features/history-progression/design.md`

---

## T1 — DAL + Router foundation

**Files:** `src/js/dal.js`, `src/js/router.js`
**Dependencies:** none

### dal.js

Add `getCompletedSessions()`:

```js
export async function getCompletedSessions() {
  const db = getDB();
  const result = await db.query(
    `SELECT s.id, s.started_at, w.name AS workout_name,
            COUNT(se.id) AS exercise_count
     FROM sessions s
     JOIN workouts w ON w.id = s.workout_id
     LEFT JOIN session_exercises se
            ON se.session_id = s.id AND se.completed = 1
     WHERE s.finished_at IS NOT NULL
     GROUP BY s.id
     ORDER BY s.started_at DESC`,
    [],
  );
  return result.values ?? [];
}
```

### router.js

1. Import `sessionLogScreen` and `exerciseHistoryScreen`
2. Add stubs `session-log.js` and `exercise-history.js` (just `export function render(){}`) so imports don't fail
3. Add regex matches in `getScreen()`:
   - `/^#\/session-log\/(\d+)$/` → `sessionLogScreen`
   - `/^#\/exercise-history\/(\d+)$/` → `exerciseHistoryScreen`

**Verification:** `npx vite build` succeeds with no errors.

---

## T2 — History screen (rewrite `history.js`)

**Files:** `src/js/screens/history.js`
**Dependencies:** T1 (needs `getCompletedSessions` in DAL, route registered)

Replace placeholder with full implementation:

- Hide back button
- Call `getCompletedSessions()`
- Render session cards (workout name, formatted date, exercise count, chevron)
- Tap card → `navigate('#/session-log/' + session.id)`
- Empty state: icon `history` + "Nenhum treino realizado ainda"
- Error state on catch

**Verification:** History tab shows completed sessions. Tapping a card navigates to `#/session-log/:id`.

---

## T3 — Session Log screen (new `session-log.js`)

**Files:** `src/js/screens/session-log.js`
**Dependencies:** T1 (route registered)

Full implementation:

- Show back button → `navigate('#/history')`
- Read `params.id` as sessionId
- Call `getSessionExercises(sessionId)`
- Render exercise rows: done icon + name + weight (or "—")
- Empty state: "Nenhum exercício registrado"
- Header: session context — use `window._sessionLogContext` (set by history screen on navigate) for workout name + date, or fallback to querying `getSessions` if context is missing

**window.\_sessionLogContext shape:**

```js
{ workoutName: string, startedAt: string }
```

Set in history.js before navigating.

**Verification:** Tapping a session in history shows its exercises and weights.

---

## T4 — Exercise History screen (new `exercise-history.js`)

**Files:** `src/js/screens/exercise-history.js`
**Dependencies:** T1 (route registered)

Full implementation:

- Show back button → `navigate('#/workout/' + ctx.workoutId)`
- Read `window._exerciseContext` for `{ exerciseId, exerciseName, workoutId, workoutName }`
- Call `getWeightHistory(exerciseId, 10)`
- Render weight rows: weight + "kg" + formatted date, most recent first
- Empty state: "Nenhum peso registrado ainda"
- Error state if `_exerciseContext` is missing

**Verification:** History icon on exercise navigates to weight list. Back returns to workout detail.

---

## T5 — History button in workout-detail

**Files:** `src/js/screens/workout-detail.js`
**Dependencies:** T1 (route registered), T4 (screen implemented)

In the exercise row HTML, add a history icon button alongside the existing remove button:

```html
<button id="btn-ex-history-${ex.id}" ...>
  <span class="material-symbols-outlined">history</span>
</button>
```

In the event listener block, wire `btn-ex-history-${ex.id}`:

```js
document.getElementById(`btn-ex-history-${ex.id}`).onclick = () => {
  window._exerciseContext = {
    exerciseId: ex.id,
    exerciseName: ex.name,
    workoutId,
    workoutName: workout.name,
  };
  navigate("#/exercise-history/" + ex.id);
};
```

**Verification:** History icon appears on each exercise row. Tapping opens exercise weight history. Back returns to correct workout.

---

## T6 — Build & sync

**Files:** none (build step)
**Dependencies:** T1–T5

```
npx vite build
npx cap sync
```

**Verification:** Build completes (16+ modules). No TypeScript/module errors.
