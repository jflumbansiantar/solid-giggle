import React, { useState, useEffect } from 'react';
import { fetchHoldings, createHolding, updateHolding, deleteHolding } from '../../../api/portfolioApi';
import { PencilIcon, TrashIcon } from './Icons';

const EMPTY = { ticker: '', name: '', type: 'Stock', market: 'US', shares: '', avgCost: '' };

function HoldingForm() {
  const [form,      setForm]      = useState(EMPTY);
  const [editMode,  setEditMode]  = useState(false);
  const [editKey,   setEditKey]   = useState(null);
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [status,    setStatus]    = useState(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchHoldings()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load holdings.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleEdit = (h) => {
    setForm({ ticker: h.ticker, name: h.name, type: h.type, market: h.market, shares: String(h.shares), avgCost: String(h.avgCost) });
    setEditMode(true);
    setEditKey(h.ticker);
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
        await updateHolding(editKey, { name: form.name, type: form.type, market: form.market, shares: +form.shares, avgCost: +form.avgCost });
        setStatus({ type: 'success', msg: `${editKey} updated.` });
      } else {
        await createHolding({ ...form, shares: +form.shares, avgCost: +form.avgCost });
        setStatus({ type: 'success', msg: `${form.ticker.toUpperCase()} added.` });
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

  const handleDelete = async (ticker) => {
    if (!window.confirm(`Delete holding ${ticker}?`)) return;
    try {
      await deleteHolding(ticker);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">{editMode ? `Editing ${editKey}` : 'Add Holding'}</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Ticker</label>
              <input value={form.ticker} onChange={set('ticker')} required placeholder="AAPL"
                disabled={editMode} style={editMode ? { opacity: 0.5 } : {}} />
            </div>
            <div className="de-field">
              <label>Name</label>
              <input value={form.name} onChange={set('name')} required placeholder="Apple Inc." />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                <option>Stock</option><option>ETF</option><option>Crypto</option>
              </select>
            </div>
            <div className="de-field">
              <label>Market</label>
              <select value={form.market} onChange={set('market')}>
                <option value="US">US</option>
                <option value="ID">Indonesia (IDX)</option>
              </select>
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Shares</label>
              <input type="number" value={form.shares} onChange={set('shares')} required min="0" step="any" placeholder="10" />
            </div>
            <div className="de-field">
              <label>Avg Cost (USD)</label>
              <input type="number" value={form.avgCost} onChange={set('avgCost')} required min="0" step="any" placeholder="150.00" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="de-submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving…' : editMode ? 'Update Holding' : 'Add Holding'}
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
          <span className="de-list-title">Holdings</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr><th>Ticker</th><th>Name</th><th>Type</th><th>Market</th><th>Shares</th><th>Avg Cost</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.ticker}>
                    <td><strong>{h.ticker}</strong></td>
                    <td>{h.name}</td>
                    <td>{h.type}</td>
                    <td>{h.market}</td>
                    <td>{h.shares}</td>
                    <td>${h.avgCost}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn edit" title="Edit" onClick={() => handleEdit(h)}><PencilIcon /></button>
                        <button className="de-icon-btn delete" title="Delete" onClick={() => handleDelete(h.ticker)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No holdings yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default HoldingForm;
