import React, { useMemo, useState } from 'react';
import { useMarketQuotes }   from '../../../hooks/useMarketQuotes';
import { useHideNumbers }    from '../../../context/HideNumbersContext';
import { useCurrency }       from '../../../context/CurrencyContext';
import { MARKET_FLAG }       from '../../../constants/ui';
import LoadingScreen         from '../../shared/LoadingScreen';
import ErrorScreen           from '../../shared/ErrorScreen';
import './MarketPage.css';

const MASK = '••••••';

const MARKET_OPTIONS = [
  { value: 'All', label: 'All'        },
  { value: 'US',  label: '🇺🇸 US'     },
  { value: 'ID',  label: '🇮🇩 IDX'    },
];

function pct(v) {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

function MarketPage() {
  const { quotes, loading, error } = useMarketQuotes();
  const { hidden }    = useHideNumbers();
  const { fmtMoney }  = useCurrency();
  const [market, setMarket] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = market === 'All' ? quotes : quotes.filter((q) => q.market === market);
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      rows = rows.filter((r) => r.ticker.includes(q) || r.name.toUpperCase().includes(q));
    }
    return rows;
  }, [quotes, market, search]);

  const gainers = useMemo(() => [...quotes].filter((q) => q.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 3), [quotes]);
  const losers  = useMemo(() => [...quotes].filter((q) => q.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 3), [quotes]);

  if (loading) return <LoadingScreen message="Fetching live prices…" />;
  if (error)   return <ErrorScreen message={error} />;

  const fmtPrice = (price, currency) => {
    if (price == null) return '—';
    if (hidden) return MASK;
    if (currency === 'IDR') return `Rp ${price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    return fmtMoney(price);
  };

  const fmtVol = (v) => {
    if (!v) return '—';
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toString();
  };

  const fmtCap = (v, currency) => {
    if (!v) return '—';
    if (hidden) return MASK;
    const unit = currency === 'IDR' ? 'T' : 'B';
    const div  = currency === 'IDR' ? 1e12 : 1e9;
    return `${(v / div).toFixed(2)}${unit}`;
  };

  return (
    <div className="market-page">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="section-title">Market Watchlist</h2>
          <p className="section-subtitle">Live prices from Yahoo Finance · {quotes.length} stocks</p>
        </div>
      </div>

      {/* Top movers */}
      {quotes.length > 0 && (
        <div className="mkt-movers-row">
          <div className="card mkt-movers-card">
            <p className="mkt-movers-label gain">Top Gainers</p>
            {gainers.map((q) => (
              <div key={q.ticker} className="mkt-mover-item">
                <span className="mkt-mover-ticker">{MARKET_FLAG[q.market]} {q.ticker}</span>
                <span className="mkt-mover-price">{fmtPrice(q.price, q.currency)}</span>
                <span className="mkt-mover-pct gain">{pct(q.changePct)}</span>
              </div>
            ))}
          </div>
          <div className="card mkt-movers-card">
            <p className="mkt-movers-label loss">Top Losers</p>
            {losers.map((q) => (
              <div key={q.ticker} className="mkt-mover-item">
                <span className="mkt-mover-ticker">{MARKET_FLAG[q.market]} {q.ticker}</span>
                <span className="mkt-mover-price">{fmtPrice(q.price, q.currency)}</span>
                <span className="mkt-mover-pct loss">{pct(q.changePct)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mkt-filter-row">
        <div className="type-filters">
          {MARKET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-pill ${market === opt.value ? 'active' : ''}`}
              onClick={() => setMarket(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          className="mkt-search"
          placeholder="Search ticker or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrap card">
        <table className="mkt-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th className="num">Price</th>
              <th className="num">Change</th>
              <th className="num">Day Range</th>
              <th className="num">Volume</th>
              <th className="num">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.ticker} className="mkt-row">
                <td>
                  <div className="mkt-ticker-cell">
                    <span className="ticker-sym">
                      <span className="market-flag">{MARKET_FLAG[q.market]}</span>
                      {q.ticker}
                    </span>
                    <span className="ticker-name">{q.name}</span>
                    <span className="ticker-exchange muted">{q.currency}</span>
                  </div>
                </td>
                <td className="num bold">{fmtPrice(q.price, q.currency)}</td>
                <td className="num">
                  <div className="mkt-change-cell">
                    <span className={q.change >= 0 ? 'gain' : 'loss'}>
                      {hidden ? MASK : (q.change != null ? `${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}` : '—')}
                    </span>
                    <span className={`badge ${q.changePct >= 0 ? 'badge-gain' : 'badge-loss'}`}>
                      {pct(q.changePct)}
                    </span>
                  </div>
                </td>
                <td className="num muted">
                  {q.dayLow != null && q.dayHigh != null
                    ? `${fmtPrice(q.dayLow, q.currency)} – ${fmtPrice(q.dayHigh, q.currency)}`
                    : '—'}
                </td>
                <td className="num muted">{fmtVol(q.volume)}</td>
                <td className="num muted">{fmtCap(q.marketCap, q.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="tx-empty">No stocks match your filter.</div>
        )}
      </div>
    </div>
  );
}

export default MarketPage;
