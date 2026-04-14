import React, { useState, useEffect } from 'react';
import { fetchLedgerAccounts, createLedgerAccount, updateLedgerAccount } from '../../../api/portfolioApi';
import { PencilIcon } from './Icons';
import { useCurrency } from '../../../context/CurrencyContext';

const EMPTY = { _id: '', code: '', name: '', type: 'Asset', normalBalance: 'Debit', openingBalance: '0' };

function LedgerAccountForm() {
  const [form,     setForm]     = useState(EMPTY);
  const [editMode, setEditMode] = useState(false);
  const [editKey,  setEditKey]  = useState(null);
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState(null);
  const [tick,     setTick]     = useState(0);
  const { fmtMoney, currency } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetchLedgerAccounts()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load accounts.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const normalBalance = ['Asset', 'Expense'].includes(type) ? 'Debit' : 'Credit';
    setForm((f) => ({ ...f, type, normalBalance }));
  };

  const handleEdit = (a) => {
    setForm({ _id: a._id, code: a.code, name: a.name, type: a.type, normalBalance: a.normalBalance, openingBalance: String(a.openingBalance || 0) });
    setEditMode(true);
    setEditKey(a._id);
    setStatus(null);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setEditMode(false);
    setEditKey(null);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      if (editMode) {
        await updateLedgerAccount(editKey, { code: form.code, name: form.name, type: form.type, normalBalance: form.normalBalance, openingBalance: +form.openingBalance });
        setStatus({ type: 'success', msg: `Account ${editKey} updated.` });
      } else {
        await createLedgerAccount({ ...form, openingBalance: +form.openingBalance });
        setStatus({ type: 'success', msg: `Account ${form._id} created.` });
      }
      setForm(EMPTY);
      setEditMode(false);
      setEditKey(null);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">{editMode ? `Editing ${editKey}` : 'Add Ledger Account'}</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Account ID</label>
              <input value={form._id} onChange={set('_id')} required placeholder="A1000"
                disabled={editMode} style={editMode ? { opacity: 0.5 } : {}} />
            </div>
            <div className="de-field">
              <label>Code</label>
              <input value={form.code} onChange={set('code')} required placeholder="1000" />
            </div>
          </div>
          <div className="de-field">
            <label>Name</label>
            <input value={form.name} onChange={set('name')} required placeholder="Cash & Equivalents" />
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Type</label>
              <select value={form.type} onChange={handleTypeChange}>
                <option>Asset</option><option>Liability</option><option>Equity</option>
                <option>Income</option><option>Expense</option>
              </select>
            </div>
            <div className="de-field">
              <label>Normal Balance</label>
              <select value={form.normalBalance} onChange={set('normalBalance')}>
                <option>Debit</option><option>Credit</option>
              </select>
            </div>
          </div>
          <div className="de-field">
            <label>Opening Balance ({currency})</label>
            <input type="number" value={form.openingBalance} onChange={set('openingBalance')} step="any" placeholder="0" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="de-submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving…' : editMode ? 'Update Account' : 'Add Account'}
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
          <span className="de-list-title">Ledger Accounts</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr><th>ID</th><th>Code</th><th>Name</th><th>Type</th><th>Normal Bal.</th><th>Opening Bal.</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a._id}</strong></td>
                    <td>{a.code}</td>
                    <td>{a.name}</td>
                    <td>{a.type}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.normalBalance}</td>
                    <td>{fmtMoney(a.openingBalance || 0)}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn edit" title="Edit" onClick={() => handleEdit(a)}><PencilIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No accounts yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default LedgerAccountForm;
