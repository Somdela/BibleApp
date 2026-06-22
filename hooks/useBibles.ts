import { useCallback, useEffect, useState } from 'react';

import { type BibleVersion, getBibles, isBibleApiConfigured } from '@/services/bibleApi';
import { GETBIBLE_VERSIONS } from '@/services/getbibleApi';
import { ALLOWED_VERSION_MATCHES, PREFERRED_LANGUAGE_CODES } from '@/constants/bible';

function matchIndex(bible: BibleVersion): number {
  const haystack = `${bible.name} ${bible.abbreviation}`.toLowerCase();
  return ALLOWED_VERSION_MATCHES.findIndex((term) => haystack.includes(term));
}

export function useBibles() {
  const [bibles, setBibles] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isBibleApiConfigured) return;

    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        PREFERRED_LANGUAGE_CODES.map((code) => getBibles(code))
      );

      const byId = new Map<string, BibleVersion>();
      results.flat().forEach((bible) => byId.set(bible.id, bible));
      // Fournisseur secondaire (getbible.net) : versions du domaine public absentes
      // du catalogue API.Bible accessible avec la cle actuelle (ex. Segond 1910).
      GETBIBLE_VERSIONS.forEach((bible) => byId.set(bible.id, bible));

      setBibles(
        Array.from(byId.values())
          .map((bible) => ({ bible, index: matchIndex(bible) }))
          .filter(({ index }) => index !== -1)
          .sort((a, b) => a.index - b.index)
          .map(({ bible }) => bible)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { bibles, loading, error, reload: load, isConfigured: isBibleApiConfigured };
}
