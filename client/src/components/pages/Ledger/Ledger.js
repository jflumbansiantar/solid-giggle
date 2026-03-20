import React, { useState } from 'react';
import { useLedger }    from '../../../hooks/useLedger';
import LoadingScreen    from '../../shared/LoadingScreen';
import ErrorScreen      from '../../shared/ErrorScreen';
import LedgerSummary    from './LedgerSummary';
import AccountsTable    from './AccountsTable';
import JournalTable     from './JournalTable';
import './Ledger.css';

const SUB_TABS = [
  { id: 'summary',  label: 'Summary'         },
  { id: 'accounts', label: 'Chart of Accounts' },
  { id: 'journal',  label: 'Journal Entries'  },
];

function Ledger() {
  const { accounts, entries, summary, loading, error } = useLedger();
  const [subTab, setSubTab] = useState('summary');

  if (loading) return <LoadingScreen message="Loading general ledger…" />;
  if (error)   return <ErrorScreen message={error} />;

  return (
    <div className="ledger-page">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 className="section-title">General Ledger</h2>
          <p className="section-subtitle">Double-entry bookkeeping · {entries.length} journal entries · {accounts.length} accounts</p>
        </div>
      </div>

      {/* ── Sub-tab nav ── */}
      <div className="tab-nav" style={{ marginBottom: 24 }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${subTab === t.id ? 'active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'summary'  && <LedgerSummary summary={summary} />}
      {subTab === 'accounts' && <AccountsTable accounts={accounts} />}
      {subTab === 'journal'  && <JournalTable  entries={entries} />}
    </div>
  );
}

export default Ledger;
