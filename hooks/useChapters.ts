import { useCallback, useEffect, useState } from 'react';

import { type ChapterContent, getChapter, isBibleApiConfigured } from '@/services/bibleApi';
import { cacheChapter, getCachedChapter } from '@/services/chapterCache';

export type ChapterResult = {
  bibleId: string;
  chapter: ChapterContent | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
};

async function loadOne(bibleId: string, chapterId: string): Promise<ChapterResult> {
  try {
    const chapter = await getChapter(bibleId, chapterId);
    cacheChapter(chapter).catch(() => {
      // L'echec de mise en cache ne doit pas faire echouer l'affichage du chapitre.
    });
    return { bibleId, chapter, loading: false, error: null, fromCache: false };
  } catch (err) {
    const cached = await getCachedChapter(bibleId, chapterId).catch(() => null);
    if (cached) {
      return { bibleId, chapter: cached, loading: false, error: null, fromCache: true };
    }
    return {
      bibleId,
      chapter: null,
      loading: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
      fromCache: false,
    };
  }
}

export function useChapters(bibleIds: string[], chapterId: string) {
  const [results, setResults] = useState<Record<string, ChapterResult>>({});

  const load = useCallback(async () => {
    if (bibleIds.length === 0) return;

    setResults((prev) => {
      const next = { ...prev };
      bibleIds.forEach((bibleId) => {
        next[bibleId] = { bibleId, chapter: null, loading: true, error: null, fromCache: false };
      });
      return next;
    });

    await Promise.all(
      bibleIds.map(async (bibleId) => {
        const result = await loadOne(bibleId, chapterId);
        setResults((prev) => ({ ...prev, [bibleId]: result }));
      })
    );
  }, [bibleIds, chapterId]);

  useEffect(() => {
    load();
    // bibleIds est un tableau recree a chaque rendu : on le serialise pour ne relancer
    // les requetes que lorsque le contenu (versions selectionnees) change reellement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bibleIds.join(','), chapterId]);

  return {
    results: bibleIds.map((id) => results[id]).filter(Boolean) as ChapterResult[],
    reload: load,
    isConfigured: isBibleApiConfigured,
  };
}
