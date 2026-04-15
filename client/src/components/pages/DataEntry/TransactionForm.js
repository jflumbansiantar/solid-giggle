import React, { useState, useEffect } from 'react';
import { fetchTransactions, createTransaction, deleteTransaction, fetchDebts } from '../../../api/portfolioApi';
import { TrashIcon } from './Icons';
import { useCurrency } from '../../../context/CurrencyContext';
import { fmtIDR } from '../../../utils/formatters';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY  = { date: today(), category: 'STOCK', name: '', type: 'BUY', market: 'US', shares: '', price: '', total: '' };

function TransactionForm() {
  const [form,     setForm]    = useState(EMPTY);
  const [batch,    setBatch]   = useState([]);
  const [rows,     setRows]    = useState([]);
  const [debts,    setDebts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [status,   setStatus]  = useState(null);
  const [tick,     setTick]    = useState(0);
  const [selected, setSelected] = useState(new Set());
  const { fmtMoney, currency } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load transactions.' }))
      .finally(() => setLoading(false));
      
    fetchDebts()
      .then(setDebts)
      .catch(console.error);
  }, [tick]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const updated = { ...f, [field]: val };
      if (updated.category === 'STOCK' && (field === 'shares' || field === 'price') && updated.shares && updated.price) {
        updated.total = (parseFloat(updated.shares) * parseFloat(updated.price)).toFixed(2);
      }
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    let type = '';
    if (cat === 'STOCK') type = 'BUY';
    else if (cat === 'DEBT') type = 'PAYMENT';
    else if (cat === 'INCOME') type = 'SALARY';
    else if (cat === 'EXPENSE') type = 'BILL';
    
    setForm((f) => ({ ...EMPTY, date: f.date, category: cat, type, name: '' }));
  };

  const handleAddToBatch = (e) => {
    e.preventDefault();
    if (batch.length >= 12) {
      setStatus({ type: 'error', msg: 'Maximum 12 items in a single batch.' });
      return;
    }
    const payload = { ...form };
    if (form.category === 'STOCK') {
      payload.shares = +form.shares;
      payload.price = +form.price;
      payload.total = +form.total;
    } else {
      payload.total = +form.total;
      delete payload.shares;
      delete payload.price;
      delete payload.market;
    }
    
    setBatch((prev) => [...prev, payload]);
    setStatus({ type: 'success', msg: `Transaction staged! (${batch.length + 1}/12)` });
    // Keep date, category, and type for faster sequential inputs
    setForm({ ...EMPTY, date: form.date, category: form.category, type: form.type });
  };

  const handleRemoveFromBatch = (idx) => {
    setBatch((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitBatch = async () => {
    if (batch.length === 0) return;
    setSaving(true);
    setStatus(null);
    try {
      await Promise.all(batch.map((payload) => createTransaction(payload)));
      setStatus({ type: 'success', msg: `Successfully saved ${batch.length} transactions!` });
      setBatch([]);
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: `Batch save error: ${err.response?.data?.error || err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete transaction ${label}?`)) return;
    try {
      await deleteTransaction(id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  const handleToggleSelect = (id) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const allSelected = rows.length > 0 && rows.every((tx) => selected.has(tx._id || tx.id));

  const handleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((tx) => tx._id || tx.id)));

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.size} selected transaction(s)?`)) return;
    try {
      await Promise.all([...selected].map((id) => deleteTransaction(id)));
      setSelected(new Set());
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    }
  };

  return (
    <>
      <div className="de-form-card">
        <h3 className="de-form-title">Add Transaction</h3>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleAddToBatch}>
          <div className="de-row">
            <div className="de-field">
              <label>Category</label>
              <select value={form.category} onChange={handleCategoryChange}>
                <option value="STOCK">Stock Trade</option>
                <option value="DEBT">Debt Payment</option>
                <option value="INCOME">Income / Salary</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="de-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} required />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>
                {form.category === 'STOCK' ? 'Ticker' :
                 form.category === 'DEBT' ? 'Debt Name' :
                 form.category === 'INCOME' ? 'Source of Income' :
                 'Expense Name'}
              </label>
              {form.category === 'DEBT' ? (
                <select value={form.name} onChange={set('name')} required>
                  <option value="" disabled>Select Debt</option>
                  {debts.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <input value={form.name} onChange={set('name')} required placeholder={form.category === 'STOCK' ? 'AAPL' : 'KTA BCA'} />
              )}
            </div>
            <div className="de-field">
              <label>Type / Logic</label>
              {form.category === 'STOCK' ? (
                <select value={form.type} onChange={set('type')}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              ) : form.category === 'INCOME' ? (
                <select value={form.type} onChange={set('type')}>
                  <option value="SALARY">SALARY</option>
                  <option value="BONUS">BONUS</option>
                  <option value="INTEREST">INTEREST</option>
                  <option value="OTHER">OTHER</option>
                </select>
              ) : form.category === 'EXPENSE' ? (
                <select value={form.type} onChange={set('type')}>
                  <option value="FOOD">FOOD</option>
                  <option value="BILL">BILL</option>
                  <option value="TRANSPORT">TRANSPORT</option>
                  <option value="OTHER">OTHER</option>
                </select>
              ) : (
                <input value={form.type} onChange={set('type')} placeholder="PAYMENT" required />
              )}
            </div>
          </div>

          {form.category === 'STOCK' && (
            <div className="de-row">
              <div className="de-field">
                <label>Market</label>
                <select value={form.market} onChange={set('market')}>
                  <option value="US">US</option>
                  <option value="ID">Indonesia (IDX)</option>
                </select>
              </div>
              <div className="de-field">
                <label>Shares</label>
                <input type="number" value={form.shares} onChange={set('shares')} required min="0" step="any" placeholder="10" />
              </div>
            </div>
          )}

          <div className="de-row">
            {form.category === 'STOCK' && (
              <div className="de-field">
                <label>Price ({currency})</label>
                <input type="number" value={form.price} onChange={set('price')} required min="0" step="any" placeholder="150.00" />
              </div>
            )}
            <div className="de-field">
              <label>Total / Amount ({form.category === 'STOCK' ? currency : 'IDR'})</label>
              <input type="number" value={form.total} onChange={set('total')} required step="any" placeholder="1500.00" />
            </div>
          </div>
          <button type="submit" className="de-submit" disabled={batch.length >= 12}>
            Add to Batch ({batch.length}/12)
          </button>
        </form>
      </div>

      {batch.length > 0 && (
        <div className="de-list-card" style={{ border: '1px solid var(--accent)', marginTop: 16 }}>
          <div className="de-list-header">
            <span className="de-list-title" style={{ color: 'var(--accent)' }}>Pending Batch</span>
            <button className="de-submit" onClick={handleSubmitBatch} disabled={saving} style={{ margin: 0, padding: '8px 16px', fontSize: 13, background: 'var(--accent)', cursor: 'pointer' }}>
              {saving ? 'Saving...' : `Submit Batch (${batch.length})`}
            </button>
          </div>
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr>
                  <th>Category</th><th>Date</th><th>Name</th><th>Type</th><th>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {batch.map((tx, idx) => (
                  <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{tx.category}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td><strong>{tx.name}</strong></td>
                    <td>
                      <span style={{ 
                        color: (tx.type === 'BUY' || tx.category === 'EXPENSE' || tx.category === 'DEBT') ? 'var(--red)' : 
                               (tx.type === 'SELL' || tx.category === 'INCOME') ? 'var(--green)' : 'inherit' 
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.category === 'STOCK' ? fmtMoney(tx.total) : fmtIDR(tx.total)}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn delete" title="Remove from batch" onClick={() => handleRemoveFromBatch(idx)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="de-list-card" style={{ marginTop: 16 }}>
        <div className="de-list-header">
          <span className="de-list-title">Transactions</span>
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
                  <th>Category</th><th>Date</th><th>Name</th><th>Type</th><th>Total / Amount</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => {
                  const txId = tx._id || tx.id;
                  const name = tx.name || tx.ticker;
                  return (
                    <tr key={txId} className={selected.has(txId) ? 'de-row-selected' : ''}>
                      <td className="de-check-cell">
                        <input type="checkbox" checked={selected.has(txId)} onChange={() => handleToggleSelect(txId)} />
                      </td>
                      <td>{tx.category || 'STOCK'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                      <td><strong>{name}</strong></td>
                      <td>
                        <span style={{ 
                          color: (tx.type === 'BUY' || tx.category === 'EXPENSE' || tx.category === 'DEBT') ? 'var(--red)' : 
                                 (tx.type === 'SELL' || tx.category === 'INCOME') ? 'var(--green)' : 'inherit' 
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td>{tx.category === 'STOCK' ? fmtMoney(tx.total) : fmtIDR(tx.total)}</td>
                      <td>
                        <div className="de-action-btns">
                          <button className="de-icon-btn delete" title="Delete"
                            onClick={() => handleDelete(txId, `${tx.type} ${name}`)}>
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No transactions yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default TransactionForm;
