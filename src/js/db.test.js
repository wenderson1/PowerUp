import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must be hoisted before any imports of the module under test
vi.mock('@capacitor-community/sqlite', () => {
  const mockDB = {
    open: vi.fn().mockResolvedValue(undefined),
  };
  const mockSQLite = {
    addUpgradeStatement: vi.fn().mockResolvedValue(undefined),
    isConnection: vi.fn().mockResolvedValue({ result: false }),
    createConnection: vi.fn().mockResolvedValue(mockDB),
    retrieveConnection: vi.fn().mockResolvedValue(mockDB),
  };
  return {
    CapacitorSQLite: {},
    SQLiteConnection: vi.fn(() => mockSQLite),
    _mockSQLite: mockSQLite,
    _mockDB: mockDB,
  };
});

import { initDatabase, getDB } from './db.js';
import * as sqliteMock from '@capacitor-community/sqlite';

describe('db.js', () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset mock call counts between tests
    sqliteMock._mockSQLite.addUpgradeStatement.mockClear();
    sqliteMock._mockSQLite.isConnection.mockClear();
    sqliteMock._mockSQLite.createConnection.mockClear();
    sqliteMock._mockSQLite.retrieveConnection.mockClear();
    sqliteMock._mockDB.open.mockClear();
  });

  it('getDB() throws before initDatabase() is called', () => {
    expect(() => getDB()).toThrow('DB not initialized');
  });

  it('initDatabase() calls addUpgradeStatement with correct DB name and version 1', async () => {
    sqliteMock._mockSQLite.isConnection.mockResolvedValueOnce({ result: false });
    await initDatabase();
    expect(sqliteMock._mockSQLite.addUpgradeStatement).toHaveBeenCalledWith(
      'powerup',
      expect.arrayContaining([expect.objectContaining({ toVersion: 1 })])
    );
  });

  it('initDatabase() calls createConnection when no existing connection', async () => {
    sqliteMock._mockSQLite.isConnection.mockResolvedValueOnce({ result: false });
    await initDatabase();
    expect(sqliteMock._mockSQLite.createConnection).toHaveBeenCalledWith(
      'powerup', false, 'no-encryption', 1, false
    );
    expect(sqliteMock._mockSQLite.retrieveConnection).not.toHaveBeenCalled();
  });

  it('initDatabase() calls retrieveConnection when connection already exists', async () => {
    sqliteMock._mockSQLite.isConnection.mockResolvedValueOnce({ result: true });
    await initDatabase();
    expect(sqliteMock._mockSQLite.retrieveConnection).toHaveBeenCalledWith('powerup', false);
    expect(sqliteMock._mockSQLite.createConnection).not.toHaveBeenCalled();
  });
});
