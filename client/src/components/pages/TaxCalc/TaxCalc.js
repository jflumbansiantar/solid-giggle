import React, { useMemo, useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useHoldings }     from '../../../hooks/useHoldings';
import { useHideNumbers }  from '../../../context/HideNumbersContext';
import { useCurrency }     from '../../../context/CurrencyContext';
import LoadingScreen       from '../../shared/LoadingScreen';
import ErrorScreen         from '../../shared/ErrorScreen';
import { fmt, fmtDate }    from '../../../utils/formatters';
import './TaxCalc.css';
import '../Holdings/Holdings.css';

const MASK = '••••••';

const US_BRACKETS = [
  { label: '0%  (≤ $47k income)',  rate: 0    },
  { label: '15% (most filers)',    rate: 0.15  },
  { label: '20% (high income)',    rate: 0.20  },
  { label: 'Custom',               rate: null  },
];

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="tax-stat card">
      <span className="tax-stat-label">{label}</span>
      <span className="tax-stat-value" style={color ? { color } : {}}>{value}</span>
      {sub && <span className="tax-stat-sub">{sub}</span>}
    </div>
  );
}

function TaxCalc() {
  const { transactions, loading: txLoading, error: txError } = useTransactions();
  const { holdings,     loading: hlLoading, error: hlError } = useHoldings();
  const { hidden }    = useHideNumbers();
  const { fmtMoney }  = useCurrency();

  // Derive available tax years from transactions
  const years = useMemo(() => {
    const ys = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))].sort().reverse();
    const thisYear = new Date().getFullYear();
    if (!ys.includes(thisYear)) ys.unshift(thisYear);
    return ys;
  }, [transactions]);

  const [year,          setYear]          = useState(() => new Date().getFullYear());
  const [bracketIdx,    setBracketIdx]    = useState(1); // 15% default
  const [customRate,    setCustomRate]    = useState('10');
  const [activeSection, setActiveSection] = useState('idx'); // 'idx' | 'us' | 'unrealized'

  const effectiveUsRate = US_BRACKETS[bracketIdx].rate ?? (parseFloat(customRate) / 100 || 0);

  // avg cost map from holdings
  const avgCostMap = useMemo(
    () => Object.fromEntries(holdings.map((h) => [h.ticker, h.avgCost])),
    [holdings]
  );

  // All SELL transactions for the selected year
  const sells = useMemo(
    () => transactions.filter((t) => t.type === 'SELL' && new Date(t.date).getFullYear() === year),
    [transactions, year]
  );

  // Enrich each sell with estimated gain & taxes
  const enriched = useMemo(() => sells.map((tx) => {
    const avgCost   = avgCostMap[tx.ticker] ?? 0;
    const costBasis = avgCost * tx.shares;
    const gain      = tx.total - costBasis;
    const idxTax    = tx.market === 'ID' ? tx.total * 0.001 : 0;
    const usTax     = tx.market === 'US' ? Math.max(gain, 0) * effectiveUsRate : 0;
    return { ...tx, costBasis, gain, idxTax, usTax };
  }), [sells, avgCostMap, effectiveUsRate]);

  const idxSells = useMemo(() => enriched.filter((t) => t.market === 'ID'), [enriched]);
  const usSells  = useMemo(() => enriched.filter((t) => t.market === 'US'), [enriched]);

  const summary = useMemo(() => ({
    idxProceeds: idxSells.reduce((s, t) => s + t.total,  0),
    idxTax:      idxSells.reduce((s, t) => s + t.idxTax, 0),
    usGain:      usSells.reduce((s,  t) => s + t.gain,   0),
    usTax:       usSells.reduce((s,  t) => s + t.usTax,  0),
    totalTax:    idxSells.reduce((s, t) => s + t.idxTax, 0) + usSells.reduce((s, t) => s + t.usTax, 0),
  }), [idxSells, usSells]);

  const unrealized = useMemo(
    () => [...holdings].sort((a, b) => b.gainLoss - a.gainLoss),
    [holdings]
  );

  if (txLoading || hlLoading) return <LoadingScreen message="Loading tax data…" />;
  if (txError)  return <ErrorScreen message={txError} />;
  if (hlError)  return <ErrorScreen message={hlError} />;

  const m  = (v)          => hidden ? MASK : fmtMoney(v);
  const pn = (v, suffix)  => hidden ? MASK : `${v >= 0 ? '+' : ''}${fmtMoney(v)}${suffix || ''}`;

  return (
    <div className="tax-page">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Tax Calculator</h2>
          <p className="section-subtitle">Estimated tax liability · {sells.length} sell events in {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Year selector */}
          <select className="tax-select" value={year} onChange={(e) => setYear(+e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* US bracket */}
          <select className="tax-select" value={bracketIdx} onChange={(e) => setBracketIdx(+e.target.value)}>
            {US_BRACKETS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
          </select>
          {US_BRACKETS[bracketIdx].rate === null && (
            <div className="tax-custom-wrap">
              <input
                type="number" min="0" max="100" step="0.5"
                className="tax-custom-input"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
              />
              <span className="tax-custom-pct">%</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="tax-stats-grid">
        <SummaryCard
          label="IDX Tax Due"
          value={m(summary.idxTax)}
          sub={`0.1% × ${m(summary.idxProceeds)} proceeds`}
          color="#f87171"
        />
        <SummaryCard
          label="US Realized Gain"
          value={hidden ? MASK : `${summary.usGain >= 0 ? '+' : ''}${fmtMoney(summary.usGain)}`}
          sub={`${usSells.length} sells · cap-gains`}
          color={summary.usGain >= 0 ? '#3fb950' : '#f87171'}
        />
        <SummaryCard
          label={`US Est. Tax (${(effectiveUsRate * 100).toFixed(0)}%)`}
          value={m(summary.usTax)}
          sub="On positive realized gains"
          color="#f87171"
        />
        <SummaryCard
          label="Total Est. Tax"
          value={m(summary.totalTax)}
          sub={`IDX + US combined`}
          color="#fbbf24"
        />
      </div>

      {/* ── Section tabs ── */}
      <div className="tax-section-tabs" style={{ marginBottom: 16 }}>
        {[
          { id: 'idx',        label: `🇮🇩 IDX (${idxSells.length})` },
          { id: 'us',         label: `🇺🇸 US (${usSells.length})` },
          { id: 'unrealized', label: `Unrealized (${unrealized.length})` },
        ].map((s) => (
          <button
            key={s.id}
            className={`filter-pill ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── IDX section ── */}
      {activeSection === 'idx' && (
        <div className="table-wrap card">
          <div className="tax-rule-note">
            Indonesia final tax: <strong>0.1%</strong> of gross sale proceeds — applies regardless of gain or loss.
          </div>
          {idxSells.length === 0 ? (
            <div className="tax-empty">No IDX sell transactions in {year}.</div>
          ) : (
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Date</th><th>Ticker</th><th className="num">Shares</th>
                  <th className="num">Sell Price</th><th className="num">Proceeds</th>
                  <th className="num">Tax (0.1%)</th>
                </tr>
              </thead>
              <tbody>
                {idxSells.map((tx) => (
                  <tr key={tx.id}>
                    <td className="muted">{fmtDate(tx.date)}</td>
                    <td className="bold">{tx.ticker}</td>
                    <td className="num">{hidden ? MASK : fmt(tx.shares, 0)}</td>
                    <td className="num">{m(tx.price)}</td>
                    <td className="num">{m(tx.total)}</td>
                    <td className="num tax-due">{m(tx.idxTax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="tax-total-row">
                  <td colSpan={4} className="bold">Total</td>
                  <td className="num bold">{m(summary.idxProceeds)}</td>
                  <td className="num bold tax-due">{m(summary.idxTax)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* ── US section ── */}
      {activeSection === 'us' && (
        <div className="table-wrap card">
          <div className="tax-rule-note">
            US long-term capital gains rate: <strong>{(effectiveUsRate * 100).toFixed(0)}%</strong> — applied to positive realized gains only. Cost basis estimated from current average cost.
          </div>
          {usSells.length === 0 ? (
            <div className="tax-empty">No US sell transactions in {year}.</div>
          ) : (
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Date</th><th>Ticker</th><th className="num">Shares</th>
                  <th className="num">Proceeds</th><th className="num">Est. Cost</th>
                  <th className="num">Gain / Loss</th><th className="num">Est. Tax</th>
                </tr>
              </thead>
              <tbody>
                {usSells.map((tx) => (
                  <tr key={tx.id}>
                    <td className="muted">{fmtDate(tx.date)}</td>
                    <td className="bold">{tx.ticker}</td>
                    <td className="num">{hidden ? MASK : fmt(tx.shares, 2)}</td>
                    <td className="num">{m(tx.total)}</td>
                    <td className="num muted">{m(tx.costBasis)}</td>
                    <td className="num"><span className={tx.gain >= 0 ? 'gain' : 'loss'}>{hidden ? MASK : `${tx.gain >= 0 ? '+' : ''}${fmtMoney(tx.gain)}`}</span></td>
                    <td className="num tax-due">{tx.gain > 0 ? m(tx.usTax) : <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="tax-total-row">
                  <td colSpan={5} className="bold">Total</td>
                  <td className={`num bold ${summary.usGain >= 0 ? 'gain' : 'loss'}`}>{hidden ? MASK : `${summary.usGain >= 0 ? '+' : ''}${fmtMoney(summary.usGain)}`}</td>
                  <td className="num bold tax-due">{m(summary.usTax)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* ── Unrealized ── */}
      {activeSection === 'unrealized' && (
        <div className="table-wrap card">
          <div className="tax-rule-note">
            Unrealized gains are not taxable until sold. Shown for planning reference.
          </div>
          <table className="tax-table">
            <thead>
              <tr>
                <th>Ticker</th><th>Market</th><th>Type</th>
                <th className="num">Mkt Value</th><th className="num">Cost Basis</th>
                <th className="num">Unrealized G/L</th><th className="num">Return %</th>
              </tr>
            </thead>
            <tbody>
              {unrealized.map((h) => (
                <tr key={h.id}>
                  <td className="bold">{h.ticker}</td>
                  <td className="muted">{h.market}</td>
                  <td className="muted">{h.type}</td>
                  <td className="num">{m(h.marketValue)}</td>
                  <td className="num muted">{m(h.costBasis)}</td>
                  <td className="num"><span className={h.gainLoss >= 0 ? 'gain' : 'loss'}>{hidden ? MASK : `${h.gainLoss >= 0 ? '+' : ''}${fmtMoney(h.gainLoss)}`}</span></td>
                  <td className="num"><span className={`badge ${h.gainLossPct >= 0 ? 'badge-gain' : 'badge-loss'}`}>{h.gainLossPct >= 0 ? '+' : ''}{fmt(h.gainLossPct)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TaxCalc;
