import React, { useMemo, useState } from 'react';
import { useDebt }       from '../../../hooks/useDebt';
import { useHideNumbers } from '../../../context/HideNumbersContext';
import LoadingScreen      from '../../shared/LoadingScreen';
import ErrorScreen        from '../../shared/ErrorScreen';
import { fmt, fmtIDR }   from '../../../utils/formatters';
import './DebtPage.css';

const MASK = '••••••';

const TYPE_COLORS = {
  'Credit Card':   '#f87171',
  'Personal Loan': '#fb923c',
  'Mortgage':      '#60a5fa',
  'Auto Loan':     '#a78bfa',
  'Student Loan':  '#34d399',
  'Other':         '#94a3b8',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="debt-stat card">
      <span className="debt-stat-label">{label}</span>
      <span className="debt-stat-value" style={color ? { color } : {}}>{value}</span>
      {sub && <span className="debt-stat-sub">{sub}</span>}
    </div>
  );
}

// Compute months to payoff at a fixed monthly payment (simple amortization)
function monthsToPayoff(balance, annualRate, monthlyPayment) {
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return null;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(balance / monthlyPayment);
  const n = -Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
  if (!isFinite(n) || n < 0) return null;
  return Math.ceil(n);
}

// Total interest paid over the life of the debt at minimum payment
function totalInterestCost(balance, annualRate, monthlyPayment) {
  const months = monthsToPayoff(balance, annualRate, monthlyPayment);
  if (months === null) return null;
  return (monthlyPayment * months) - balance;
}

function DebtPage() {
  const { debts, loading, error } = useDebt();
  const { hidden } = useHideNumbers();

  const [filter, setFilter] = useState('All');

  const types = useMemo(() => ['All', ...new Set(debts.map((d) => d.type))], [debts]);

  const filtered = useMemo(
    () => filter === 'All' ? debts : debts.filter((d) => d.type === filter),
    [debts, filter]
  );

  const summary = useMemo(() => {
    const totalBalance    = debts.reduce((s, d) => s + d.balance, 0);
    const totalMinPayment = debts.reduce((s, d) => s + d.minimumPayment, 0);
    const avgRate         = debts.length
      ? debts.reduce((s, d) => s + d.interestRate, 0) / debts.length
      : 0;
    const highest = debts.reduce((best, d) => (!best || d.interestRate > best.interestRate) ? d : best, null);
    const totalInterest   = debts.reduce((s, d) => {
      const interest = totalInterestCost(d.balance, d.interestRate, d.minimumPayment);
      return s + (interest ?? 0);
    }, 0);
    return { totalBalance, totalMinPayment, avgRate, highest, totalInterest };
  }, [debts]);

  if (loading) return <LoadingScreen message="Loading debts…" />;
  if (error)   return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtIDR(v);

  return (
    <div className="debt-page">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Debt Tracker</h2>
          <p className="section-subtitle">
            {debts.length} debt{debts.length !== 1 ? 's' : ''} · track balances and payoff progress
          </p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="debt-stats-grid">
        <StatCard
          label="Total Debt"
          value={m(summary.totalBalance)}
          sub={`across ${debts.length} account${debts.length !== 1 ? 's' : ''}`}
          color="#f87171"
        />
        <StatCard
          label="Monthly Minimums"
          value={m(summary.totalMinPayment)}
          sub="combined minimum payments"
        />
        <StatCard
          label="Avg Interest Rate"
          value={hidden ? MASK : `${fmt(summary.avgRate, 2)}%`}
          sub="weighted across all debts"
          color={summary.avgRate > 26 ? '#f87171' : summary.avgRate > 12 ? '#fbbf24' : '#3fb950'}
        />
        <StatCard
          label="Highest Rate"
          value={summary.highest ? (hidden ? MASK : `${fmt(summary.highest.interestRate, 2)}%`) : '—'}
          sub={summary.highest ? summary.highest.name : 'No debts'}
          color="#fbbf24"
        />
        <StatCard
          label="Total Interest Cost"
          value={m(summary.totalInterest)}
          sub="at minimum payments"
          color="#f87171"
        />
      </div>

      {/* ── Type filter pills ── */}
      <div className="debt-filter-row">
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

      {/* ── Debt table ── */}
      {filtered.length === 0 ? (
        <div className="debt-empty card">
          No debts found. Add one via <strong>Data Entry → Debts</strong>.
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="debt-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>App</th>
                <th>Status</th>
                <th className="num">Balance</th>
                <th className="num">Bln %</th>
                <th className="num">EAR %</th>
                <th className="num">Tenor</th>
                <th className="num">Cicilan</th>
                <th className="num">Jatuh Tempo</th>
                <th className="num">Sisa Pembayaran</th>
                <th className="num">Bunga/Bln</th>
                <th className="num">Total Bunga</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const months          = monthsToPayoff(d.balance, d.interestRate, d.minimumPayment);
                const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
                
                const isPaid = d.balance <= 0;
                let payoffLabel;
                if (isPaid) {
                  payoffLabel = '0 bulan';
                } else if (months === null) {
                  payoffLabel = <span className="debt-never">Never</span>;
                } else if (months > 120) {
                  payoffLabel = `${(months / 12).toFixed(1)} tahun`;
                } else {
                  payoffLabel = `${months} bulan`;
                }

                const totalInterest = totalInterestCost(d.balance, d.interestRate, d.minimumPayment);

                return (
                  <tr key={d._id}>
                    <td className="bold">{d.name}</td>
                    <td>
                      <span
                        className="debt-type-badge"
                        style={{ background: `${TYPE_COLORS[d.type] || '#94a3b8'}22`, color: TYPE_COLORS[d.type] || '#94a3b8' }}
                      >
                        {d.type}
                      </span>
                    </td>
                    <td className="muted">{d.debtApp || '—'}</td>
                    <td>
                      {isPaid ? (
                        <span className="debt-status-badge paid">Lunas</span>
                      ) : (
                        <span className="debt-status-badge active">Aktif</span>
                      )}
                    </td>
                    <td className="num debt-balance">{m(d.balance)}</td>
                    <td className="num">
                      {d.monthlyInterestRate != null
                        ? <span className={d.monthlyInterestRate > 2 ? 'debt-rate-high' : d.monthlyInterestRate > 1 ? 'debt-rate-mid' : 'debt-rate-low'}>
                            {hidden ? MASK : `${fmt(d.monthlyInterestRate, 2)}%`}
                          </span>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num">
                      <span className={d.interestRate > 26 ? 'debt-rate-high' : d.interestRate > 12 ? 'debt-rate-mid' : 'debt-rate-low'}>
                        {hidden ? MASK : `${fmt(d.interestRate, 2)}%`}
                      </span>
                    </td>
                    <td className="num muted">{d.tenor != null ? `${d.tenor} bln` : '—'}</td>
                    <td className="num">{m(d.minimumPayment)}</td>
                    <td className="num muted">{d.dueDay}</td>
                    <td className="num">{hidden ? MASK : payoffLabel}</td>
                    <td className="num debt-interest">{m(monthlyInterest)}</td>
                    <td className="num debt-interest">
                      {totalInterest === null
                        ? <span className="muted">—</span>
                        : m(totalInterest)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="debt-total-row">
                <td colSpan={4} className="bold">Total</td>
                <td className="num bold debt-balance">{m(summary.totalBalance)}</td>
                <td colSpan={2} className="num muted">{hidden ? MASK : `${fmt(summary.avgRate, 2)}% avg EAR`}</td>
                <td></td>
                <td className="num bold">{m(summary.totalMinPayment)}</td>
                <td colSpan={3}></td>
                <td className="num bold debt-interest">{m(summary.totalInterest)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Payoff strategy note ── */}
      {debts.length > 0 && (
        <div className="debt-tip card">
          <strong>Avalanche strategy:</strong> Pay minimums on all debts, then put extra money toward{' '}
          <strong style={{ color: '#fbbf24' }}>
            {summary.highest ? summary.highest.name : '—'}
          </strong>{' '}
          ({summary.highest ? `${fmt(summary.highest.interestRate, 2)}%` : ''}) to minimize total interest paid.
        </div>
      )}
    </div>
  );
}

export default DebtPage;
