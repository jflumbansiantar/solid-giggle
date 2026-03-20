import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSetting } from '../../../api/portfolioApi';
import { PencilIcon } from './Icons';

const EMPTY = { key: '', value: '' };

function SettingForm() {
  const [form,    setForm]    = useState(EMPTY);
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchSettings()
      .then((flat) => setRows(Object.entries(flat).map(([key, value]) => ({ key, value }))))
      .catch(() => setStatus({ type: 'error', msg: 'Failed to load settings.' }))
      .finally(() => setLoading(false));
  }, [tick]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleEdit = (key, value) => {
    setForm({ key, value: String(value) });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const parsedValue = isNaN(form.value) || form.value === '' ? form.value : +form.value;
    try {
      await updateSetting(form.key.trim(), parsedValue);
      setStatus({ type: 'success', msg: `Setting "${form.key}" saved.` });
      setForm(EMPTY);
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
        <h3 className="de-form-title">Upsert Setting</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Creates or updates a key-value setting. Numeric strings are stored as numbers.
        </p>
        {status && <div className={`de-alert ${status.type}`}>{status.msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="de-field">
            <label>Key</label>
            <input value={form.key} onChange={set('key')} required placeholder="usdToIdr" />
          </div>
          <div className="de-field">
            <label>Value</label>
            <input value={form.value} onChange={set('value')} required placeholder="16250" />
          </div>
          <button type="submit" className="de-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Setting'}
          </button>
        </form>
      </div>

      <div className="de-list-card">
        <div className="de-list-header">
          <span className="de-list-title">Settings</span>
          <span className="de-count">{rows.length} records</span>
        </div>
        {loading ? <p className="de-hint">Loading…</p> : (
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr><th>Key</th><th>Value</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.key}>
                    <td><strong>{s.key}</strong></td>
                    <td>{String(s.value)}</td>
                    <td>
                      <div className="de-action-btns">
                        <button className="de-icon-btn edit" title="Edit" onClick={() => handleEdit(s.key, s.value)}>
                          <PencilIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="de-hint">No settings yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}

export default SettingForm;
