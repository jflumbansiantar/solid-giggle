import React, { useState, useEffect } from 'react';
import { fetchDebts, createDebt, updateDebt, deleteDebt } from '../../../api/portfolioApi';
import { PencilIcon, TrashIcon } from './Icons';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Student Loan', 'Other'];

const EMPTY = {
  name: '', type: 'Credit Card', balance: '', interestRate: '',
  minimumPayment: '', dueDay: '1', currency: 'USD', debtApp: '', notes: '',
};

function DebtForm() {
  const [form,     setForm]     = useState(EMPTY);
  const [editMode, setEditMode] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchDebts()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load debts.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleEdit = (d) => {
    setForm({
      name: d.name, type: d.type, balance: String(d.balance),
      interestRate: String(d.interestRate), minimumPayment: String(d.minimumPayment),
      dueDay: String(d.dueDay), currency: d.currency, debtApp: d.debtApp || '', notes: d.notes || '',
    });
    setEditMode(true);
    setEditId(d._id);
    setStatus(null);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setEditMode(false);
    setEditId(null);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const payload = {
      ...form,
      balance:        +form.balance,
      interestRate:   +form.interestRate,
      minimumPayment: +form.minimumPayment,
      dueDay:         +form.dueDay,
    };
    try {
      if (editMode) {
        await updateDebt(editId, payload);
        setStatus({ type: 'success', msg: `"${form.name}" updated.` });
      } else {
        await createDebt(payload);
        setStatus({ type: 'success', msg: `"${form.name}" added.` });
      }
      setForm(EMPTY);
      setEditMode(false);
      setEditId(null);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete debt "${name}"?`)) return;
    try {
      await deleteDebt(id);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">{editMode ? `Editing "${form.name}"` : 'Add Debt'}</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Name</label>
              <input value={form.name} onChange={set('name')} required placeholder="Chase Sapphire" />
            </div>
            <div className="de-field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                {DEBT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Current Balance</label>
              <input type="number" value={form.balance} onChange={set('balance')} required min="0" step="any" placeholder="5000.00" />
            </div>
            <div className="de-field">
              <label>Annual Interest Rate (%)</label>
              <input type="number" value={form.interestRate} onChange={set('interestRate')} required min="0" step="any" placeholder="18.99" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Monthly Minimum Payment</label>
              <input type="number" value={form.minimumPayment} onChange={set('minimumPayment')} required min="0" step="any" placeholder="150.00" />
            </div>
            <div className="de-field">
              <label>Payment Due Day (1–31)</label>
              <input type="number" value={form.dueDay} onChange={set('dueDay')} min="1" max="31" step="1" placeholder="15" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Currency</label>
              <select value={form.currency} onChange={set('currency')}>
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
              </select>
            </div>
            <div className="de-field">
              <label>Debt App (optional)</label>
              <input value={form.debtApp} onChange={set('debtApp')} placeholder="e.g. Chase App, BCA Mobile" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field" style={{ gridColumn: '1 / -1' }}>
              <label>Notes (optional)</label>
              <input value={form.notes} onChange={set('notes')} placeholder="e.g. 0% promo until Dec 2025" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="de-submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving…' : editMode ? 'Update Debt' : 'Add Debt'}
            </button>
            {editMode && (
              <button type="button" onClick={handleCancel}
                style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="de-list-card">
        <div className="de-list-header">
          <span className="de-list-title">Debts</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr>
                  <th>Name</th><th>Type</th><th>Balance</th><th>Rate</th><th>Min Payment</th><th>Due Day</th><th>Currency</th><th>Debt App</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.type}</td>
                    <td>{d.balance.toLocaleString()}</td>
                    <td>{d.interestRate}%</td>
                    <td>{d.minimumPayment.toLocaleString()}</td>
                    <td>{d.dueDay}</td>
                    <td>{d.currency}</td>
                    <td>{d.debtApp || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn edit" title="Edit" onClick={() => handleEdit(d)}><PencilIcon /></button>
                        <button className="de-icon-btn delete" title="Delete" onClick={() => handleDelete(d._id, d.name)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No debts yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default DebtForm;
