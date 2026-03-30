import React, { useMemo, useState } from 'react';
import { useHoldings }        from '../../../hooks/useHoldings';
import { useTransactions }    from '../../../hooks/useTransactions';
import { fmt, fmtDate }       from '../../../utils/formatters';
import { TYPE_BADGE, MARKET_FLAG, MARKET_EXCHANGE } from '../../../constants/ui';
import { useHideNumbers }     from '../../../context/HideNumbersContext';
import { useCurrency }        from '../../../context/CurrencyContext';
import LoadingScreen          from '../../shared/LoadingScreen';
import ErrorScreen            from '../../shared/ErrorScreen';
import SortIcon               from './SortIcon';
import PerformanceChart       from '../Performance/PerformanceChart';
import './Holdings.css';
import '../Transactions/Transactions.css';

const MASK = '••••••';

const COLUMNS = [
  { col: 'ticker',       label: 'Ticker'       },
  { col: 'type',         label: 'Type'         },
  { col: 'shares',       label: 'Shares'       },
  { col: 'avgCost',      label: 'Avg Cost'     },
  { col: 'currentPrice', label: 'Price'        },
  { col: 'dayChangePct', label: 'Day Change'   },
  { col: 'marketValue',  label: 'Market Value' },
  { col: 'gainLoss',     label: 'Gain / Loss'  },
  { col: 'gainLossPct',  label: 'Return %'     },
];

const MARKET_OPTIONS = [
  { value: 'All', label: 'All Markets'   },
  { value: 'US',  label: '🇺🇸 US'        },
  { value: 'ID',  label: '🇮🇩 Indonesia' },
];

// ── Transactions sub-view ─────────────────────────────────────────────────────
function TransactionsView({ hidden, fmtMoney }) {
  const { transactions, loading, error } = useTransactions();
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

  const m = (v) => hidden ? MASK : fmtMoney(v);

  return (
    <>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <p className="section-subtitle">{transactions.length} trades</p>
        <div className="type-filters">
          {['All', 'BUY', 'SELL'].map((t) => (
            <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="tx-summary card">
        <div className="tx-sum-cell"><span className="tx-sum-label">Total Bought</span><span className="tx-sum-val gain">{hidden ? MASK : `+${fmtMoney(totals.buys)}`}</span></div>
        <div className="tx-sum-cell"><span className="tx-sum-label">Total Sold</span><span className="tx-sum-val loss">{hidden ? MASK : `-${fmtMoney(totals.sells)}`}</span></div>
        <div className="tx-sum-cell">
          <span className="tx-sum-label">Net Cash Flow</span>
          <span className={`tx-sum-val ${totals.net >= 0 ? 'loss' : 'gain'}`}>
            {hidden ? MASK : `${totals.net >= 0 ? '-' : '+'}${fmtMoney(Math.abs(totals.net))}`}
          </span>
        </div>
        <div className="tx-sum-cell"><span className="tx-sum-label">Count</span><span className="tx-sum-val">{filtered.length}</span></div>
      </div>

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
                  <span className={`tx-total ${isBuy ? 'loss' : 'gain'}`}>{hidden ? MASK : `${isBuy ? '-' : '+'}${fmtMoney(tx.total)}`}</span>
                  <span className="tx-date muted">{fmtDate(tx.date)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ── Holdings main view ────────────────────────────────────────────────────────
function Holdings() {
  const { holdings, loading, error } = useHoldings();
  const { hidden } = useHideNumbers();
  const { fmtMoney } = useCurrency();

  const [view,         setView]         = useState('holdings'); // 'holdings' | 'transactions' | 'performance'
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [marketFilter, setMarketFilter] = useState('All');
  const [sort,         setSort]         = useState({ col: 'marketValue', dir: 'desc' });

  const types = ['All', ...Array.from(new Set(holdings.map((h) => h.type)))];

  const filtered = useMemo(() => {
    let rows = typeFilter === 'All' ? holdings : holdings.filter((h) => h.type === typeFilter);
    if (marketFilter !== 'All') rows = rows.filter((h) => h.market === marketFilter);
    return [...rows].sort((a, b) => {
      const cmp = typeof a[sort.col] === 'string'
        ? a[sort.col].localeCompare(b[sort.col])
        : a[sort.col] - b[sort.col];
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [holdings, typeFilter, marketFilter, sort]);

  const totals = useMemo(() => ({
    totalValue: filtered.reduce((s, h) => s + h.marketValue, 0),
    totalCost:  filtered.reduce((s, h) => s + h.costBasis,   0),
    totalGain:  filtered.reduce((s, h) => s + h.gainLoss,    0),
    totalDayGL: filtered.reduce((s, h) => s + h.dayGainLoss, 0),
  }), [filtered]);

  const handleSort = (col) =>
    setSort((prev) => prev.col === col
      ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: 'desc' }
    );

  if (loading) return <LoadingScreen message="Loading holdings…" />;
  if (error)   return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtMoney(v);

  return (
    <div className="holdings-page">
      {/* Header row */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="section-title">
            {view === 'holdings' ? 'Portfolio' : view === 'transactions' ? 'Transactions' : 'Performance'}
          </h2>
          <p className="section-subtitle">
            {view === 'holdings'
              ? `${holdings.length} positions · Sorted by ${sort.col}`
              : view === 'transactions' ? 'Trade history' : 'Portfolio vs benchmark'}
          </p>
        </div>
        {view === 'holdings' && (
          <div className="type-filters">
            {types.map((t) => (
              <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Market filter row + Transactions toggle */}
      <div className="holdings-filter-row" style={{ marginBottom: 20 }}>
        <div className="type-filters">
          {MARKET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-pill ${view === 'holdings' && marketFilter === opt.value ? 'active' : ''}`}
              onClick={() => { setView('holdings'); setMarketFilter(opt.value); }}

            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="filter-divider" />

        <button
          className={`filter-pill filter-pill-tx ${view === 'transactions' ? 'active' : ''}`}
          onClick={() => setView(view === 'transactions' ? 'holdings' : 'transactions')}
        >
          ↕ Transactions
        </button>

        <button
          className={`filter-pill filter-pill-tx ${view === 'performance' ? 'active' : ''}`}
          onClick={() => setView(view === 'performance' ? 'holdings' : 'performance')}
        >
          ↗ Performance
        </button>
      </div>

      {/* Content */}
      {view === 'transactions' ? (
        <TransactionsView hidden={hidden} fmtMoney={fmtMoney} />
      ) : view === 'performance' ? (
        <PerformanceChart />
      ) : (
        <>
          <div className="totals-banner card">
            <div className="total-cell"><span className="total-label">Market Value</span><span className="total-val">{m(totals.totalValue)}</span></div>
            <div className="total-cell"><span className="total-label">Cost Basis</span><span className="total-val">{m(totals.totalCost)}</span></div>
            <div className="total-cell">
              <span className="total-label">Total Gain / Loss</span>
              <span className={`total-val ${totals.totalGain >= 0 ? 'gain' : 'loss'}`}>
                {hidden ? MASK : `${totals.totalGain >= 0 ? '+' : ''}${fmtMoney(totals.totalGain)}`}
              </span>
            </div>
            <div className="total-cell">
              <span className="total-label">Day Gain / Loss</span>
              <span className={`total-val ${totals.totalDayGL >= 0 ? 'gain' : 'loss'}`}>
                {hidden ? MASK : `${totals.totalDayGL >= 0 ? '+' : ''}${fmtMoney(totals.totalDayGL)}`}
              </span>
            </div>
          </div>

          <div className="table-wrap card">
            <table className="holdings-table">
              <thead>
                <tr>
                  {COLUMNS.map(({ col, label }) => (
                    <th key={col} onClick={() => handleSort(col)} className="sortable-th">
                      <span>{label}<SortIcon col={col} sort={sort} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="holding-row">
                    <td>
                      <div className="ticker-cell">
                        <span className="ticker-sym">
                          <span className="market-flag">{MARKET_FLAG[h.market]}</span>
                          {h.ticker}
                        </span>
                        <span className="ticker-name">{h.name}</span>
                        <span className="ticker-exchange muted">{MARKET_EXCHANGE[h.market]}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${TYPE_BADGE[h.type] || ''}`}>{h.type}</span></td>
                    <td className="num">{hidden ? MASK : fmt(h.shares, h.type === 'Crypto' ? 4 : 2)}</td>
                    <td className="num">{m(h.avgCost)}</td>
                    <td className="num">{m(h.currentPrice)}</td>
                    <td className="num"><span className={h.dayChangePct >= 0 ? 'gain' : 'loss'}>{h.dayChangePct >= 0 ? '+' : ''}{fmt(h.dayChangePct)}%</span></td>
                    <td className="num bold">{m(h.marketValue)}</td>
                    <td className="num"><span className={h.gainLoss >= 0 ? 'gain' : 'loss'}>{hidden ? MASK : `${h.gainLoss >= 0 ? '+' : ''}${fmtMoney(h.gainLoss)}`}</span></td>
                    <td className="num"><span className={`badge ${h.gainLossPct >= 0 ? 'badge-gain' : 'badge-loss'}`}>{h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Holdings;
