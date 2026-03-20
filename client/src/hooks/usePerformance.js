import { useEffect, useState } from 'react';
import { fetchPerformance } from '../api/portfolioApi';

export function usePerformance() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchPerformance()
      .then(setData)
      .catch(() => setError('Failed to load performance data.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
