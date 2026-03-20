import React, { useState, useEffect } from 'react';
import { fetchLedgerEntries, createJournalEntry, deleteJournalEntry } from '../../../api/portfolioApi';
import { TrashIcon } from './Icons';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY_LINE = { accountId: '', debit: '', credit: '' };

function JournalEntryForm() {
  const [id,          setId]          = useState('');
  const [date,        setDate]        = useState(today());
  const [description, setDescription] = useState('');
  const [lines,       setLines]       = useState([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [status,      setStatus]      = useState(null);
  const [tick,        setTick]        = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchLedgerEntries()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load entries.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const setLine = (i, field) => (e) =>
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: e.target.value } : l));

  const addLine    = () => setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const validLines = lines
      .filter((l) => l.accountId.trim())
      .map((l) => ({ accountId: l.accountId.trim(), debit: +(l.debit || 0), credit: +(l.credit || 0) }));

    if (validLines.length < 2) {
      setStatus({ type: 'error', msg: 'At least 2 lines with account IDs are required.' });
      setSaving(false);
      return;
    }

    const totalDebit  = validLines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = validLines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setStatus({ type: 'error', msg: `Unbalanced — debits (${totalDebit.toFixed(2)}) ≠ credits (${totalCredit.toFixed(2)}).` });
      setSaving(false);
      return;
    }

    try {
      const payload = { date, description, lines: validLines };
      if (id.trim()) payload._id = id.trim();
      await createJournalEntry(payload);
      setStatus({ type: 'success', msg: 'Journal entry created.' });
      setId(''); setDate(today()); setDescription('');
      setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm(`Delete journal entry ${entryId}?`)) return;
    try {
      await deleteJournalEntry(entryId);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">Add Journal Entry</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Entry ID (optional)</label>
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="JE010" />
            </div>
            <div className="de-field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="de-field">
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Buy AAPL shares" />
          </div>
          <div className="de-field">
            <label>Lines (Account ID · Debit · Credit)</label>
          </div>
          <div className="de-lines-box">
            {lines.map((line, i) => (
              <div key={i} className="de-line-row">
                <input value={line.accountId} onChange={setLine(i, 'accountId')} placeholder="Account ID" />
                <input type="number" value={line.debit}  onChange={setLine(i, 'debit')}  placeholder="Debit"  min="0" step="any" />
                <input type="number" value={line.credit} onChange={setLine(i, 'credit')} placeholder="Credit" min="0" step="any" />
                <button type="button" className="de-remove-line" onClick={() => removeLine(i)} title="Remove line">×</button>
              </div>
            ))}
          </div>
          <button type="button" className="de-add-line" onClick={addLine}>+ Add Line</button>
          <button type="submit" className="de-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Add Journal Entry'}
          </button>
        </form>
      </div>

      <div className="de-list-card">
        <div className="de-list-header">
          <span className="de-list-title">Journal Entries</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr><th>ID</th><th>Date</th><th>Description</th><th>Lines</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry._id}>
                    <td><strong>{entry._id}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.description}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{entry.lines?.length ?? 0}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn delete" title="Delete" onClick={() => handleDelete(entry._id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No journal entries yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default JournalEntryForm;
