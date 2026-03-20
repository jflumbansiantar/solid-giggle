import { useEffect, useState } from 'react';
import { fetchHoldings } from '../api/portfolioApi';

export function useHoldings() {
  const [holdings, setHoldings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetchHoldings()
      .then(setHoldings)
      .catch(() => setError('Failed to load holdings.'))
      .finally(() => setLoading(false));
  }, []);

  return { holdings, loading, error };
}
