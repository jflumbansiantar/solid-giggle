import React, { useMemo, useState } from 'react';
import { useTransactions }       from '../../../hooks/useTransactions';
import { fmt, fmtUSD, fmtDate }  from '../../../utils/formatters';
import { useHideNumbers }        from '../../../context/HideNumbersContext';
import LoadingScreen             from '../../shared/LoadingScreen';
import ErrorScreen               from '../../shared/ErrorScreen';
import './Transactions.css';

const MASK = '••••••';

function Transactions() {
  const { transactions, loading, error } = useTransactions();
  const { hidden } = useHideNumbers();
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(
    () => typeFilter === 'All' ? transactions : transactions.filter((t) => t.type === typeFilter),
    [transactions, typeFilter]
  );

  const totals = useMemo(() => {
    const buys  = filtered.filter((t) => t.type === 'BUY').reduce((s, t)  => s + t.total, 0);
    const sells = filtered.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.total, 0);
    return { buys, sells, net: buys - sells };
  }, [filtered]);

  if (loading) return <LoadingScreen message="Loading transactions…" />;
  if (error)   return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtUSD(v);

  return (
    <div className="transactions-page">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Transactions</h2>
          <p className="section-subtitle">{transactions.length} recent trades</p>
        </div>
        <div className="type-filters">
          {['All', 'BUY', 'SELL'].map((t) => (
            <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary banner */}
      <div className="tx-summary card">
        <div className="tx-sum-cell"><span className="tx-sum-label">Total Bought</span><span className="tx-sum-val gain">{hidden ? MASK : `+${fmtUSD(totals.buys)}`}</span></div>
        <div className="tx-sum-cell"><span className="tx-sum-label">Total Sold</span><span className="tx-sum-val loss">{hidden ? MASK : `-${fmtUSD(totals.sells)}`}</span></div>
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Net Cash Flow</span>
          <span className={`tx-sum-val ${totals.net >= 0 ? 'loss' : 'gain'}`}>
            {hidden ? MASK : `${totals.net >= 0 ? '-' : '+'}${fmtUSD(Math.abs(totals.net))}`}
          </span>
        </div>
        <div className="tx-sum-cell"><span className="tx-sum-label">Transactions</span><span className="tx-sum-val">{filtered.length}</span></div>
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
                <div className="tx-left">
                  <div className={`tx-type-icon ${isBuy ? 'buy' : 'sell'}`}>{isBuy ? '↑' : '↓'}</div>
                  <div className="tx-info">
                    <div className="tx-title">
                      <span className="tx-ticker">{tx.ticker}</span>
                      <span className={`badge ${isBuy ? 'badge-buy' : 'badge-sell'}`}>{tx.type}</span>
                    </div>
                    <div className="tx-detail">
                      <span className="muted">{hidden ? MASK : fmt(tx.shares, 4)} shares</span>
                      <span className="tx-sep muted">·</span>
                      <span className="muted">@ {m(tx.price)}</span>
                    </div>
                  </div>
                </div>
                <div className="tx-right">
                  <span className={`tx-total ${isBuy ? 'loss' : 'gain'}`}>{hidden ? MASK : `${isBuy ? '-' : '+'}${fmtUSD(tx.total)}`}</span>
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
