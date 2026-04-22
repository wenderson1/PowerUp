# Foundation Tasks

**Design**: `.specs/features/foundation/design.md`
**Status**: Done

---

## Test Strategy

**Unit tests:** Vitest, applied to `db.js` and `dal.js` only. Plugin mocked via `vi.mock`.
**Gate command (quick):** `npx vitest run`
**Gate command (build):** `npx vite build`
**All other layers:** `Tests: none` — manual verification on device/emulator.

---

## Execution Plan

```
Phase 1 — Scaffold (Sequential)
  T1

Phase 2 — Core Modules (Parallel)
  T1 done → T2 [P], T3 [P], T5 [P]

Phase 3 — Dependent Modules (Parallel within constraints)
  T3 done → T4
  T5 done → T6 [P], T7 [P]
  (T4 and T6/T7 can run concurrently — different dep chains)

Phase 4 — Entry Point (Sequential)
  T2 + T3 + T5 + T6 + T7 done → T8

Phase 5 — Android Platform (Sequential)
  T4 + T8 done → T9
```

```
T1 ──┬──→ T2 [P] ──────────────────────────┐
     ├──→ T3 [P] ──→ T4 ────────────────────┼──→ T8 ──→ T9
     └──→ T5 [P] ──┬──→ T6 [P] ─────────────┤
                   └──→ T7 [P] ─────────────┘
```

---

## Task Breakdown

### T1: Scaffold npm project + Capacitor + Vite config

**What**: Create `package.json`, `vite.config.js`, `capacitor.config.json`, and add `www/` + `android/` to `.gitignore`. Install all npm dependencies.
**Where**: `package.json`, `vite.config.js`, `capacitor.config.json`, `.gitignore`
**Depends on**: None
**Reuses**: Nothing
**Requirements**: FOUND-01, FOUND-02

**Done when**:

- [ ] `package.json` exists with `@capacitor/core`, `@capacitor/android`, `@capacitor-community/sqlite`, `vite`, `vitest` as dependencies
- [ ] `vite.config.js` sets `root: 'src'`, `build.outDir: '../www'`
- [ ] `capacitor.config.json` sets `appId: 'com.powerup.app'`, `appName: 'PowerUp'`, `webDir: 'www'`, `server.androidScheme: 'https'`
- [ ] `www/` and `android/` added to `.gitignore`
- [ ] `npx vite build` completes without errors (even with empty `src/`)

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `chore: scaffold Capacitor + Vite project`

---

### T2: Create `src/index.html` app shell [P]

**What**: Static HTML shell with app header, `<main id="screen">` mount point, and bottom navigation. Reuse header and bottom-nav markup from `UI/code.html`. Include Tailwind CDN config block verbatim.
**Where**: `src/index.html`
**Depends on**: T1
**Reuses**: Header markup and Tailwind `<script id="tailwind-config">` block from `UI/code.html`
**Requirements**: FOUND-06, FOUND-07, FOUND-08

**Done when**:

- [ ] `<header>` with POWERUP title and back/menu buttons matches prototype style
- [ ] `<main id="screen">` exists as the router mount point
- [ ] Bottom nav has two tabs: Workouts (`#/`) and History (`#/history`) with Material Symbol icons
- [ ] Each bottom nav tab has a `data-route` attribute and an `active` class mechanism
- [ ] Tailwind config `<script>` block with all design tokens copied from `UI/code.html`
- [ ] Google Fonts (Space Grotesk, Lexend) and Material Symbols `<link>` tags present
- [ ] `<script type="module" src="/js/app.js"></script>` at end of body

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(foundation): add app shell HTML with bottom navigation`

---

### T3: Create `src/js/db.js` — SQLite connection + schema [P]

**What**: Module that opens the SQLite connection, registers schema upgrade statements, creates all 4 tables on first launch, and exposes `initDatabase()` and `getDB()`.
**Where**: `src/js/db.js`, `vitest.config.js` (create test config), `src/js/db.test.js`
**Depends on**: T1
**Reuses**: Implementation pattern from `design.md` — `addUpgradeStatement` + `createConnection`
**Requirements**: FOUND-03, FOUND-04, FOUND-05

**Done when**:

- [ ] `initDatabase()` exported; calls `sqlite.addUpgradeStatement`, then `createConnection` or `retrieveConnection`, then `db.open()`
- [ ] Schema SQL defines all 4 tables with `CREATE TABLE IF NOT EXISTS` and `ON DELETE CASCADE` foreign keys (matching spec exactly)
- [ ] `getDB()` exported; throws `Error('DB not initialized')` if called before `initDatabase()` resolves
- [ ] `DB_NAME = 'powerup'`, `DB_VERSION = 1` constants used
- [ ] `vitest.config.js` created with `environment: 'node'`
- [ ] Unit tests mock `@capacitor-community/sqlite` via `vi.mock`
- [ ] Test: `getDB()` throws before init
- [ ] Test: `initDatabase()` calls `addUpgradeStatement` with correct DB name and version
- [ ] Test: second call to `initDatabase()` calls `retrieveConnection` (not `createConnection`)
- [ ] `npx vitest run` passes with all tests green

**Tests**: unit
**Gate**: quick — `npx vitest run`
**Commit**: `feat(foundation): add SQLite connection and schema initialization`

---

### T4: Create `src/js/dal.js` — Data Access Layer + unit tests

**What**: All 13 CRUD functions for the full v1 data model. Each function calls `getDB()` and executes a single SQL statement. Unit tests mock `db.js`.
**Where**: `src/js/dal.js`, `src/js/dal.test.js`
**Depends on**: T3
**Reuses**: `getDB()` from `db.js`; SQL patterns from `design.md`
**Requirements**: FOUND-10, FOUND-11, FOUND-12

**Done when**:

- [ ] All 13 functions implemented and exported: `getWorkouts`, `createWorkout`, `deleteWorkout`, `getExercises`, `addExercise`, `removeExercise`, `createSession`, `finishSession`, `getSessionExercises`, `logWeight`, `markExerciseDone`, `getWeightHistory`, `getSessions`
- [ ] Every function calls `getDB()` — no direct plugin imports
- [ ] Functions using `db.run()` return a shaped object using `result.changes.lastId`
- [ ] Functions using `db.query()` return `result.values ?? []`
- [ ] Unit tests mock `./db.js` via `vi.mock`
- [ ] Test: `getWorkouts()` calls `db.query` with correct SELECT SQL
- [ ] Test: `createWorkout('Treino A')` calls `db.run` with correct INSERT SQL and `['Treino A']`
- [ ] Test: `deleteWorkout(1)` calls `db.run` with correct DELETE SQL and `[1]`
- [ ] Test: `logWeight(1, 2, 80.5)` calls `db.run` with correct INSERT and `[1, 2, 80.5]`
- [ ] Test: `getWeightHistory(3, 5)` calls `db.query` with LIMIT clause and `[3, 5]`
- [ ] `npx vitest run` passes with all tests green

**Tests**: unit
**Gate**: quick — `npx vitest run`
**Commit**: `feat(foundation): add data access layer with all CRUD operations`

---

### T5: Create `src/js/router.js` — hash router [P]

**What**: Minimal hash-based router that maps URL hashes to screen modules, mounts them into `<main id="screen">`, and updates the active tab indicator in the bottom nav.
**Where**: `src/js/router.js`
**Depends on**: T1
**Reuses**: Nothing
**Requirements**: FOUND-06, FOUND-07, FOUND-08, FOUND-09

**Done when**:

- [ ] `start()` exported; registers `hashchange` and `load` event listeners; renders initial route
- [ ] `navigate(hash)` exported; sets `window.location.hash` and triggers render
- [ ] Route table: `''` and `'#/'` → workouts screen; `'#/history'` → history screen
- [ ] On route change, `render(container)` of the matched screen module is called with `document.getElementById('screen')`
- [ ] Active tab: router adds `active` class to the matching bottom-nav button and removes it from others (selects by `data-route` attribute)
- [ ] Unknown hash falls back to workouts screen (no crash)

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(foundation): add hash-based screen router`

---

### T6: Create `src/js/screens/workouts.js` — placeholder [P]

**What**: Minimal screen module with a `render(container)` function that inserts a placeholder workouts list UI into the given container element.
**Where**: `src/js/screens/workouts.js`
**Depends on**: T5
**Reuses**: Card and list styles from `UI/code.html` for visual consistency
**Requirements**: FOUND-06

**Done when**:

- [ ] `render(container)` exported; sets `container.innerHTML` with a placeholder heading ("Meus Treinos") and an empty state message
- [ ] Styled with Tailwind classes consistent with the design system (dark theme, primary color `#a4c9ff`)
- [ ] No imports of DAL — placeholder only, no data fetching in M1

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(foundation): add workouts screen placeholder`

---

### T7: Create `src/js/screens/history.js` — placeholder [P]

**What**: Minimal screen module with a `render(container)` function that inserts a placeholder history UI.
**Where**: `src/js/screens/history.js`
**Depends on**: T5
**Reuses**: Style patterns from `UI/code.html`
**Requirements**: FOUND-07

**Done when**:

- [ ] `render(container)` exported; sets `container.innerHTML` with a placeholder heading ("Histórico") and an empty state message
- [ ] Styled with Tailwind classes consistent with the design system
- [ ] No imports of DAL — placeholder only

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(foundation): add history screen placeholder`

---

### T8: Create `src/js/app.js` — entry point

**What**: App entry module that runs on `DOMContentLoaded`, calls `initDatabase()`, handles init errors, then calls `router.start()`.
**Where**: `src/js/app.js`
**Depends on**: T2, T3, T5, T6, T7
**Reuses**: `initDatabase` from `db.js`, `start` from `router.js`
**Requirements**: FOUND-01, FOUND-03

**Done when**:

- [ ] `DOMContentLoaded` listener calls `initDatabase()` then `router.start()` in sequence (await)
- [ ] If `initDatabase()` throws, error message is rendered into `<main id="screen">` — no blank screen
- [ ] Error message styled with design system colors (red/error token)
- [ ] No logic beyond init + error handling — thin orchestrator
- [ ] `npx vite build` completes with no errors

**Tests**: none
**Gate**: build — `npx vite build`
**Commit**: `feat(foundation): add app entry point with DB init and router bootstrap`

---

### T9: Add Android platform + verify build

**What**: Add the Capacitor Android platform, sync web assets, and verify the app builds and opens on an Android emulator. Fix any Android-specific config issues (packaging options, Gradle JDK, SDK versions).
**Where**: `android/` (generated), `capacitor.config.json`, `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/res/xml/data_extraction_rules.xml`
**Depends on**: T4, T8
**Reuses**: Android quirks documented in `@capacitor-community/sqlite` README (packaging options, Gradle config, data_extraction_rules)
**Requirements**: FOUND-01, FOUND-02, FOUND-09

**Done when**:

- [ ] `npx cap add android` completes without errors
- [ ] `npx cap sync` completes and copies `www/` assets to Android project
- [ ] `android/app/build.gradle` has `minSdkVersion = 23`, `compileSdkVersion = 35`, `targetSdkVersion = 35`
- [ ] `android/app/build.gradle` has `packagingOptions { exclude 'build-data.properties' }` (SQLite quirk)
- [ ] `AndroidManifest.xml` has `android:allowBackup="false"` and `android:dataExtractionRules="@xml/data_extraction_rules"`
- [ ] `data_extraction_rules.xml` created excluding root, database, sharedpref, external from backup
- [ ] App opens on Android emulator and displays the workouts screen with bottom navigation
- [ ] Tapping History tab navigates to History screen and highlights the tab
- [ ] Android back button on root screen exits app cleanly (no crash)

**Tests**: none
**Gate**: manual — launch on emulator, verify navigation and back button
**Commit**: `feat(foundation): add Android platform and verify build`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 — Scaffold

Phase 2 (Parallel — all depend only on T1):
  ├── T2 [P] — index.html app shell
  ├── T3 [P] — db.js + schema + unit tests
  └── T5 [P] — router.js

Phase 3 (Parallel — different dep chains):
  T3 done → T4   — dal.js + unit tests
  T5 done → T6 [P], T7 [P]   — screen placeholders

Phase 4 (Sequential — wires everything):
  T2 + T3 + T5 + T6 + T7 done → T8 — app.js entry point

Phase 5 (Sequential — Android):
  T4 + T8 done → T9 — Android platform + build verify
```

---

## Granularity Check

| Task                                | Scope                         | Status                              |
| ----------------------------------- | ----------------------------- | ----------------------------------- |
| T1: Scaffold npm + Capacitor + Vite | 4 config files + install      | ✅ Cohesive — all project bootstrap |
| T2: `index.html` app shell          | 1 file                        | ✅ Granular                         |
| T3: `db.js` + schema + unit tests   | 1 module + tests              | ✅ Granular                         |
| T4: `dal.js` + unit tests           | 1 module + tests              | ✅ Granular                         |
| T5: `router.js`                     | 1 module                      | ✅ Granular                         |
| T6: `screens/workouts.js`           | 1 module                      | ✅ Granular                         |
| T7: `screens/history.js`            | 1 module                      | ✅ Granular                         |
| T8: `app.js` entry point            | 1 module                      | ✅ Granular                         |
| T9: Android platform + build        | Platform setup + verification | ✅ Cohesive — all Android bootstrap |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status   |
| ---- | ---------------------- | ------------- | -------- |
| T1   | None                   | No arrows in  | ✅ Match |
| T2   | T1                     | T1 → T2       | ✅ Match |
| T3   | T1                     | T1 → T3       | ✅ Match |
| T4   | T3                     | T3 → T4       | ✅ Match |
| T5   | T1                     | T1 → T5       | ✅ Match |
| T6   | T5                     | T5 → T6       | ✅ Match |
| T7   | T5                     | T5 → T7       | ✅ Match |
| T8   | T2, T3, T5, T6, T7     | All five → T8 | ✅ Match |
| T9   | T4, T8                 | T4 + T8 → T9  | ✅ Match |

---

## Test Co-location Validation

| Task                    | Code Layer        | Test Strategy Requires | Task Says     | Status |
| ----------------------- | ----------------- | ---------------------- | ------------- | ------ |
| T1: Scaffold            | Config files      | none                   | none          | ✅ OK  |
| T2: index.html          | Static HTML       | none                   | none          | ✅ OK  |
| T3: db.js               | DB init module    | unit                   | unit          | ✅ OK  |
| T4: dal.js              | Data access layer | unit                   | unit          | ✅ OK  |
| T5: router.js           | Routing module    | none                   | none          | ✅ OK  |
| T6: screens/workouts.js | UI placeholder    | none                   | none          | ✅ OK  |
| T7: screens/history.js  | UI placeholder    | none                   | none          | ✅ OK  |
| T8: app.js              | Entry point       | none                   | none          | ✅ OK  |
| T9: Android platform    | Build + manual    | none                   | none (manual) | ✅ OK  |

---

## Requirement Traceability

| Requirement ID | Covered by |
| -------------- | ---------- |
| FOUND-01       | T1, T8, T9 |
| FOUND-02       | T1, T9     |
| FOUND-03       | T3         |
| FOUND-04       | T3         |
| FOUND-05       | T3         |
| FOUND-06       | T2, T5, T6 |
| FOUND-07       | T2, T5, T7 |
| FOUND-08       | T2, T5     |
| FOUND-09       | T9         |
| FOUND-10       | T4         |
| FOUND-11       | T4         |
| FOUND-12       | T4         |
