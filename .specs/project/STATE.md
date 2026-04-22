# State

**Last Updated:** 2026-04-22
**Current Work:** M4 — History & Progression (Planning)

---

## Recent Decisions (Last 60 days)

### AD-001: Capacitor.js as Android wrapper (2026-04-21)

**Decision:** Use Capacitor.js to wrap the existing HTML/Tailwind/JS UI into a native Android APK.
**Reason:** The UI prototype already exists in HTML + Tailwind. Capacitor allows reusing it directly without rewriting to a native framework (Kotlin/Compose) or React Native.
**Trade-off:** Slightly lower native feel compared to Jetpack Compose; web-view based rendering.
**Impact:** Web assets live in `www/` or `src/`; Android-specific config in `android/`. Build requires Node.js + Android Studio.

### AD-002: SQLite via @capacitor-community/sqlite (2026-04-21)

**Decision:** Use `@capacitor-community/sqlite` for local persistent storage.
**Reason:** Relational model fits the data (workouts → exercises → sessions → logs). SQLite is well-supported on Android and works fully offline.
**Trade-off:** More setup than AsyncStorage or localStorage, but provides querying power needed for history and weight logs.
**Impact:** Requires a DB init step on app launch and a JS data access module wrapping all queries.

### AD-003: No authentication or cloud sync in v1 (2026-04-21)

**Decision:** v1 ships with no user accounts, no authentication, and no remote data sync.
**Reason:** Stated user requirement. Reduces complexity significantly.
**Trade-off:** Data is device-local only — no backup if device is lost.
**Impact:** All screens are immediately accessible; no auth guard needed anywhere.

---

## Active Blockers

_None_

---

## Lessons Learned

_None yet_

---

## Quick Tasks Completed

| #   | Description        | Date       | Commit | Status  |
| --- | ------------------ | ---------- | ------ | ------- |
| 001 | Created .gitignore | 2026-04-21 | —      | ✅ Done |

---

## Deferred Ideas

- Rest timer between sets
- Built-in exercise library
- Export to CSV
- iOS support
- PR (personal record) tracking per exercise
- Charts and progression graphs
