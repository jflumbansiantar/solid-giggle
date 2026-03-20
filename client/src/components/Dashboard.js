import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (n, decimals = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

/* ── Sub-components ───────────────────────────────────────────────────────── */
function SummaryCard({ title, value, sub, subClass, icon }) {
  return (
    <div className="summary-card card">
      <div className="sc-header">
        <span className="sc-title">{title}</span>
        <span className="sc-icon">{icon}</span>
      </div>
      <div className="sc-value">{value}</div>
      {sub && <div className={`sc-sub ${subClass || ''}`}>{sub}</div>}
    </div>
  );
}

function AllocationBar({ allocation }) {
  const colors = {
    Stock:  '#58a6ff',
    ETF:    '#3fb950',
    Crypto: '#f87171',
    Bond:   '#fbbf24',
  };

  return (
    <div className="allocation-bar-wrap">
      <div className="allocation-bar">
        {allocation.map((a) => (
          <div
            key={a.type}
            className="allocation-segment"
            style={{ width: `${a.percentage}%`, background: colors[a.type] || '#8b949e' }}
            title={`${a.type}: ${a.percentage}%`}
          />
        ))}
      </div>
      <div className="allocation-legend">
        {allocation.map((a) => (
          <div key={a.type} className="legend-item">
            <span className="legend-dot" style={{ background: colors[a.type] || '#8b949e' }} />
            <span className="legend-label">{a.type}</span>
            <span className="legend-pct">{a.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopMoverRow({ m }) {
  const isGain = m.dayChangePct >= 0;
  return (
    <div className="mover-row">
      <span className="mover-ticker">{m.ticker}</span>
      <span className="mover-name">{m.name}</span>
      <span className={isGain ? 'gain' : 'loss'}>
        {isGain ? '+' : ''}{fmt(m.dayChangePct)}%
      </span>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
function Dashboard() {
  const [portfolio, setPortfolio]   = useState(null);
  const [holdings,  setHoldings]    = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/portfolio'),
      axios.get('/api/holdings'),
    ])
      .then(([pRes, hRes]) => {
        setPortfolio(pRes.data);
        setHoldings(hRes.data);
      })
      .catch(() => setError('Failed to load portfolio data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>Loading portfolio…</span>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <span>⚠ {error}</span>
      <small>Make sure the backend server is running on port 5000.</small>
    </div>
  );

  const { totalValue, totalGainLoss, totalReturn, dayGainLoss, dayReturn, allocation, topMovers, holdingsCount } = portfolio;
  const isPositiveDay   = dayGainLoss   >= 0;
  const isPositiveTotal = totalGainLoss >= 0;

  // Top 5 by market value for the quick-look list
  const topHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);

  return (
    <div className="dashboard">
      {/* ── Summary Cards ── */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Portfolio Overview</h2>
            <p className="section-subtitle">As of market close · {holdingsCount} positions</p>
          </div>
        </div>

        <div className="summary-grid">
          <SummaryCard
            title="Total Portfolio Value"
            value={fmtUSD(totalValue)}
            sub="All holdings combined"
            icon="💼"
          />
          <SummaryCard
            title="Today's Gain / Loss"
            value={
              <span className={isPositiveDay ? 'gain' : 'loss'}>
                {isPositiveDay ? '+' : ''}{fmtUSD(dayGainLoss)}
              </span>
            }
            sub={`${isPositiveDay ? '+' : ''}${fmt(dayReturn)}% today`}
            subClass={isPositiveDay ? 'gain' : 'loss'}
            icon={isPositiveDay ? '📈' : '📉'}
          />
          <SummaryCard
            title="Total Return"
            value={
              <span className={isPositiveTotal ? 'gain' : 'loss'}>
                {isPositiveTotal ? '+' : ''}{fmtUSD(totalGainLoss)}
              </span>
            }
            sub={`${isPositiveTotal ? '+' : ''}${fmt(totalReturn)}% all-time`}
            subClass={isPositiveTotal ? 'gain' : 'loss'}
            icon={isPositiveTotal ? '🚀' : '⚠️'}
          />
          <SummaryCard
            title="Positions"
            value={holdingsCount}
            sub={`${allocation.length} asset classes`}
            icon="📊"
          />
        </div>
      </section>

      {/* ── Middle Row ── */}
      <div className="dashboard-mid">
        {/* Allocation */}
        <section className="section card allocation-card">
          <div className="section-header">
            <h2 className="section-title">Asset Allocation</h2>
          </div>
          <AllocationBar allocation={allocation} />
          <div className="allocation-values">
            {allocation.map((a) => (
              <div key={a.type} className="alloc-val-row">
                <span className="muted">{a.type}</span>
                <span>{fmtUSD(a.value)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top movers */}
        <section className="section card movers-card">
          <div className="section-header">
            <h2 className="section-title">Top Movers Today</h2>
          </div>
          <div className="movers-list">
            {topMovers.map((m) => (
              <TopMoverRow key={m.ticker} m={m} />
            ))}
          </div>
        </section>

        {/* Quick Holdings */}
        <section className="section card quick-card">
          <div className="section-header">
            <h2 className="section-title">Largest Positions</h2>
          </div>
          <div className="quick-holdings">
            {topHoldings.map((h) => (
              <div key={h.ticker} className="quick-row">
                <div className="quick-left">
                  <span className="quick-ticker">{h.ticker}</span>
                  <span className="quick-name muted">{h.type}</span>
                </div>
                <div className="quick-right">
                  <span className="quick-value">{fmtUSD(h.marketValue)}</span>
                  <span className={h.gainLossPct >= 0 ? 'gain' : 'loss'}>
                    {h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
