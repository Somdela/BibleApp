import { type HighlightColor } from '@/constants/theme';
import { getDb } from '@/services/db';

export type ChapterAnnotations = {
  highlights: Record<string, HighlightColor>;
  notes: Record<string, string>;
  bookmarks: Set<string>;
};

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getChapterAnnotations(chapterId: string): Promise<ChapterAnnotations> {
  const db = await getDb();

  const [highlightRows, noteRows, bookmarkRows] = await Promise.all([
    db.getAllAsync<{ verse_number: string; color: string }>(
      'SELECT verse_number, color FROM highlights WHERE chapter_id = ?',
      [chapterId]
    ),
    db.getAllAsync<{ verse_number: string; text: string }>(
      'SELECT verse_number, text FROM notes WHERE chapter_id = ?',
      [chapterId]
    ),
    db.getAllAsync<{ verse_number: string }>('SELECT verse_number FROM bookmarks WHERE chapter_id = ?', [
      chapterId,
    ]),
  ]);

  return {
    highlights: Object.fromEntries(highlightRows.map((row) => [row.verse_number, row.color as HighlightColor])),
    notes: Object.fromEntries(noteRows.map((row) => [row.verse_number, row.text])),
    bookmarks: new Set(bookmarkRows.map((row) => row.verse_number)),
  };
}

export async function setHighlight(
  chapterId: string,
  verseNumber: string,
  color: HighlightColor
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO highlights (id, chapter_id, verse_number, color, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(chapter_id, verse_number) DO UPDATE SET color = excluded.color`,
    [randomId(), chapterId, verseNumber, color, Date.now()]
  );
}

export async function removeHighlight(chapterId: string, verseNumber: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM highlights WHERE chapter_id = ? AND verse_number = ?', [
    chapterId,
    verseNumber,
  ]);
}

export async function setNote(chapterId: string, verseNumber: string, text: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO notes (id, chapter_id, verse_number, text, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(chapter_id, verse_number) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`,
    [randomId(), chapterId, verseNumber, text, now, now]
  );
}

export async function removeNote(chapterId: string, verseNumber: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM notes WHERE chapter_id = ? AND verse_number = ?', [chapterId, verseNumber]);
}

export async function toggleBookmark(chapterId: string, verseNumber: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ verse_number: string }>(
    'SELECT verse_number FROM bookmarks WHERE chapter_id = ? AND verse_number = ?',
    [chapterId, verseNumber]
  );

  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE chapter_id = ? AND verse_number = ?', [
      chapterId,
      verseNumber,
    ]);
    return false;
  }

  await db.runAsync('INSERT INTO bookmarks (id, chapter_id, verse_number, created_at) VALUES (?, ?, ?, ?)', [
    randomId(),
    chapterId,
    verseNumber,
    Date.now(),
  ]);
  return true;
}
