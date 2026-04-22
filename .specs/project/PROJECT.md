# PowerUp

**Vision:** An offline-first Android workout tracking app that lets you create custom workout plans, log weights per exercise, and review your training history — all without an internet connection or account.
**For:** Individual gym-goers who want a simple, private, no-friction way to track their training.
**Solves:** The need to manage workout routines, track the weight used in each exercise, check weight progression over time, and record when each workout was completed — all in one place, offline.

## Goals

- Allow users to create and manage custom workouts and exercises with no setup friction (no account, no login).
- Enable real-time weight logging and exercise completion tracking during an active workout session.
- Surface a clear weight history per exercise and a workout log so the user can track progression.

## Tech Stack

**Core:**

- Runtime: Capacitor.js (wraps the web app as a native Android APK)
- Language: HTML + Vanilla JavaScript + Tailwind CSS (already prototyped)
- Database: SQLite via `@capacitor-community/sqlite` (local, offline, persistent)

**Key dependencies:**

- `@capacitor/core` — native bridge
- `@capacitor/android` — Android platform
- `@capacitor-community/sqlite` — local relational database
- Tailwind CSS (CDN) — design system / styling
- Google Fonts (Space Grotesk, Lexend) + Material Symbols — UI typography and icons

**Design system:** Kinetic Blue-Shift (dark theme, defined in `UI/DESIGN.md`)

## Scope

**v1 includes:**

- Workout management: create, list, and delete workouts with custom names
- Exercise management: add and remove exercises (with custom names) within a workout
- Session execution: start a workout, mark each exercise as done, log the weight (kg) used per set
- Weight history: view the last N logged weights for a given exercise
- Workout history: view a dated log of all completed workout sessions

**Explicitly out of scope:**

- User authentication or accounts
- Cloud sync or remote backup
- Social / sharing features
- iOS support
- Rest timers, rep counting, or built-in exercise library

## Constraints

- Platform: Android only
- Connectivity: fully offline — no network calls for core functionality
- Data: all data stored locally on device (SQLite)
- No timeline or team constraints specified
