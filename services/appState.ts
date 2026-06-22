import { getDb } from '@/services/db';

export async function getStateValue(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_state WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setStateValue(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO app_state (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

export type LastPosition = { bookId: string; chapterNumber: string };

const LAST_POSITION_KEY = 'last_position';

export async function getLastPosition(): Promise<LastPosition | null> {
  const raw = await getStateValue(LAST_POSITION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.bookId === 'string' && typeof parsed?.chapterNumber === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastPosition(position: LastPosition): Promise<void> {
  await setStateValue(LAST_POSITION_KEY, JSON.stringify(position));
}
