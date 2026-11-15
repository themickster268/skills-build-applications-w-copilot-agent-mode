import { useEffect, useState } from 'react';

export function useApiData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unexpected response error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  return { data, error, loading: data === null && error === null };
}
