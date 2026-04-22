# Foundation Specification

## Problem Statement

The PowerUp UI exists as a static HTML prototype but cannot run as a real Android app yet. There is no project scaffold, no local database, and no screen routing. The Foundation milestone establishes everything needed before any user-facing feature can be built: a working Capacitor Android project, a persistent SQLite database with the full schema, and a minimal navigation shell that connects screens.

## Goals

- [ ] Capacitor project builds and deploys to an Android device/emulator as a working APK.
- [ ] SQLite database initializes on first launch with the full v1 schema — no data loss on subsequent launches.
- [ ] Navigation shell renders and allows moving between the Workouts list screen and the History screen.

## Out of Scope

| Feature                                        | Reason                                  |
| ---------------------------------------------- | --------------------------------------- |
| Any real workout/exercise data or CRUD screens | Belongs to M2+ features                 |
| iOS platform                                   | v1 is Android only                      |
| Cloud sync or remote API calls                 | App is fully offline                    |
| Authentication / user accounts                 | Explicitly excluded from v1             |
| Automated tests / CI pipeline                  | No testing constraints specified for v1 |

---

## User Stories

### P1: Project Scaffold ⭐ MVP

**User Story**: As a developer, I want a Capacitor project configured for Android so that the HTML/Tailwind UI can be packaged and run as a native Android APK.

**Why P1**: Nothing else can be built or tested on-device without this.

**Acceptance Criteria**:

1. WHEN `npx cap run android` is executed THEN the app SHALL launch on an Android emulator or device without errors.
2. WHEN the app launches THEN it SHALL display the existing HTML UI (or the navigation shell) inside the Android WebView.
3. WHEN the web assets are updated and `npx cap sync` is run THEN the changes SHALL be reflected in the next build.

**Independent Test**: Run `npx cap run android` — app opens on emulator showing the UI shell.

---

### P1: SQLite Schema & Initialization ⭐ MVP

**User Story**: As the app, I want a local SQLite database to be initialized on first launch so that all user data can be stored and queried offline.

**Why P1**: Every feature depends on persistent storage. No schema = no data.

**Acceptance Criteria**:

1. WHEN the app launches for the first time THEN the database SHALL be created with all tables defined in the schema.
2. WHEN the app is launched again after being closed THEN the database SHALL already exist and SHALL NOT be re-created or wiped.
3. WHEN the schema version changes in a future update THEN the migration system SHALL apply changes without data loss.

**Independent Test**: Launch app twice; use a debug query to confirm tables exist and any previously inserted test row persists.

**Schema:**

```sql
-- Workout plans
CREATE TABLE IF NOT EXISTS workouts (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  created_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

-- Exercises belonging to a workout
CREATE TABLE IF NOT EXISTS exercises (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- A session = one time the user ran a workout
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  started_at  TEXT   NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);

-- Which exercises were done in a session + the weight used
CREATE TABLE IF NOT EXISTS session_exercises (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight_kg   REAL,
  completed   INTEGER NOT NULL DEFAULT 0,  -- 0 = not done, 1 = done
  logged_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

---

### P1: Navigation Shell ⭐ MVP

**User Story**: As a user, I want to navigate between the main screens of the app so that I can access workouts and my history from anywhere.

**Why P1**: Without routing, the app is a single static page — no feature can be reached.

**Acceptance Criteria**:

1. WHEN the app opens THEN it SHALL display the Workouts list screen by default.
2. WHEN the user taps "History" in the bottom navigation THEN the app SHALL navigate to the History screen.
3. WHEN the user taps "Workouts" in the bottom navigation THEN the app SHALL return to the Workouts list screen.
4. WHEN navigating between screens THEN the active tab SHALL be visually highlighted in the bottom nav.
5. WHEN the Android hardware back button is pressed on the root screens THEN the app SHALL NOT crash (graceful back handling).

**Independent Test**: Tap between Workouts and History tabs — each renders its placeholder screen and the active tab indicator updates.

---

### P2: Data Access Layer (DAL)

**User Story**: As a developer, I want a JavaScript module that wraps all SQLite queries so that app screens never write raw SQL directly.

**Why P2**: Not needed for the navigation shell to work, but essential before M2 features are implemented. Keeps SQL centralized and prevents duplication.

**Acceptance Criteria**:

1. WHEN any screen needs to read or write data THEN it SHALL use DAL functions, never raw SQL.
2. WHEN a DAL function is called THEN it SHALL return a Promise that resolves with typed results or rejects with a descriptive error.
3. WHEN the database is not yet initialized THEN DAL calls SHALL wait for initialization before executing.

**DAL functions to expose (v1 minimum):**

- `getWorkouts()` → `Workout[]`
- `createWorkout(name)` → `Workout`
- `deleteWorkout(id)` → `void`
- `getExercises(workoutId)` → `Exercise[]`
- `addExercise(workoutId, name)` → `Exercise`
- `removeExercise(id)` → `void`
- `createSession(workoutId)` → `Session`
- `finishSession(sessionId)` → `void`
- `getSessionExercises(sessionId)` → `SessionExercise[]`
- `logWeight(sessionId, exerciseId, weightKg)` → `SessionExercise`
- `markExerciseDone(sessionExerciseId)` → `void`
- `getWeightHistory(exerciseId, limit)` → `WeightLog[]`
- `getSessions(workoutId)` → `Session[]`

**Independent Test**: Call `createWorkout("Test")` then `getWorkouts()` — the new workout appears in the returned list.

---

## Edge Cases

- WHEN the device storage is full THEN the SQLite initialization SHALL fail gracefully with a visible error message rather than a silent crash.
- WHEN `@capacitor-community/sqlite` plugin is missing or misconfigured THEN the app SHALL display a setup error screen rather than a blank white screen.
- WHEN the user navigates using the Android back button from the root screen THEN the app SHALL exit (or show exit confirmation) rather than crash.

---

## Requirement Traceability

| Requirement ID | Story                                                     | Phase  | Status  |
| -------------- | --------------------------------------------------------- | ------ | ------- |
| FOUND-01       | P1: Project Scaffold — Capacitor builds to Android        | Design | Pending |
| FOUND-02       | P1: Project Scaffold — Web assets sync via `npx cap sync` | Design | Pending |
| FOUND-03       | P1: SQLite Schema — DB created on first launch            | Design | Pending |
| FOUND-04       | P1: SQLite Schema — DB persists across restarts           | Design | Pending |
| FOUND-05       | P1: SQLite Schema — Migration support                     | Design | Pending |
| FOUND-06       | P1: Navigation Shell — Workouts screen is default         | Design | Pending |
| FOUND-07       | P1: Navigation Shell — Bottom nav routes between screens  | Design | Pending |
| FOUND-08       | P1: Navigation Shell — Active tab highlighted             | Design | Pending |
| FOUND-09       | P1: Navigation Shell — Back button handled gracefully     | Design | Pending |
| FOUND-10       | P2: DAL — All screens use DAL, never raw SQL              | Design | Pending |
| FOUND-11       | P2: DAL — Full set of v1 CRUD functions exposed           | Design | Pending |
| FOUND-12       | P2: DAL — DAL waits for DB init before executing          | Design | Pending |

**Coverage:** 12 total, 0 mapped to tasks, 12 unmapped ⚠️

---

## Success Criteria

- [ ] `npx cap run android` builds and opens the app on an Android emulator with no errors.
- [ ] On first launch, all 4 tables exist in the SQLite database.
- [ ] On second launch, a test row inserted in the previous run is still present.
- [ ] Tapping Workouts and History in the bottom nav renders each screen and updates the active tab indicator.
- [ ] DAL `createWorkout` + `getWorkouts` round-trip works end-to-end.
