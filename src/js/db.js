import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db = null;

const DB_NAME = 'powerup';
const DB_VERSION = 1;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS workouts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id  INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  started_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS session_exercises (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight_kg   REAL,
  completed   INTEGER NOT NULL DEFAULT 0,
  logged_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export async function initDatabase() {
  const upgrades = [{ toVersion: DB_VERSION, statements: [SCHEMA_SQL] }];
  await sqlite.addUpgradeStatement(DB_NAME, upgrades);

  const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
  db = isConn
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);

  await db.open();
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}
