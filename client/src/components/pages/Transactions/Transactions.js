import React, { useMemo, useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { fmt, fmtDate } from '../../../utils/formatters';
import { useHideNumbers } from '../../../context/HideNumbersContext';
import { useCurrency } from '../../../context/CurrencyContext';
import LoadingScreen from '../../shared/LoadingScreen';
import ErrorScreen from '../../shared/ErrorScreen';
import './Transactions.css';

const MASK = '••••••';

function Transactions() {
  const { transactions, loading, error } = useTransactions();
  const { hidden } = useHideNumbers();
  const { fmtMoney } = useCurrency();
  const [catFilter, setCatFilter] = useState('All');

  const filtered = useMemo(
    () => catFilter === 'All' ? transactions : transactions.filter((t) => (t.category || 'STOCK') === catFilter),
    [transactions, catFilter]
  );

  const totals = useMemo(() => {
    let inflows = 0;
    let outflows = 0;
    filtered.forEach((t) => {
      const cat = t.category || 'STOCK';
      if (cat === 'INCOME' || (cat === 'STOCK' && t.type === 'SELL')) {
        inflows += t.total;
      } else {
        // EXPENSE, DEBT, or STOCK BUY
        outflows += t.total;
      }
    });
    return { inflows, outflows, net: inflows - outflows };
  }, [filtered]);

  if (loading) return <LoadingScreen message="Loading transactions…" />;
  if (error) return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtMoney(v);

  return (
    <div className="transactions-page">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Transactions</h2>
          <p className="section-subtitle">{transactions.length} recent activities</p>
        </div>
        <div className="type-filters">
          {['All', 'INCOME', 'EXPENSE', 'DEBT', 'STOCK'].map((c) => (
            <button key={c} className={`filter-pill ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

        {/* Summary banner */}
        <div className="tx-summary card">
          <div className="tx-sum-cell"><span className="tx-sum-label">Total Inflow</span><span className="tx-sum-val gain">{hidden ? MASK : `+${fmtMoney(totals.inflows)}`}</span></div>
          <div className="tx-sum-cell"><span className="tx-sum-label">Total Outflow</span><span className="tx-sum-val loss">{hidden ? MASK : `-${fmtMoney(totals.outflows)}`}</span></div>
          <div className="tx-sum-cell">
            <span className="tx-sum-label">Net Cash Flow</span>
            <span className={`tx-sum-val ${totals.net < 0 ? 'loss' : 'gain'}`}>
              {hidden ? MASK : `${totals.net < 0 ? '-' : '+'}${fmtMoney(Math.abs(totals.net))}`}
            </span>
          </div>
          <div className="tx-sum-cell"><span className="tx-sum-label">Operations</span><span className="tx-sum-val">{filtered.length}</span></div>
        </div>

        {/* Transaction list */}
        <div className="tx-list card">
          {filtered.length === 0 ? (
            <div className="tx-empty">No transactions found.</div>
          ) : (
            filtered.map((tx, i) => {
              const cat = tx.category || 'STOCK';
              const name = tx.name || tx.ticker;

              let isInflow = false;
              let iconText = '';

              if (cat === 'INCOME') {
                isInflow = true; iconText = '💵';
              } else if (cat === 'STOCK' && tx.type === 'SELL') {
                isInflow = true; iconText = '📊';
              } else if (cat === 'STOCK' && tx.type === 'BUY') {
                isInflow = false; iconText = '📊';
              } else if (cat === 'DEBT') {
                isInflow = false; iconText = '💳';
              } else if (cat === 'EXPENSE') {
                isInflow = false; iconText = '🛒';
              }

              return (
                <div key={tx._id || tx.id} className={`tx-item ${i < filtered.length - 1 ? 'bordered' : ''}`}>
                  <div className="tx-left">
                    <div className={`tx-type-icon ${isInflow ? 'sell' : 'buy'}`} style={{ fontSize: 16 }}>{iconText}</div>
                    <div className="tx-info">
                      <div className="tx-title">
                        <span className="tx-ticker">{name}</span>
                        <span className={`badge ${isInflow ? 'badge-buy' : 'badge-sell'}`}>{tx.type}</span>
                        {cat !== 'STOCK' && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>{cat}</span>}
                      </div>
                      <div className="tx-detail">
                        {cat === 'STOCK' ? (
                          <>
                            <span className="muted">{hidden ? MASK : fmt(tx.shares, 4)} shares</span>
                            <span className="tx-sep muted">·</span>
                            <span className="muted">@ {m(tx.price)}</span>
                          </>
                        ) : (
                          <span className="muted">Recorded on {fmtDate(tx.date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="tx-right">
                    <span className={`tx-total ${!isInflow ? 'loss' : 'gain'}`}>{hidden ? MASK : `${!isInflow ? '-' : '+'}${fmtMoney(tx.total)}`}</span>
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
