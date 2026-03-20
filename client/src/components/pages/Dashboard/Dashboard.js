import React from 'react';
import { usePortfolio }        from '../../../hooks/usePortfolio';
import { fmt }                 from '../../../utils/formatters';
import { MARKET_FLAG }         from '../../../constants/ui';
import { useHideNumbers }      from '../../../context/HideNumbersContext';
import { useCurrency }         from '../../../context/CurrencyContext';
import LoadingScreen            from '../../shared/LoadingScreen';
import ErrorScreen              from '../../shared/ErrorScreen';
import AllocationBar            from './AllocationBar';
import TopMoverRow              from './TopMoverRow';
import './Dashboard.css';

const MASK = '••••••';

const MARKET_INFO = {
  US: { flag: '🇺🇸', name: 'US Market',  exchange: 'NYSE / NASDAQ' },
  ID: { flag: '🇮🇩', name: 'IDX Market', exchange: 'Indonesia Stock Exchange' },
};

function MarketCard({ mkt, m, hidden, fmtMoney }) {
  const info    = MARKET_INFO[mkt.market] || {};
  const isPosDay   = mkt.dayGL   >= 0;
  const isPosTotal = mkt.totalGL >= 0;
  return (
    <div className="card market-breakdown-card">
      <div className="mkt-header">
        <span className="mkt-flag">{info.flag}</span>
        <div>
          <div className="mkt-name">{info.name}</div>
          <div className="mkt-exchange">{info.exchange}</div>
        </div>
      </div>
      <div className="mkt-value">{m(mkt.value)}</div>
      <div className="mkt-stats">
        <div className="mkt-stat-row">
          <span className="muted">Holdings</span>
          <span>{mkt.count} positions</span>
        </div>
        <div className="mkt-stat-row">
          <span className="muted">Today</span>
          <span className={isPosDay ? 'gain' : 'loss'}>
            {hidden ? MASK : `${isPosDay ? '+' : ''}${fmtMoney(mkt.dayGL)}`}
          </span>
        </div>
        <div className="mkt-stat-row">
          <span className="muted">All-time</span>
          <span className={isPosTotal ? 'gain' : 'loss'}>
            {hidden ? MASK : `${isPosTotal ? '+' : ''}${fmtMoney(mkt.totalGL)}`}
            {' '}
            <span className="mkt-pct">({isPosTotal ? '+' : ''}{fmt(mkt.totalGLPct)}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function RecentTxRow({ tx, hidden, fmtMoney }) {
  const isBuy = tx.type === 'BUY';
  const flag  = MARKET_FLAG[tx.market] || '';
  const date  = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className="recent-row">
      <span className={`recent-badge ${isBuy ? 'badge-buy-type' : 'badge-sell-type'}`}>{tx.type}</span>
      <span className="recent-ticker">{flag} {tx.ticker}</span>
      <span className="recent-shares muted">{tx.shares} sh</span>
      <span className="recent-date muted">{date}</span>
      <span className="recent-total">{hidden ? MASK : fmtMoney(tx.total)}</span>
    </div>
  );
}

function Dashboard() {
  const { portfolio, holdings, loading, error } = usePortfolio();
  const { hidden } = useHideNumbers();
  const { fmtMoney } = useCurrency();

  if (loading) return <LoadingScreen message="Loading portfolio…" />;
  if (error)   return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtMoney(v);

  const {
    totalValue, totalGainLoss, totalReturn,
    dayGainLoss, dayReturn,
    allocation, topMovers, holdingsCount,
    marketBreakdown = [], recentTransactions = [],
  } = portfolio;

  const isPositiveDay   = dayGainLoss   >= 0;
  const isPositiveTotal = totalGainLoss >= 0;

  const topHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);

  return (
    <div className="dashboard">

      {/* ── Hero ── */}
      <div className="dash-hero card">
        <div className="hero-left">
          <div className="hero-label">Total Portfolio Value</div>
          <div className="hero-value">{m(totalValue)}</div>
          <div className="hero-meta">{holdingsCount} positions · {allocation.length} asset classes</div>
        </div>
        <div className="hero-right">
          <div className="hero-stat">
            <span className="hero-stat-label">Today</span>
            <span className={`hero-stat-value ${isPositiveDay ? 'gain' : 'loss'}`}>
              {hidden ? MASK : `${isPositiveDay ? '+' : ''}${fmtMoney(dayGainLoss)}`}
            </span>
            <span className={`hero-stat-pct ${isPositiveDay ? 'gain' : 'loss'}`}>
              {isPositiveDay ? '+' : ''}{fmt(dayReturn)}%
            </span>
          </div>
          <div className="hero-divider" />
          <div className="hero-stat">
            <span className="hero-stat-label">All-time Return</span>
            <span className={`hero-stat-value ${isPositiveTotal ? 'gain' : 'loss'}`}>
              {hidden ? MASK : `${isPositiveTotal ? '+' : ''}${fmtMoney(totalGainLoss)}`}
            </span>
            <span className={`hero-stat-pct ${isPositiveTotal ? 'gain' : 'loss'}`}>
              {isPositiveTotal ? '+' : ''}{fmt(totalReturn)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Market Breakdown + Recent Activity ── */}
      <div className="dash-row-b">
        {marketBreakdown.map((mkt) => (
          <MarketCard key={mkt.market} mkt={mkt} m={m} hidden={hidden} fmtMoney={fmtMoney} />
        ))}
        <div className="card recent-card">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="recent-list">
            {recentTransactions.map((tx) => (
              <RecentTxRow key={tx.id} tx={tx} hidden={hidden} fmtMoney={fmtMoney} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="dashboard-mid">
        <div className="card allocation-card">
          <div className="section-header">
            <h2 className="section-title">Asset Allocation</h2>
          </div>
          <AllocationBar allocation={allocation} />
          <div className="allocation-values">
            {allocation.map((a) => (
              <div key={a.type} className="alloc-val-row">
                <span className="muted">{a.type}</span>
                <span>{m(a.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card movers-card">
          <div className="section-header">
            <h2 className="section-title">Top Movers</h2>
          </div>
          <div className="movers-list">
            {topMovers.map((mv) => <TopMoverRow key={mv.ticker} m={mv} />)}
          </div>
        </div>

        <div className="card quick-card">
          <div className="section-header">
            <h2 className="section-title">Largest Positions</h2>
          </div>
          <div className="quick-holdings">
            {topHoldings.map((h) => (
              <div key={h.ticker} className="quick-row">
                <div className="quick-left">
                  <span className="quick-ticker">
                    {h.market && <span style={{ marginRight: 4, fontSize: 13 }}>{MARKET_FLAG[h.market]}</span>}
                    {h.ticker}
                  </span>
                  <span className="quick-name muted">{h.type}</span>
                </div>
                <div className="quick-right">
                  <span className="quick-value">{m(h.marketValue)}</span>
                  <span className={h.gainLossPct >= 0 ? 'gain' : 'loss'}>
                    {h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
