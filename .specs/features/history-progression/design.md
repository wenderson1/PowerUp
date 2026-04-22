# M4 — History & Progression · Design

**Status:** Design
**Spec:** `.specs/features/history-progression/spec.md`

---

## Architecture Overview

3 new screens, 1 new DAL function, 2 new router routes. No schema changes.

```
router.js
  #/history              → historyScreen        (rewrite history.js placeholder)
  #/session-log/:id      → sessionLogScreen     (new: session-log.js)
  #/exercise-history/:id → exerciseHistoryScreen (new: exercise-history.js)

workout-detail.js
  exercise row           → new history icon button → sets window._exerciseContext → #/exercise-history/:id

dal.js
  + getCompletedSessions()   (new)
```

---

## New DAL Function

### `getCompletedSessions()`

```sql
SELECT s.id, s.started_at, w.name AS workout_name,
       COUNT(se.id) AS exercise_count
FROM sessions s
JOIN workouts w ON w.id = s.workout_id
LEFT JOIN session_exercises se
       ON se.session_id = s.id AND se.completed = 1
WHERE s.finished_at IS NOT NULL
GROUP BY s.id
ORDER BY s.started_at DESC
```

Returns: `[{ id, started_at, workout_name, exercise_count }]`

Existing functions used by new screens (no changes needed):

- `getSessionExercises(sessionId)` → session-log.js
- `getWeightHistory(exerciseId, limit)` → exercise-history.js

---

## Context Passing

For `#/exercise-history/:id`, the screen needs the exercise name and the parent `workoutId` (for back navigation). These are not available from the ID alone without an extra query. Pattern: set `window._exerciseContext` in workout-detail.js before navigating — consistent with `window._sessionWorkoutId` used in M3.

```js
// workout-detail.js — on history icon click:
window._exerciseContext = {
  exerciseId: exercise.id,
  exerciseName: exercise.name,
  workoutId: workoutId,
  workoutName: workout.name,
};
navigate("#/exercise-history/" + exercise.id);
```

```js
// exercise-history.js — in render():
const ctx = window._exerciseContext;
// ctx.exerciseName, ctx.workoutId, ctx.workoutName available
```

---

## Screen Designs

### 1. History Screen (`src/js/screens/history.js` — full rewrite)

**Responsibilities:** List all completed sessions; navigate to session log.

```
[Header: "Histórico"]
[Back: hidden]

[List of session cards]
  Each card:
    - workout_name  (bold, primary text)
    - formatted date  (dd/mm/yyyy  HH:mm)
    - "N exercícios feitos"  (secondary text)
    - chevron_right icon

[Empty state if no sessions]
  icon: history
  text: "Nenhum treino realizado ainda"
```

Navigation: tap card → `navigate('#/session-log/' + session.id)`

### 2. Session Log Screen (`src/js/screens/session-log.js` — new file)

**Responsibilities:** Show exercises + weights for a past session.

```
[Back button: visible → #/history]
[Header: workout_name + formatted date]

[List of exercise rows]
  Each row:
    - done icon (check_circle filled if completed=1, else radio_button_unchecked)
    - exercise_name
    - weight_kg + "kg"  (or "—" if null)

[Empty state if no rows]
  text: "Nenhum exercício registrado"
```

Data: `getSessionExercises(sessionId)` — already returns `exercise_name`, `weight_kg`, `completed`.

### 3. Exercise History Screen (`src/js/screens/exercise-history.js` — new file)

**Responsibilities:** Show last 10 weights for an exercise.

```
[Back button: visible → #/workout/:workoutId]
[Header: exerciseName + "em " + workoutName]

[List of weight entries]
  Each row:
    - formatted date  (dd/mm/yyyy)
    - weight_kg + "kg"

[Empty state if no entries]
  text: "Nenhum peso registrado ainda"
```

Data: `getWeightHistory(exerciseId, 10)`

---

## Router Changes

```js
// Add to router.js imports:
import * as sessionLogScreen from "./screens/session-log.js";
import * as exerciseHistoryScreen from "./screens/exercise-history.js";

// Add to getScreen() regex matching:
const sessionLogMatch = hash.match(/^#\/session-log\/(\d+)$/);
if (sessionLogMatch) {
  currentParams = { id: sessionLogMatch[1] };
  return sessionLogScreen;
}
const exerciseHistoryMatch = hash.match(/^#\/exercise-history\/(\d+)$/);
if (exerciseHistoryMatch) {
  currentParams = { id: exerciseHistoryMatch[1] };
  return exerciseHistoryScreen;
}
```

---

## workout-detail.js Changes

Each exercise row gets a secondary icon button for history:

```html
<button
  id="btn-ex-history-${ex.id}"
  class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant"
  aria-label="Histórico"
>
  <span class="material-symbols-outlined" style="font-size:20px">history</span>
</button>
```

Wired in the same event delegation block that already handles the remove button.

---

## Date Formatting

Utility function used across all 3 history screens:

```js
function formatDate(isoString) {
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
```

Each screen defines it locally (no shared utility file — YAGNI).

---

## File Checklist

| File                                 | Action                                   |
| ------------------------------------ | ---------------------------------------- |
| `src/js/dal.js`                      | Add `getCompletedSessions()`             |
| `src/js/router.js`                   | Add 2 imports + 2 regex routes           |
| `src/js/screens/history.js`          | Full rewrite (was placeholder)           |
| `src/js/screens/session-log.js`      | New file                                 |
| `src/js/screens/exercise-history.js` | New file                                 |
| `src/js/screens/workout-detail.js`   | Add history icon button per exercise row |
