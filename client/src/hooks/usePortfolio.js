import { useEffect, useState } from 'react';
import { fetchPortfolio, fetchHoldings } from '../api/portfolioApi';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings,  setHoldings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    Promise.all([fetchPortfolio(), fetchHoldings()])
      .then(([portfolioData, holdingsData]) => {
        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      })
      .catch(() => setError('Failed to load portfolio data.'))
      .finally(() => setLoading(false));
  }, []);

  return { portfolio, holdings, loading, error };
}
