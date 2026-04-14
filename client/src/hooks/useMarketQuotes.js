import { useEffect, useState } from 'react';
import { fetchMarketQuotes } from '../api/portfolioApi';

export function useMarketQuotes() {
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchMarketQuotes()
      .then(setQuotes)
      .catch(() => setError('Failed to load market quotes.'))
      .finally(() => setLoading(false));
  }, []);

  return { quotes, loading, error };
}
