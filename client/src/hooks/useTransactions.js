import { useEffect, useState } from 'react';
import { fetchTransactions } from '../api/portfolioApi';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading, error };
}
