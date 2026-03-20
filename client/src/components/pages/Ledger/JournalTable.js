import React, { useMemo, useState } from 'react';
import { fmtUSD, fmtDate }  from '../../../utils/formatters';
import { useHideNumbers }   from '../../../context/HideNumbersContext';

const MASK = '••••••';

function JournalTable({ entries }) {
  const { hidden } = useHideNumbers();
  const [search, setSearch] = useState('');

  const m = (v) => hidden ? MASK : fmtUSD(v);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.lines.some((l) => l.accountName.toLowerCase().includes(q))
    );
  }, [entries, search]);

  // Totals
  const totalDebits  = filtered.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.debit,  0), 0);
  const totalCredits = filtered.reduce((s, e) => s + e.lines.reduce((ls, l) => ls + l.credit, 0), 0);

  return (
    <div>
      {/* Search */}
      <div className="journal-toolbar">
        <input
          className="journal-search"
          type="text"
          placeholder="Search entries, accounts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted" style={{ fontSize: 13 }}>{filtered.length} entries</span>
      </div>

      {/* Totals banner */}
      <div className="totals-banner card" style={{ marginBottom: 16 }}>
        <div className="total-cell">
          <span className="total-label">Entries Shown</span>
          <span className="total-val">{filtered.length}</span>
        </div>
        <div className="total-cell">
          <span className="total-label">Total Debits</span>
          <span className="total-val">{m(totalDebits)}</span>
        </div>
        <div className="total-cell">
          <span className="total-label">Total Credits</span>
          <span className="total-val">{m(totalCredits)}</span>
        </div>
        <div className="total-cell">
          <span className="total-label">Balanced</span>
          <span className={`total-val ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'gain' : 'loss'}`}>
            {Math.abs(totalDebits - totalCredits) < 0.01 ? '✓ Yes' : '✗ No'}
          </span>
        </div>
      </div>

      <div className="table-wrap card">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Date</th>
              <th>Description</th>
              <th>Account</th>
              <th className="num">Debit</th>
              <th className="num">Credit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) =>
              entry.lines.map((line, i) => (
                <tr key={`${entry.id}-${i}`} className={`holding-row ${i === 0 ? 'journal-entry-first' : 'journal-entry-cont'}`}>
                  <td className="journal-ref muted">{i === 0 ? entry.id : ''}</td>
                  <td className="journal-date">{i === 0 ? fmtDate(entry.date) : ''}</td>
                  <td className="journal-desc">{i === 0 ? entry.description : ''}</td>
                  <td>
                    <div className="journal-account">
                      <span className="journal-account-name" style={{ paddingLeft: line.debit > 0 ? 0 : 16 }}>
                        {line.accountName}
                      </span>
                      <span className="muted" style={{ fontSize: 11 }}>{line.accountType}</span>
                    </div>
                  </td>
                  <td className="num">{line.debit > 0 ? m(line.debit) : <span className="muted">—</span>}</td>
                  <td className="num">{line.credit > 0 ? m(line.credit) : <span className="muted">—</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JournalTable;
