import React, { useState, useEffect } from 'react';
import { fetchTransactions, createTransaction, deleteTransaction } from '../../../api/portfolioApi';
import { TrashIcon } from './Icons';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY  = { date: today(), ticker: '', type: 'BUY', market: 'US', shares: '', price: '', total: '' };

function TransactionForm() {
  const [form,    setForm]    = useState(EMPTY);
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then(setRows)
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load transactions.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const updated = { ...f, [field]: val };
      if ((field === 'shares' || field === 'price') && updated.shares && updated.price) {
        updated.total = (parseFloat(updated.shares) * parseFloat(updated.price)).toFixed(2);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await createTransaction({ ...form, shares: +form.shares, price: +form.price, total: +form.total });
      setStatus({ type: 'success', msg: `${form.type} ${form.ticker.toUpperCase()} recorded.` });
      setForm({ ...EMPTY, date: today() });
      setTick((t) => t + 1);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete transaction ${label}?`)) return;
    try {
      await deleteTransaction(id);
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
        <form onSubmit={handleSubmit}>
          <div className="de-row">
            <div className="de-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div className="de-field">
              <label>Ticker</label>
              <input value={form.ticker} onChange={set('ticker')} required placeholder="AAPL" />
            </div>
          </div>
          <div className="de-row">
            <div className="de-field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
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
              <label>Price (USD)</label>
              <input type="number" value={form.price} onChange={set('price')} required min="0" step="any" placeholder="150.00" />
            </div>
          </div>
          <div className="de-field">
            <label>Total (auto-computed)</label>
            <input type="number" value={form.total} onChange={set('total')} required step="any" placeholder="1500.00" />
          </div>
          <button type="submit" className="de-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="de-list-card">
        <div className="de-list-header">
          <span className="de-list-title">Transactions</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr><th>Date</th><th>Ticker</th><th>Type</th><th>Market</th><th>Shares</th><th>Price</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((tx) => (
                  <tr key={tx._id || tx.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td><strong>{tx.ticker}</strong></td>
                    <td><span style={{ color: tx.type === 'BUY' ? 'var(--green)' : 'var(--red)' }}>{tx.type}</span></td>
                    <td>{tx.market}</td>
                    <td>{tx.shares}</td>
                    <td>${tx.price}</td>
                    <td>${tx.total?.toLocaleString()}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn delete" title="Delete"
                          onClick={() => handleDelete(tx._id || tx.id, `${tx.type} ${tx.ticker}`)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
