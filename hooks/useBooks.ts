import { useMemo } from 'react';

import { CANON } from '@/constants/canon';
import { type BookSummary } from '@/services/bibleApi';

// La structure des 66 livres est invariante : on la derive du canon statique plutot
// que d'un appel reseau, pour rester independante du fournisseur de contenu choisi
// (API.Bible, getbible.net, ...).
export function useBooks() {
  const books = useMemo<BookSummary[]>(
    () => CANON.map((book) => ({ id: book.id, name: book.name, nameLong: book.name })),
    []
  );

  return { books, loading: false, error: null as string | null, reload: () => {} };
}
