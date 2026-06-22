import { useEffect, useState } from 'react';

import { type LastPosition, getLastPosition } from '@/services/appState';

export function useLastPosition() {
  const [position, setPosition] = useState<LastPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLastPosition()
      .then(setPosition)
      .finally(() => setLoading(false));
  }, []);

  return { position, loading };
}
