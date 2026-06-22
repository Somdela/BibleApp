import { useCallback, useState } from 'react';

import { type VerseExplanation, getVerseExplanation } from '@/services/aiExplanation';

export function useVerseExplanation() {
  const [explanation, setExplanation] = useState<VerseExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = useCallback(async (reference: string, verseText: string, translation?: string) => {
    setLoading(true);
    try {
      setExplanation(await getVerseExplanation(reference, verseText, translation));
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setExplanation(null), []);

  return { explanation, loading, fetchExplanation, reset };
}
