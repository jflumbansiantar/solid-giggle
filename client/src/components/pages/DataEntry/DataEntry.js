import React, { useState } from 'react';
import HoldingForm      from './HoldingForm';
import PriceCacheForm   from './PriceCacheForm';
import TransactionForm  from './TransactionForm';
import LedgerAccountForm from './LedgerAccountForm';
import JournalEntryForm from './JournalEntryForm';
import SettingForm      from './SettingForm';
import './DataEntry.css';

const SECTIONS = [
  { id: 'holdings',   label: 'Holdings'        },
  { id: 'prices',     label: 'Price Cache'     },
  { id: 'tx',         label: 'Transactions'    },
  { id: 'accounts',   label: 'Ledger Accounts' },
  { id: 'entries',    label: 'Journal Entries' },
  { id: 'settings',   label: 'Settings'        },
];

function DataEntry() {
  const [section, setSection] = useState('holdings');

  return (
    <div className="de-page">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Data Entry</h2>
          <p className="section-subtitle">Add, edit, or remove records from the database</p>
        </div>
      </div>

      <div className="de-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`de-tab${section === s.id ? ' active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="de-body">
        {section === 'holdings' && <HoldingForm />}
        {section === 'prices'   && <PriceCacheForm />}
        {section === 'tx'       && <TransactionForm />}
        {section === 'accounts' && <LedgerAccountForm />}
        {section === 'entries'  && <JournalEntryForm />}
        {section === 'settings' && <SettingForm />}
      </div>
    </div>
  );
}

export default DataEntry;
