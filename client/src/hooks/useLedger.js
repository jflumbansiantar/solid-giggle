import { useEffect, useState } from 'react';
import { fetchLedgerAccounts, fetchLedgerEntries, fetchLedgerSummary } from '../api/portfolioApi';

export function useLedger() {
  const [accounts, setAccounts] = useState([]);
  const [entries,  setEntries]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    Promise.all([fetchLedgerAccounts(), fetchLedgerEntries(), fetchLedgerSummary()])
      .then(([a, e, s]) => { setAccounts(a); setEntries(e); setSummary(s); })
      .catch(() => setError('Failed to load general ledger data.'))
      .finally(() => setLoading(false));
  }, []);

  return { accounts, entries, summary, loading, error };
}
