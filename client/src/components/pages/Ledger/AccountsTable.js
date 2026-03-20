import React, { useState } from 'react';
import { fmtUSD }         from '../../../utils/formatters';
import { useHideNumbers } from '../../../context/HideNumbersContext';

const MASK = '••••••';

const TYPE_ORDER = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

const TYPE_COLOR = {
  Asset:     '#58a6ff',
  Liability: '#f87171',
  Equity:    '#fbbf24',
  Income:    '#3fb950',
  Expense:   '#e57373',
};

function AccountsTable({ accounts }) {
  const { hidden } = useHideNumbers();
  const [filter, setFilter] = useState('All');

  const m = (v) => hidden ? MASK : fmtUSD(v);

  const types = ['All', ...TYPE_ORDER.filter((t) => accounts.some((a) => a.type === t))];
  const filtered = filter === 'All' ? accounts : accounts.filter((a) => a.type === filter);

  // Group by type for display
  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const rows = filtered.filter((a) => a.type === type);
    if (rows.length) acc.push({ type, rows });
    return acc;
  }, []);

  return (
    <div>
      <div className="type-filters" style={{ marginBottom: 20 }}>
        {types.map((t) => (
          <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="table-wrap card">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th className="num">Opening Balance</th>
              <th className="num">Debits</th>
              <th className="num">Credits</th>
              <th className="num">Balance</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ type, rows }) => (
              <React.Fragment key={type}>
                <tr className="account-group-header">
                  <td colSpan={7}>
                    <span className="account-type-label" style={{ color: TYPE_COLOR[type] }}>
                      {type}s
                    </span>
                  </td>
                </tr>
                {rows.map((a) => (
                  <tr key={a.id} className="holding-row">
                    <td className="account-code muted">{a.code}</td>
                    <td className="account-name">{a.name}</td>
                    <td>
                      <span className="account-type-badge" style={{ background: `${TYPE_COLOR[a.type]}20`, color: TYPE_COLOR[a.type] }}>
                        {a.type}
                      </span>
                    </td>
                    <td className="num">{m(a.openingBalance)}</td>
                    <td className="num">{a.totalDebits > 0 ? m(a.totalDebits) : <span className="muted">—</span>}</td>
                    <td className="num">{a.totalCredits > 0 ? m(a.totalCredits) : <span className="muted">—</span>}</td>
                    <td className="num bold">
                      <span className={
                        (a.type === 'Income' || a.type === 'Asset' || a.type === 'Equity') && a.balance > 0
                          ? 'gain'
                          : a.type === 'Expense' && a.balance > 0
                          ? 'loss'
                          : ''
                      }>
                        {m(a.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountsTable;
