import React, { useState, useEffect } from 'react';
import { fetchPriceCache, upsertPriceCache, deletePriceCache } from '../../../api/portfolioApi';
import { PencilIcon, TrashIcon } from './Icons';
import { useCurrency } from '../../../context/CurrencyContext';

const EMPTY = { ticker: '', currentPrice: '', previousClose: '' };

function PriceCacheForm() {
  const [form,     setForm]    = useState(EMPTY);
  const [rows,     setRows]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [status,   setStatus]  = useState(null);
  const [tick,     setTick]    = useState(0);
  const [selected, setSelected] = useState(new Set());
  const { fmtMoney, currency } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetchPriceCache()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load price cache.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleEdit = (p) => {
    setForm({ ticker: p.ticker, currentPrice: String(p.currentPrice), previousClose: String(p.previousClose) });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await upsertPriceCache({ ticker: form.ticker, currentPrice: +form.currentPrice, previousClose: +form.previousClose });
      setStatus({ type: 'success', msg: `${form.ticker.toUpperCase()} upserted.` });
      setForm(EMPTY);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ticker) => {
    if (!window.confirm(`Delete price for ${ticker}?`)) return;
    try {
      await deletePriceCache(ticker);
      setSelected((prev) => { const next = new Set(prev); next.delete(ticker); return next; });
      if (form.ticker === ticker) setForm(EMPTY);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  const handleToggleSelect = (ticker) =>
    setSelected((prev) => { const next = new Set(prev); next.has(ticker) ? next.delete(ticker) : next.add(ticker); return next; });

  const allSelected = rows.length > 0 && rows.every((p) => selected.has(p.ticker));

  const handleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((p) => p.ticker)));

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.size} selected price(s)?`)) return;
    try {
      await Promise.all([...selected].map((ticker) => deletePriceCache(ticker)));
      if (selected.has(form.ticker)) setForm(EMPTY);
      setSelected(new Set());
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">Upsert Price Cache</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Creates a new entry or updates the existing price for a ticker.
        </p>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-field">
            <label>Ticker</label>
            <input value={form.ticker} onChange={set('ticker')} required placeholder="AAPL" />
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Current Price ({currency})</label>
              <input type="number" value={form.currentPrice} onChange={set('currentPrice')} required min="0" step="any" placeholder="175.00" />
            </div>
            <div className="de-field">
              <label>Previous Close ({currency})</label>
              <input type="number" value={form.previousClose} onChange={set('previousClose')} required min="0" step="any" placeholder="172.50" />
            </div>
          </div>
          <button type="submit" className="de-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Upsert Price'}
          </button>
        </form>
      </div>

      <div className="de-list-card">
        <div className="de-list-header">
          <span className="de-list-title">Price Cache</span>
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
                  <th>Ticker</th><th>Current Price</th><th>Prev Close</th><th>Updated</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.ticker} className={selected.has(p.ticker) ? 'de-row-selected' : ''}>
                    <td className="de-check-cell">
                      <input type="checkbox" checked={selected.has(p.ticker)} onChange={() => handleToggleSelect(p.ticker)} />
                    </td>
                    <td><strong>{p.ticker}</strong></td>
                    <td>{fmtMoney(p.currentPrice)}</td>
                    <td>{fmtMoney(p.previousClose)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn edit" title="Edit" onClick={() => handleEdit(p)}><PencilIcon /></button>
                        <button className="de-icon-btn delete" title="Delete" onClick={() => handleDelete(p.ticker)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No prices cached yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default PriceCacheForm;
