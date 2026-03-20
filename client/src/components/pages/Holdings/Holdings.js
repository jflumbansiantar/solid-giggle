import React, { useMemo, useState } from 'react';
import { useHoldings }        from '../../../hooks/useHoldings';
import { fmt, fmtUSD }        from '../../../utils/formatters';
import { TYPE_BADGE, MARKET_FLAG, MARKET_EXCHANGE } from '../../../constants/ui';
import { useHideNumbers }     from '../../../context/HideNumbersContext';
import LoadingScreen          from '../../shared/LoadingScreen';
import ErrorScreen            from '../../shared/ErrorScreen';
import SortIcon               from './SortIcon';
import './Holdings.css';

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
  { value: 'All', label: 'All Markets'     },
  { value: 'US',  label: '🇺🇸 US'          },
  { value: 'ID',  label: '🇮🇩 Indonesia'   },
];

function Holdings() {
  const { holdings, loading, error } = useHoldings();
  const { hidden } = useHideNumbers();
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [marketFilter, setMarketFilter] = useState('All');
  const [sort, setSort] = useState({ col: 'marketValue', dir: 'desc' });

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

  const m = (v) => hidden ? MASK : fmtUSD(v);

  return (
    <div className="holdings-page">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="section-title">Holdings</h2>
          <p className="section-subtitle">{holdings.length} positions · Sorted by {sort.col}</p>
        </div>
        <div className="type-filters">
          {types.map((t) => (
            <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Market filter */}
      <div className="type-filters" style={{ marginBottom: 20 }}>
        {MARKET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-pill ${marketFilter === opt.value ? 'active' : ''}`}
            onClick={() => setMarketFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Totals banner */}
      <div className="totals-banner card">
        <div className="total-cell"><span className="total-label">Market Value</span><span className="total-val">{m(totals.totalValue)}</span></div>
        <div className="total-cell"><span className="total-label">Cost Basis</span><span className="total-val">{m(totals.totalCost)}</span></div>
        <div className="total-cell">
          <span className="total-label">Total Gain / Loss</span>
          <span className={`total-val ${totals.totalGain >= 0 ? 'gain' : 'loss'}`}>
            {hidden ? MASK : `${totals.totalGain >= 0 ? '+' : ''}${fmtUSD(totals.totalGain)}`}
          </span>
        </div>
        <div className="total-cell">
          <span className="total-label">Day Gain / Loss</span>
          <span className={`total-val ${totals.totalDayGL >= 0 ? 'gain' : 'loss'}`}>
            {hidden ? MASK : `${totals.totalDayGL >= 0 ? '+' : ''}${fmtUSD(totals.totalDayGL)}`}
          </span>
        </div>
      </div>

      {/* Table */}
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
                <td className="num"><span className={h.gainLoss >= 0 ? 'gain' : 'loss'}>{hidden ? MASK : `${h.gainLoss >= 0 ? '+' : ''}${fmtUSD(h.gainLoss)}`}</span></td>
                <td className="num"><span className={`badge ${h.gainLossPct >= 0 ? 'badge-gain' : 'badge-loss'}`}>{h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Holdings;
