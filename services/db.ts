import * as SQLite from 'expo-sqlite';

const DB_NAME = 'bibleapp.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS chapter_cache (
      bible_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      content TEXT NOT NULL,
      verses_json TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      PRIMARY KEY (bible_id, chapter_id)
    );

    -- Les annotations sont rattachees a la reference (livre.chapitre.verset), pas a une
    -- version specifique : un surlignage reste visible quelle que soit la traduction lue.
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY NOT NULL,
      chapter_id TEXT NOT NULL,
      verse_number TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (chapter_id, verse_number)
    );
    CREATE INDEX IF NOT EXISTS idx_highlights_chapter ON highlights (chapter_id);

    -- Une seule note par verset (editable), comme dans la plupart des apps d'etude biblique.
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      chapter_id TEXT NOT NULL,
      verse_number TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (chapter_id, verse_number)
    );
    CREATE INDEX IF NOT EXISTS idx_notes_chapter ON notes (chapter_id);

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY NOT NULL,
      chapter_id TEXT NOT NULL,
      verse_number TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (chapter_id, verse_number)
    );
    CREATE INDEX IF NOT EXISTS idx_bookmarks_chapter ON bookmarks (chapter_id);

    -- Stockage cle/valeur generique pour les preferences simples (ex. derniere position de lecture).
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}
