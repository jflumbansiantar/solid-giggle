import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Transactions.css';

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const fmtDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const fmt = (n, d = 4) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d }).format(n);

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [typeFilter,   setTypeFilter]   = useState('All');

  useEffect(() => {
    axios.get('/api/transactions')
      .then((r) => setTransactions(r.data))
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => typeFilter === 'All' ? transactions : transactions.filter((t) => t.type === typeFilter),
    [transactions, typeFilter]
  );

  const totals = useMemo(() => {
    const buys  = filtered.filter((t) => t.type === 'BUY').reduce((s, t)  => s + t.total, 0);
    const sells = filtered.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.total, 0);
    return { buys, sells, net: buys - sells };
  }, [filtered]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading transactions…</span></div>;
  if (error)   return <div className="error-screen"><span>⚠ {error}</span></div>;

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Transactions</h2>
          <p className="section-subtitle">{transactions.length} recent trades</p>
        </div>
        <div className="type-filters">
          {['All', 'BUY', 'SELL'].map((t) => (
            <button
              key={t}
              className={`filter-pill ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary banner */}
      <div className="tx-summary card">
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Total Bought</span>
          <span className="tx-sum-val gain">+{fmtUSD(totals.buys)}</span>
        </div>
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Total Sold</span>
          <span className="tx-sum-val loss">-{fmtUSD(totals.sells)}</span>
        </div>
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Net Cash Flow</span>
          <span className={`tx-sum-val ${totals.net >= 0 ? 'loss' : 'gain'}`}>
            {totals.net >= 0 ? '-' : '+'}{fmtUSD(Math.abs(totals.net))}
          </span>
        </div>
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Transactions</span>
          <span className="tx-sum-val">{filtered.length}</span>
        </div>
      </div>

      {/* Transaction list */}
      <div className="tx-list card">
        {filtered.length === 0 ? (
          <div className="tx-empty">No transactions found.</div>
        ) : (
          filtered.map((tx, i) => {
            const isBuy = tx.type === 'BUY';
            return (
              <div key={tx.id} className={`tx-item ${i < filtered.length - 1 ? 'bordered' : ''}`}>
                {/* Left: icon + info */}
                <div className="tx-left">
                  <div className={`tx-type-icon ${isBuy ? 'buy' : 'sell'}`}>
                    {isBuy ? '↑' : '↓'}
                  </div>
                  <div className="tx-info">
                    <div className="tx-title">
                      <span className="tx-ticker">{tx.ticker}</span>
                      <span className={`badge ${isBuy ? 'badge-buy' : 'badge-sell'}`}>{tx.type}</span>
                    </div>
                    <div className="tx-detail">
                      <span className="muted">{fmt(tx.shares)} shares</span>
                      <span className="tx-sep muted">·</span>
                      <span className="muted">@ {fmtUSD(tx.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: value + date */}
                <div className="tx-right">
                  <span className={`tx-total ${isBuy ? 'loss' : 'gain'}`}>
                    {isBuy ? '-' : '+'}{fmtUSD(tx.total)}
                  </span>
                  <span className="tx-date muted">{fmtDate(tx.date)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Transactions;
