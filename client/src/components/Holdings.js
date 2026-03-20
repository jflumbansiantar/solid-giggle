import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Holdings.css';

const fmt  = (n, d = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const TYPE_BADGE = { Stock: 'badge-type-stock', ETF: 'badge-type-etf', Crypto: 'badge-type-crypto' };

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <span className="sort-icon neutral">↕</span>;
  return <span className="sort-icon active">{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('All');
  const [sort,     setSort]     = useState({ col: 'marketValue', dir: 'desc' });

  useEffect(() => {
    axios.get('/api/holdings')
      .then((r) => setHoldings(r.data))
      .catch(() => setError('Failed to load holdings.'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['All', ...Array.from(new Set(holdings.map((h) => h.type)))];

  const filtered = useMemo(() => {
    let rows = filter === 'All' ? holdings : holdings.filter((h) => h.type === filter);
    rows = [...rows].sort((a, b) => {
      const av = a[sort.col];
      const bv = b[sort.col];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [holdings, filter, sort]);

  const totals = useMemo(() => {
    const totalValue  = filtered.reduce((s, h) => s + h.marketValue,  0);
    const totalCost   = filtered.reduce((s, h) => s + h.costBasis,    0);
    const totalGain   = filtered.reduce((s, h) => s + h.gainLoss,     0);
    const totalDayGL  = filtered.reduce((s, h) => s + h.dayGainLoss,  0);
    return { totalValue, totalCost, totalGain, totalDayGL };
  }, [filtered]);

  const handleSort = (col) => {
    setSort((prev) =>
      prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' }
    );
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading holdings…</span></div>;
  if (error)   return <div className="error-screen"><span>⚠ {error}</span></div>;

  return (
    <div className="holdings-page">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Holdings</h2>
          <p className="section-subtitle">{holdings.length} positions · Sorted by {sort.col}</p>
        </div>
        {/* Filter pills */}
        <div className="type-filters">
          {types.map((t) => (
            <button
              key={t}
              className={`filter-pill ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Totals banner */}
      <div className="totals-banner card">
        <div className="total-cell">
          <span className="total-label">Market Value</span>
          <span className="total-val">{fmtUSD(totals.totalValue)}</span>
        </div>
        <div className="total-cell">
          <span className="total-label">Cost Basis</span>
          <span className="total-val">{fmtUSD(totals.totalCost)}</span>
        </div>
        <div className="total-cell">
          <span className="total-label">Total Gain / Loss</span>
          <span className={`total-val ${totals.totalGain >= 0 ? 'gain' : 'loss'}`}>
            {totals.totalGain >= 0 ? '+' : ''}{fmtUSD(totals.totalGain)}
          </span>
        </div>
        <div className="total-cell">
          <span className="total-label">Day Gain / Loss</span>
          <span className={`total-val ${totals.totalDayGL >= 0 ? 'gain' : 'loss'}`}>
            {totals.totalDayGL >= 0 ? '+' : ''}{fmtUSD(totals.totalDayGL)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap card">
        <table className="holdings-table">
          <thead>
            <tr>
              {[
                { col: 'ticker',       label: 'Ticker'        },
                { col: 'type',         label: 'Type'          },
                { col: 'shares',       label: 'Shares'        },
                { col: 'avgCost',      label: 'Avg Cost'      },
                { col: 'currentPrice', label: 'Price'         },
                { col: 'dayChangePct', label: 'Day Change'    },
                { col: 'marketValue',  label: 'Market Value'  },
                { col: 'gainLoss',     label: 'Gain / Loss'   },
                { col: 'gainLossPct',  label: 'Return %'      },
              ].map(({ col, label }) => (
                <th key={col} onClick={() => handleSort(col)} className="sortable-th">
                  <span>{label}</span>
                  <SortIcon col={col} sort={sort} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id} className="holding-row">
                <td>
                  <div className="ticker-cell">
                    <span className="ticker-sym">{h.ticker}</span>
                    <span className="ticker-name">{h.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${TYPE_BADGE[h.type] || ''}`}>{h.type}</span>
                </td>
                <td className="num">{fmt(h.shares, h.type === 'Crypto' ? 4 : 2)}</td>
                <td className="num">{fmtUSD(h.avgCost)}</td>
                <td className="num">{fmtUSD(h.currentPrice)}</td>
                <td className="num">
                  <span className={h.dayChangePct >= 0 ? 'gain' : 'loss'}>
                    {h.dayChangePct >= 0 ? '+' : ''}{fmt(h.dayChangePct)}%
                  </span>
                </td>
                <td className="num bold">{fmtUSD(h.marketValue)}</td>
                <td className="num">
                  <span className={h.gainLoss >= 0 ? 'gain' : 'loss'}>
                    {h.gainLoss >= 0 ? '+' : ''}{fmtUSD(h.gainLoss)}
                  </span>
                </td>
                <td className="num">
                  <span className={`badge ${h.gainLossPct >= 0 ? 'badge-gain' : 'badge-loss'}`}>
                    {h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Holdings;
