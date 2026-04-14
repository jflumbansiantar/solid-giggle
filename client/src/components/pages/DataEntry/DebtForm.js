import React, { useState, useEffect } from 'react';
import { fetchDebts, createDebt, updateDebt, deleteDebt } from '../../../api/portfolioApi';
import { PencilIcon, TrashIcon } from './Icons';
import { fmtIDR, fmt } from '../../../utils/formatters';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Student Loan', 'Other'];

const EMPTY = {
  name: '', type: 'Personal Loan', balance: '',
  monthlyInterestRate: '', interestRate: '',
  tenor: '', minimumPayment: '', dueDay: '1',
  currency: 'IDR', debtApp: '', notes: '',
};

// EAR: (1 + r_monthly / 100)^12 - 1
function calcAnnualFromMonthly(monthly) {
  const m = parseFloat(monthly);
  if (!m || m <= 0) return '';
  return (((1 + m / 100) ** 12) - 1) * 100;
}

// Reverse: monthly from EAR annual → (1 + annual/100)^(1/12) - 1
function calcMonthlyFromAnnual(annual) {
  const a = parseFloat(annual);
  if (!a || a <= 0) return '';
  return (((1 + a / 100) ** (1 / 12)) - 1) * 100;
}

function DebtForm() {
  const [form,     setForm]     = useState(EMPTY);
  const [editMode, setEditMode] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState(null);
  const [tick,     setTick]     = useState(0);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetchDebts()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load debts.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleMonthlyRateChange = (e) => {
    const monthly = e.target.value;
    const annual  = monthly !== '' ? calcAnnualFromMonthly(monthly) : '';
    setForm((f) => ({
      ...f,
      monthlyInterestRate: monthly,
      interestRate: annual !== '' ? fmt(annual, 4) : '',
    }));
  };

  const handleEdit = (d) => {
    const monthly = d.monthlyInterestRate != null
      ? String(fmt(d.monthlyInterestRate, 4))
      : (d.interestRate ? String(fmt(calcMonthlyFromAnnual(d.interestRate), 4)) : '');
    setForm({
      name:                d.name,
      type:                d.type,
      balance:             String(d.balance),
      monthlyInterestRate: monthly,
      interestRate:        String(d.interestRate),
      tenor:               d.tenor != null ? String(d.tenor) : '',
      minimumPayment:      String(d.minimumPayment),
      dueDay:              String(d.dueDay),
      currency:            d.currency,
      debtApp:             d.debtApp || '',
      notes:               d.notes || '',
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
      balance:             +form.balance,
      monthlyInterestRate: form.monthlyInterestRate !== '' ? +form.monthlyInterestRate : null,
      interestRate:        +form.interestRate,
      tenor:               form.tenor !== '' ? +form.tenor : null,
      minimumPayment:      +form.minimumPayment,
      dueDay:              +form.dueDay,
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
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      if (editId === id) handleCancel();
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  const handleToggleSelect = (id) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const allSelected = rows.length > 0 && rows.every((d) => selected.has(d._id));

  const handleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((d) => d._id)));

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.size} selected debt(s)?`)) return;
    try {
      await Promise.all([...selected].map((id) => deleteDebt(id)));
      if (editId && selected.has(editId)) handleCancel();
      setSelected(new Set());
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  const annualDisplay = form.interestRate !== ''
    ? `${fmt(parseFloat(form.interestRate), 2)}%`
    : '—';

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">{editMode ? `Editing "${form.name}"` : 'Add Debt'}</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Name</label>
              <input value={form.name} onChange={set('name')} required placeholder="KTA BCA" />
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
              <label>Current Balance (IDR)</label>
              <input type="number" value={form.balance} onChange={set('balance')} required min="0" step="any" placeholder="50000000" />
            </div>
            <div className="de-field">
              <label>Tenor (bulan)</label>
              <input type="number" value={form.tenor} onChange={set('tenor')} min="1" step="1" placeholder="24" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Bunga per Bulan (%)</label>
              <input
                type="number"
                value={form.monthlyInterestRate}
                onChange={handleMonthlyRateChange}
                required
                min="0"
                step="any"
                placeholder="1.5"
              />
            </div>
            <div className="de-field">
              <label>Annual Interest Rate / EAR (%)</label>
              <input
                type="number"
                value={form.interestRate}
                readOnly
                tabIndex={-1}
                placeholder="—"
                style={{ background: 'rgba(255,255,255,0.04)', cursor: 'default', color: 'var(--text-secondary)' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                EAR = (1 + bunga/bln)¹² − 1 · {annualDisplay}
              </span>
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Cicilan / Minimum Payment (IDR)</label>
              <input type="number" value={form.minimumPayment} onChange={set('minimumPayment')} required min="0" step="any" placeholder="2500000" />
            </div>
            <div className="de-field">
              <label>Tanggal Jatuh Tempo (1–31)</label>
              <input type="number" value={form.dueDay} onChange={set('dueDay')} min="1" max="31" step="1" placeholder="25" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Debt App (opsional)</label>
              <input value={form.debtApp} onChange={set('debtApp')} placeholder="e.g. myBCA, Kredivo" />
            </div>
            <div className="de-field">
              <label>Notes (opsional)</label>
              <input value={form.notes} onChange={set('notes')} placeholder="e.g. Promo 0% s/d Des 2025" />
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {selected.size > 0 && (
              <button className="de-bulk-delete" onClick={handleDeleteSelected}>
                Delete {selected.size} selected
              </button>
            )}
            <span className="de-count">{rows.length} records</span>
          </div>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr>
                  <th className="de-check-cell">
                    <input type="checkbox" checked={allSelected} onChange={handleSelectAll} title="Select all" />
                  </th>
                  <th>Name</th><th>Type</th><th>Balance</th><th>Bln %</th><th>EAR %</th><th>Tenor</th><th>Cicilan</th><th>Jatuh Tempo</th><th>Debt App</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d._id} className={selected.has(d._id) ? 'de-row-selected' : ''}>
                    <td className="de-check-cell">
                      <input type="checkbox" checked={selected.has(d._id)} onChange={() => handleToggleSelect(d._id)} />
                    </td>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.type}</td>
                    <td>{fmtIDR(d.balance)}</td>
                    <td>{d.monthlyInterestRate != null ? `${fmt(d.monthlyInterestRate, 2)}%` : '—'}</td>
                    <td>{fmt(d.interestRate, 2)}%</td>
                    <td>{d.tenor != null ? `${d.tenor} bln` : '—'}</td>
                    <td>{fmtIDR(d.minimumPayment)}</td>
                    <td>{d.dueDay}</td>
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
