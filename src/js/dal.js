import { getDB } from './db.js';

export async function getWorkouts() {
  const db = getDB();
  const result = await db.query('SELECT * FROM workouts ORDER BY created_at DESC', []);
  return result.values ?? [];
}

export async function createWorkout(name) {
  const db = getDB();
  const result = await db.run('INSERT INTO workouts (name) VALUES (?)', [name]);
  return { id: result.changes.lastId, name };
}

export async function deleteWorkout(id) {
  const db = getDB();
  await db.run('DELETE FROM workouts WHERE id = ?', [id]);
}

export async function getExercises(workoutId) {
  const db = getDB();
  const result = await db.query(
    'SELECT * FROM exercises WHERE workout_id = ? ORDER BY sort_order ASC',
    [workoutId]
  );
  return result.values ?? [];
}

export async function addExercise(workoutId, name) {
  const db = getDB();
  const result = await db.run(
    'INSERT INTO exercises (workout_id, name) VALUES (?, ?)',
    [workoutId, name]
  );
  return { id: result.changes.lastId, workout_id: workoutId, name };
}

export async function removeExercise(id) {
  const db = getDB();
  await db.run('DELETE FROM exercises WHERE id = ?', [id]);
}

export async function createSession(workoutId) {
  const db = getDB();
  const result = await db.run(
    'INSERT INTO sessions (workout_id) VALUES (?)',
    [workoutId]
  );
  return { id: result.changes.lastId, workout_id: workoutId, finished_at: null };
}

export async function finishSession(sessionId) {
  const db = getDB();
  await db.run(
    "UPDATE sessions SET finished_at = datetime('now') WHERE id = ?",
    [sessionId]
  );
}

export async function getSessionExercises(sessionId) {
  const db = getDB();
  const result = await db.query(
    `SELECT se.*, e.name AS exercise_name
     FROM session_exercises se
     JOIN exercises e ON e.id = se.exercise_id
     WHERE se.session_id = ?`,
    [sessionId]
  );
  return result.values ?? [];
}

export async function logWeight(sessionId, exerciseId, weightKg) {
  const db = getDB();
  const result = await db.run(
    'INSERT INTO session_exercises (session_id, exercise_id, weight_kg) VALUES (?, ?, ?)',
    [sessionId, exerciseId, weightKg]
  );
  return { id: result.changes.lastId, session_id: sessionId, exercise_id: exerciseId, weight_kg: weightKg };
}

export async function markExerciseDone(sessionExerciseId) {
  const db = getDB();
  await db.run(
    'UPDATE session_exercises SET completed = 1 WHERE id = ?',
    [sessionExerciseId]
  );
}

export async function getWeightHistory(exerciseId, limit) {
  const db = getDB();
  const result = await db.query(
    `SELECT weight_kg, logged_at FROM session_exercises
     WHERE exercise_id = ? AND weight_kg IS NOT NULL
     ORDER BY logged_at DESC LIMIT ?`,
    [exerciseId, limit]
  );
  return result.values ?? [];
}

export async function getSessions(workoutId) {
  const db = getDB();
  const result = await db.query(
    'SELECT * FROM sessions WHERE workout_id = ? ORDER BY started_at DESC',
    [workoutId]
  );
  return result.values ?? [];
}
