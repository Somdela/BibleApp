import { useCallback, useEffect, useState } from 'react';

import { type HighlightColor } from '@/constants/theme';
import {
  type ChapterAnnotations,
  getChapterAnnotations,
  removeHighlight,
  removeNote,
  setHighlight,
  setNote,
  toggleBookmark,
} from '@/services/annotations';

const EMPTY: ChapterAnnotations = { highlights: {}, notes: {}, bookmarks: new Set() };

export function useAnnotations(chapterId: string) {
  const [annotations, setAnnotations] = useState<ChapterAnnotations>(EMPTY);

  const reload = useCallback(async () => {
    setAnnotations(await getChapterAnnotations(chapterId));
  }, [chapterId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyHighlight = useCallback(
    async (verseNumber: string, color: HighlightColor) => {
      await setHighlight(chapterId, verseNumber, color);
      await reload();
    },
    [chapterId, reload]
  );

  const clearHighlight = useCallback(
    async (verseNumber: string) => {
      await removeHighlight(chapterId, verseNumber);
      await reload();
    },
    [chapterId, reload]
  );

  const saveNote = useCallback(
    async (verseNumber: string, text: string) => {
      if (text.trim().length === 0) {
        await removeNote(chapterId, verseNumber);
      } else {
        await setNote(chapterId, verseNumber, text.trim());
      }
      await reload();
    },
    [chapterId, reload]
  );

  const toggleVerseBookmark = useCallback(
    async (verseNumber: string) => {
      await toggleBookmark(chapterId, verseNumber);
      await reload();
    },
    [chapterId, reload]
  );

  return { annotations, applyHighlight, clearHighlight, saveNote, toggleVerseBookmark };
}
