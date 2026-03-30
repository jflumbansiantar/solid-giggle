import React, { useMemo, useState } from 'react';
import { useDebt }       from '../../../hooks/useDebt';
import { useHideNumbers } from '../../../context/HideNumbersContext';
import { useCurrency }    from '../../../context/CurrencyContext';
import LoadingScreen      from '../../shared/LoadingScreen';
import ErrorScreen        from '../../shared/ErrorScreen';
import { fmt }            from '../../../utils/formatters';
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
  if (monthlyPayment <= 0 || balance <= 0) return null;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(balance / monthlyPayment);
  const n = -Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
  if (!isFinite(n) || n < 0) return null;
  return Math.ceil(n);
}

function DebtPage() {
  const { debts, loading, error } = useDebt();
  const { hidden }   = useHideNumbers();
  const { fmtMoney } = useCurrency();

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
    return { totalBalance, totalMinPayment, avgRate, highest };
  }, [debts]);

  if (loading) return <LoadingScreen message="Loading debts…" />;
  if (error)   return <ErrorScreen message={error} />;

  const m = (v) => hidden ? MASK : fmtMoney(v);

  return (
    <div className="debt-page">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Debt Tracker</h2>
          <p className="section-subtitle">{debts.length} debt{debts.length !== 1 ? 's' : ''} · track balances and payoff progress</p>
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
          color={summary.avgRate > 15 ? '#f87171' : summary.avgRate > 8 ? '#fbbf24' : '#3fb950'}
        />
        <StatCard
          label="Highest Rate"
          value={summary.highest ? (hidden ? MASK : `${fmt(summary.highest.interestRate, 2)}%`) : '—'}
          sub={summary.highest ? summary.highest.name : 'No debts'}
          color="#fbbf24"
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
                <th className="num">Balance</th>
                <th className="num">Rate</th>
                <th className="num">Min Payment</th>
                <th className="num">Due Day</th>
                <th className="num">Est. Payoff</th>
                <th className="num">Monthly Interest</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const months          = monthsToPayoff(d.balance, d.interestRate, d.minimumPayment);
                const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
                const payoffLabel     = months === null
                  ? <span className="debt-never">Never</span>
                  : months > 120
                    ? `${(months / 12).toFixed(1)} yrs`
                    : `${months} mo`;

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
                    <td className="num debt-balance">{m(d.balance)}</td>
                    <td className="num">
                      <span className={d.interestRate > 15 ? 'debt-rate-high' : d.interestRate > 8 ? 'debt-rate-mid' : 'debt-rate-low'}>
                        {hidden ? MASK : `${fmt(d.interestRate, 2)}%`}
                      </span>
                    </td>
                    <td className="num">{m(d.minimumPayment)}</td>
                    <td className="num muted">{d.dueDay}</td>
                    <td className="num">{hidden ? MASK : payoffLabel}</td>
                    <td className="num debt-interest">{m(monthlyInterest)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="debt-total-row">
                <td colSpan={3} className="bold">Total</td>
                <td className="num bold debt-balance">{m(summary.totalBalance)}</td>
                <td className="num muted">{hidden ? MASK : `${fmt(summary.avgRate, 2)}% avg`}</td>
                <td className="num bold">{m(summary.totalMinPayment)}</td>
                <td colSpan={3}></td>
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
