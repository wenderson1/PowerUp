# Workout Management Specification

**Milestone**: M2 — Workout & Exercise Management

## Problem Statement

The app shell is running on Android with navigation and a persistent database, but there is no way for the user to interact with real data. The Workouts screen shows a static placeholder and the workout-detail screen doesn't exist yet. M2 gives users full control over their workout plans and exercise lists before any session is started.

## Goals

- [ ] User can view, create, and delete workout plans from the Workouts screen.
- [ ] User can navigate into a workout and view, add, and remove exercises.
- [ ] All changes persist across app restarts via the existing SQLite DAL.

## Out of Scope

| Feature                               | Reason                            |
| ------------------------------------- | --------------------------------- |
| Starting or logging a workout session | Belongs to M3 — Session Execution |
| Editing workout name after creation   | Deferred — not in v1 requirements |
| Editing exercise name after creation  | Deferred — not in v1 requirements |
| Reordering exercises (drag-and-drop)  | Deferred — not in v1 requirements |
| Exercise sets/reps configuration      | Deferred — not in v1 requirements |
| Weight logging                        | Belongs to M3 — Session Execution |

---

## Requirements

| ID    | Requirement                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| WM-01 | The Workouts screen SHALL fetch and display all workouts from the database on load.       |
| WM-02 | The Workouts screen SHALL display an empty-state message when no workouts exist.          |
| WM-03 | The user SHALL be able to create a new workout by entering a name and confirming.         |
| WM-04 | The user SHALL be able to delete a workout with a confirmation step before deletion.      |
| WM-05 | Tapping a workout card SHALL navigate to the Workout Detail screen for that workout.      |
| WM-06 | The Workout Detail screen SHALL display the workout name and fetch all exercises on load. |
| WM-07 | The Workout Detail screen SHALL display an empty-state message when no exercises exist.   |
| WM-08 | The user SHALL be able to add a new exercise to a workout by entering a name.             |
| WM-09 | The user SHALL be able to remove an exercise with a confirmation step before removal.     |
| WM-10 | The router SHALL support parameterized routes (`#/workout/:id`) and expose the params.    |
| WM-11 | The Workout Detail screen back button SHALL navigate back to the Workouts list (`#/`).    |

---

## User Stories

### P1: View Workout List ⭐ MVP

**User Story**: As a user, I want to see all my workout plans on the home screen so that I know what I have available.

**Why P1**: Entry point for all workout-related features — nothing else in M2 works without this.

**Acceptance Criteria**:

1. WHEN the Workouts screen loads THEN it SHALL call `getWorkouts()` and render a card for each result.
2. WHEN there are no workouts THEN it SHALL display an empty-state message ("Nenhum treino cadastrado ainda.").
3. WHEN `getWorkouts()` returns results THEN each card SHALL display the workout name.

**Independent Test**: Insert a workout directly via DAL in console, reload Workouts screen — card appears.

---

### P1: Create Workout ⭐ MVP

**User Story**: As a user, I want to create a new workout by typing its name so that I can start organizing my training.

**Why P1**: The list is useless if it can't be populated.

**Acceptance Criteria**:

1. WHEN the user taps the FAB (+ button) THEN a form/modal SHALL appear with a text input for the workout name.
2. WHEN the user submits a non-empty name THEN `createWorkout(name)` SHALL be called and the list SHALL refresh showing the new workout.
3. WHEN the user submits an empty name THEN the form SHALL NOT submit and SHALL indicate the input is required.
4. WHEN the user cancels the form THEN the modal SHALL close without creating a workout.

**Independent Test**: Tap FAB, type "Push A", confirm — new card appears in list.

---

### P1: Delete Workout ⭐ MVP

**User Story**: As a user, I want to delete a workout I no longer need, with a confirmation step so I don't delete by accident.

**Why P1**: Without delete, the list grows unbounded with no recourse.

**Acceptance Criteria**:

1. WHEN the user taps the delete button on a workout card THEN a confirmation dialog SHALL appear asking to confirm deletion.
2. WHEN the user confirms deletion THEN `deleteWorkout(id)` SHALL be called and the workout SHALL be removed from the list.
3. WHEN the user cancels the confirmation THEN the workout SHALL NOT be deleted and the list SHALL remain unchanged.

**Independent Test**: Tap delete on a card, confirm — card disappears; cancel — card remains.

---

### P1: Navigate to Workout Detail ⭐ MVP

**User Story**: As a user, I want to tap a workout to open its detail screen so that I can manage its exercises.

**Why P1**: Required to access Exercise Management features.

**Acceptance Criteria**:

1. WHEN the user taps a workout card THEN the app SHALL navigate to `#/workout/:id` where `:id` is the workout's database ID.
2. WHEN the Workout Detail screen loads THEN it SHALL display the workout name as the page heading.
3. WHEN the back button in the app header is tapped THEN the app SHALL navigate back to `#/`.

**Independent Test**: Tap a workout card — URL hash changes to `#/workout/1`, detail screen renders with correct name, back button returns to list.

---

### P1: View Exercise List ⭐ MVP

**User Story**: As a user, I want to see all exercises in a workout so that I know what the plan contains.

**Why P1**: Core content of the workout detail screen.

**Acceptance Criteria**:

1. WHEN the Workout Detail screen loads THEN it SHALL call `getExercises(workoutId)` and render a row for each result.
2. WHEN there are no exercises THEN it SHALL display an empty-state message ("Nenhum exercício adicionado ainda.").
3. WHEN exercises exist THEN each row SHALL display the exercise name.

**Independent Test**: Add exercises via DAL in console, navigate to detail — exercises appear.

---

### P1: Add Exercise ⭐ MVP

**User Story**: As a user, I want to add exercises to a workout by typing their names so that I can build my plan.

**Why P1**: The exercise list is useless if it can't be populated.

**Acceptance Criteria**:

1. WHEN the user taps the add button THEN a form SHALL appear with a text input for the exercise name.
2. WHEN the user submits a non-empty name THEN `addExercise(workoutId, name)` SHALL be called and the list SHALL refresh.
3. WHEN the user submits an empty name THEN the form SHALL NOT submit and SHALL indicate the input is required.
4. WHEN the user cancels THEN the form SHALL close without adding an exercise.

**Independent Test**: Tap add, type "Supino Reto", confirm — exercise appears in list.

---

### P1: Remove Exercise ⭐ MVP

**User Story**: As a user, I want to remove an exercise from a workout with a confirmation step so I don't remove it by accident.

**Why P1**: Without delete, the exercise list can't be corrected.

**Acceptance Criteria**:

1. WHEN the user taps the remove button on an exercise row THEN a confirmation dialog SHALL appear.
2. WHEN the user confirms THEN `removeExercise(id)` SHALL be called and the exercise SHALL be removed from the list.
3. WHEN the user cancels THEN the exercise SHALL NOT be removed.

**Independent Test**: Tap remove on an exercise, confirm — row disappears; cancel — row remains.

---

## Edge Cases

- WHEN `getWorkouts()` or `getExercises()` rejects THEN the screen SHALL display an error message rather than crashing.
- WHEN the user navigates to `#/workout/999` for a non-existent workout ID THEN the screen SHALL gracefully show an error or empty state — no crash.
- WHEN the workout name input contains only whitespace THEN it SHALL be treated as empty (validation trims input before checking).
