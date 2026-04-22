import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./db.js", () => {
  const mockDB = {
    query: vi.fn(),
    run: vi.fn(),
  };
  return {
    getDB: vi.fn(() => mockDB),
    _mockDB: mockDB,
  };
});

import {
  getWorkouts,
  createWorkout,
  deleteWorkout,
  getExercises,
  addExercise,
  removeExercise,
  createSession,
  finishSession,
  getSessionExercises,
  logWeight,
  markExerciseDone,
  getWeightHistory,
  getSessions,
} from "./dal.js";
import * as dbMock from "./db.js";

describe("dal.js", () => {
  beforeEach(() => {
    dbMock._mockDB.query.mockClear();
    dbMock._mockDB.run.mockClear();
    dbMock._mockDB.query.mockResolvedValue({ values: [] });
    dbMock._mockDB.run.mockResolvedValue({ changes: { lastId: 1 } });
  });

  it("getWorkouts() calls db.query with SELECT workouts", async () => {
    await getWorkouts();
    expect(dbMock._mockDB.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      expect.anything(),
    );
  });

  it("getWorkouts() returns empty array when values is null", async () => {
    dbMock._mockDB.query.mockResolvedValueOnce({ values: null });
    const result = await getWorkouts();
    expect(result).toEqual([]);
  });

  it("createWorkout('Treino A') calls db.run with INSERT and ['Treino A']", async () => {
    await createWorkout("Treino A");
    expect(dbMock._mockDB.run).toHaveBeenCalledWith(
      expect.stringContaining("INSERT"),
      ["Treino A"],
    );
  });

  it("deleteWorkout(1) calls db.run with DELETE and [1]", async () => {
    await deleteWorkout(1);
    expect(dbMock._mockDB.run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE"),
      [1],
    );
  });

  it("logWeight(1, 2, 80.5) calls db.run with INSERT and [1, 2, 80.5]", async () => {
    await logWeight(1, 2, 80.5);
    expect(dbMock._mockDB.run).toHaveBeenCalledWith(
      expect.stringContaining("INSERT"),
      [1, 2, 80.5],
    );
  });

  it("getWeightHistory(3, 5) calls db.query with LIMIT and [3, 5]", async () => {
    await getWeightHistory(3, 5);
    expect(dbMock._mockDB.query).toHaveBeenCalledWith(
      expect.stringContaining("LIMIT"),
      [3, 5],
    );
  });
});
