import * as SQLite from 'expo-sqlite';
import { Snippet, SnippetFormData } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('snipvault.db');
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'Other',
      tags TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);
    CREATE INDEX IF NOT EXISTS idx_snippets_is_favorite ON snippets(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);
  `);
};

export const getAllSnippets = async (): Promise<Snippet[]> => {
  const database = await getDatabase();
  return await database.getAllAsync<Snippet>(
    'SELECT * FROM snippets ORDER BY updated_at DESC'
  );
};

export const searchSnippets = async (query: string): Promise<Snippet[]> => {
  const database = await getDatabase();
  const searchTerm = `%${query}%`;
  return await database.getAllAsync<Snippet>(
    `SELECT * FROM snippets 
     WHERE title LIKE ? OR code LIKE ? OR tags LIKE ? OR language LIKE ?
     ORDER BY updated_at DESC`,
    [searchTerm, searchTerm, searchTerm, searchTerm]
  );
};

export const getFavoriteSnippets = async (): Promise<Snippet[]> => {
  const database = await getDatabase();
  return await database.getAllAsync<Snippet>(
    'SELECT * FROM snippets WHERE is_favorite = 1 ORDER BY updated_at DESC'
  );
};

export const getSnippetById = async (id: number): Promise<Snippet | null> => {
  const database = await getDatabase();
  return await database.getFirstAsync<Snippet>(
    'SELECT * FROM snippets WHERE id = ?',
    [id]
  );
};

export const createSnippet = async (data: SnippetFormData): Promise<number> => {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO snippets (title, code, language, tags, is_favorite)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.title,
      data.code,
      data.language,
      JSON.stringify(data.tags),
      data.is_favorite ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
};

export const updateSnippet = async (
  id: number,
  data: Partial<SnippetFormData>
): Promise<void> => {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.code !== undefined) {
    fields.push('code = ?');
    values.push(data.code);
  }
  if (data.language !== undefined) {
    fields.push('language = ?');
    values.push(data.language);
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(data.tags));
  }
  if (data.is_favorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(data.is_favorite ? 1 : 0);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  if (fields.length > 1) {
    await database.runAsync(
      `UPDATE snippets SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
};

export const toggleFavorite = async (id: number, current: number): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE snippets SET is_favorite = ?, updated_at = datetime('now') WHERE id = ?",
    [current === 1 ? 0 : 1, id]
  );
};

export const deleteSnippet = async (id: number): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM snippets WHERE id = ?', [id]);
};

export const getSnippetsByLanguage = async (language: string): Promise<Snippet[]> => {
  const database = await getDatabase();
  return await database.getAllAsync<Snippet>(
    'SELECT * FROM snippets WHERE language = ? ORDER BY updated_at DESC',
    [language]
  );
};

export const getSnippetCount = async (): Promise<number> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM snippets'
  );
  return result?.count ?? 0;
};

export const attachFilePath = async (id: number, filePath: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE snippets SET file_path = ?, updated_at = datetime('now') WHERE id = ?",
    [filePath, id]
  );
};
