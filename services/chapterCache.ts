import { type ChapterContent } from '@/services/bibleApi';
import { getDb } from '@/services/db';

export async function getCachedChapter(
  bibleId: string,
  chapterId: string
): Promise<ChapterContent | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    reference: string;
    content: string;
    verses_json: string;
  }>('SELECT reference, content, verses_json FROM chapter_cache WHERE bible_id = ? AND chapter_id = ?', [
    bibleId,
    chapterId,
  ]);

  if (!row) return null;

  const [bookId, number] = chapterId.split('.');
  return {
    id: chapterId,
    bibleId,
    bookId,
    number,
    reference: row.reference,
    content: row.content,
    verses: JSON.parse(row.verses_json),
  };
}

export async function cacheChapter(chapter: ChapterContent): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO chapter_cache (bible_id, chapter_id, reference, content, verses_json, cached_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(bible_id, chapter_id) DO UPDATE SET
       reference = excluded.reference,
       content = excluded.content,
       verses_json = excluded.verses_json,
       cached_at = excluded.cached_at`,
    [chapter.bibleId, chapter.id, chapter.reference, chapter.content, JSON.stringify(chapter.verses), Date.now()]
  );
}
