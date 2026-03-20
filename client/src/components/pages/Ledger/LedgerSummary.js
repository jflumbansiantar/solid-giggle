import React from 'react';
import { fmt }            from '../../../utils/formatters';
import { useHideNumbers } from '../../../context/HideNumbersContext';
import { useCurrency }    from '../../../context/CurrencyContext';

const MASK = '••••••';

const ACCOUNT_TYPE_COLORS = {
  Income:  '#3fb950',
  Expense: '#f87171',
};

function MiniBar({ pct, color }) {
  return (
    <div className="mini-bar-track">
      <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function LedgerSummary({ summary }) {
  const { hidden } = useHideNumbers();
  const { fmtMoney } = useCurrency();
  const m = (v) => hidden ? MASK : fmtMoney(v);

  const { totalIncome, totalExpenses, netIncome, totalAssets, totalLiabilities, totalEquity, netWorth, incomeBreakdown, expenseBreakdown, monthlyTrend } = summary;
  const isProfit = netIncome >= 0;
  const savingsRate = totalIncome > 0 ? +((netIncome / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="ledger-summary">
      {/* ── Top KPI cards ── */}
      <div className="ledger-kpi-grid">
        <div className="ledger-kpi card">
          <span className="kpi-label">Total Income</span>
          <span className="kpi-value gain">{hidden ? MASK : `+${fmtMoney(totalIncome)}`}</span>
          <span className="kpi-sub muted">YTD earnings</span>
        </div>
        <div className="ledger-kpi card">
          <span className="kpi-label">Total Expenses</span>
          <span className="kpi-value loss">{hidden ? MASK : `-${fmtMoney(totalExpenses)}`}</span>
          <span className="kpi-sub muted">YTD spending</span>
        </div>
        <div className="ledger-kpi card">
          <span className="kpi-label">Net Income</span>
          <span className={`kpi-value ${isProfit ? 'gain' : 'loss'}`}>
            {hidden ? MASK : `${isProfit ? '+' : ''}${fmtMoney(netIncome)}`}
          </span>
          <span className={`kpi-sub ${isProfit ? 'gain' : 'loss'}`}>
            {isProfit ? '▲' : '▼'} {savingsRate}% savings rate
          </span>
        </div>
        <div className="ledger-kpi card">
          <span className="kpi-label">Net Worth</span>
          <span className="kpi-value">{m(netWorth)}</span>
          <span className="kpi-sub muted">Assets − Liabilities</span>
        </div>
      </div>

      <div className="ledger-summary-mid">
        {/* ── Income breakdown ── */}
        <div className="card ledger-breakdown-card">
          <h3 className="breakdown-title gain">Income Sources</h3>
          <div className="breakdown-list">
            {incomeBreakdown.map((item) => (
              <div key={item.name} className="breakdown-row">
                <div className="breakdown-meta">
                  <span className="breakdown-name">{item.name}</span>
                  <span className="breakdown-pct gain">{item.percentage}%</span>
                </div>
                <MiniBar pct={item.percentage} color={ACCOUNT_TYPE_COLORS.Income} />
                <span className="breakdown-val">{m(item.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Expense breakdown ── */}
        <div className="card ledger-breakdown-card">
          <h3 className="breakdown-title loss">Top Expenses</h3>
          <div className="breakdown-list">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="breakdown-row">
                <div className="breakdown-meta">
                  <span className="breakdown-name">{item.name}</span>
                  <span className="breakdown-pct loss">{item.percentage}%</span>
                </div>
                <MiniBar pct={item.percentage} color={ACCOUNT_TYPE_COLORS.Expense} />
                <span className="breakdown-val">{m(item.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Balance sheet mini ── */}
        <div className="card ledger-bs-card">
          <h3 className="breakdown-title">Balance Sheet</h3>
          <div className="bs-section">
            <div className="bs-row bs-header"><span>Assets</span><span>{m(totalAssets)}</span></div>
            <div className="bs-row"><span className="muted">Liabilities</span><span className="loss">{hidden ? MASK : `-${fmtMoney(totalLiabilities)}`}</span></div>
            <div className="bs-row"><span className="muted">Equity</span><span>{m(totalEquity)}</span></div>
            <div className="bs-divider" />
            <div className="bs-row bs-total"><span>Net Worth</span><span className="gain">{m(netWorth)}</span></div>
          </div>
        </div>
      </div>

      {/* ── Monthly trend table ── */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title" style={{ marginBottom: 16 }}>Monthly Income vs Expenses</h3>
        <div className="table-wrap" style={{ padding: 0, border: 'none' }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="num">Income</th>
                <th className="num">Expenses</th>
                <th className="num">Net</th>
                <th className="num">Savings Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((mo) => {
                const rate = mo.income > 0 ? +((mo.netIncome / mo.income) * 100).toFixed(1) : 0;
                return (
                  <tr key={mo.month}>
                    <td className="month-cell">{mo.month}</td>
                    <td className="num gain">{hidden ? MASK : `+${fmtMoney(mo.income)}`}</td>
                    <td className="num loss">{hidden ? MASK : `-${fmtMoney(mo.expenses)}`}</td>
                    <td className="num"><span className={mo.netIncome >= 0 ? 'gain' : 'loss'}>{hidden ? MASK : `${mo.netIncome >= 0 ? '+' : ''}${fmtMoney(mo.netIncome)}`}</span></td>
                    <td className="num"><span className={rate >= 0 ? 'gain' : 'loss'}>{fmt(rate)}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LedgerSummary;
