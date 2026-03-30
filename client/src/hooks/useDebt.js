import { useEffect, useState } from 'react';
import { fetchDebts } from '../api/portfolioApi';

export function useDebt() {
  const [debts,   setDebts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchDebts()
      .then(setDebts)
      .catch(() => setError('Failed to load debts.'))
      .finally(() => setLoading(false));
  }, []);

  return { debts, loading, error };
}
