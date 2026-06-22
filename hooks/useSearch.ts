import { useCallback, useState } from 'react';

import { type SearchHit, searchVerses } from '@/services/bibleApi';

export function useSearch() {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (bibleId: string, query: string) => {
    const trimmed = query.trim();
    if (!bibleId || trimmed.length === 0) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      setResults(await searchVerses(bibleId, trimmed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searched, search };
}
