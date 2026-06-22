import { useMemo } from 'react';

import { CANON } from '@/constants/canon';
import { type ChapterSummary } from '@/services/bibleApi';

// Le nombre de chapitres par livre est invariant : derive du canon statique plutot
// que d'un appel reseau, pour rester independant du fournisseur de contenu choisi.
export function useChapterList(bookId: string | null) {
  const chapters = useMemo<ChapterSummary[]>(() => {
    const book = bookId ? CANON.find((candidate) => candidate.id === bookId) : undefined;
    if (!book) return [];
    return Array.from({ length: book.chapters }, (_, index) => ({
      id: `${book.id}.${index + 1}`,
      number: String(index + 1),
      bookId: book.id,
    }));
  }, [bookId]);

  return { chapters, loading: false, error: null as string | null, reload: () => {} };
}
