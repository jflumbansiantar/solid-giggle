import axios from 'axios';

export const fetchPortfolio       = () => axios.get('/api/portfolio').then((r) => r.data);
export const fetchHoldings        = () => axios.get('/api/holdings').then((r) => r.data);
export const fetchTransactions    = () => axios.get('/api/transactions').then((r) => r.data);
export const fetchPerformance     = () => axios.get('/api/performance').then((r) => r.data);
export const fetchLedgerAccounts  = () => axios.get('/api/ledger/accounts').then((r) => r.data);
export const fetchLedgerEntries   = () => axios.get('/api/ledger/entries').then((r) => r.data);
export const fetchLedgerSummary   = () => axios.get('/api/ledger/summary').then((r) => r.data);
export const fetchSettings        = () => axios.get('/api/settings').then((r) => r.data);
export const updateSetting        = (key, value) => axios.patch(`/api/settings/${key}`, { value }).then((r) => r.data);

// ── Holdings CRUD ─────────────────────────────────────────────────────────────
export const createHolding = (data)         => axios.post('/api/holdings', data).then((r) => r.data);
export const updateHolding = (ticker, data) => axios.patch(`/api/holdings/${ticker}`, data).then((r) => r.data);
export const deleteHolding = (ticker)       => axios.delete(`/api/holdings/${ticker}`).then((r) => r.data);

// ── Transactions CRUD ─────────────────────────────────────────────────────────
export const createTransaction = (data) => axios.post('/api/transactions', data).then((r) => r.data);
export const deleteTransaction = (id)   => axios.delete(`/api/transactions/${id}`).then((r) => r.data);

// ── Price Cache CRUD ──────────────────────────────────────────────────────────
export const fetchPriceCache  = ()       => axios.get('/api/price-cache').then((r) => r.data);
export const upsertPriceCache = (data)   => axios.post('/api/price-cache', data).then((r) => r.data);
export const deletePriceCache = (ticker) => axios.delete(`/api/price-cache/${ticker}`).then((r) => r.data);

// ── Debts CRUD ────────────────────────────────────────────────────────────
export const fetchDebts  = ()         => axios.get('/api/debts').then((r) => r.data);
export const createDebt  = (data)     => axios.post('/api/debts', data).then((r) => r.data);
export const updateDebt  = (id, data) => axios.patch(`/api/debts/${id}`, data).then((r) => r.data);
export const deleteDebt  = (id)       => axios.delete(`/api/debts/${id}`).then((r) => r.data);

// ── Ledger Accounts CRUD ──────────────────────────────────────────────────────
export const createLedgerAccount = (data)      => axios.post('/api/ledger/accounts', data).then((r) => r.data);
export const updateLedgerAccount = (id, data)  => axios.patch(`/api/ledger/accounts/${id}`, data).then((r) => r.data);

// ── Journal Entries CRUD ──────────────────────────────────────────────────────
export const createJournalEntry = (data) => axios.post('/api/ledger/entries', data).then((r) => r.data);
export const deleteJournalEntry = (id)   => axios.delete(`/api/ledger/entries/${id}`).then((r) => r.data);
