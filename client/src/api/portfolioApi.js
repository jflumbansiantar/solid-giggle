import axios from 'axios';

export const fetchPortfolio       = () => axios.get('/api/portfolio').then((r) => r.data);
export const fetchHoldings        = () => axios.get('/api/holdings').then((r) => r.data);
export const fetchTransactions    = () => axios.get('/api/transactions').then((r) => r.data);
export const fetchPerformance     = () => axios.get('/api/performance').then((r) => r.data);
export const fetchLedgerAccounts  = () => axios.get('/api/ledger/accounts').then((r) => r.data);
export const fetchLedgerEntries   = () => axios.get('/api/ledger/entries').then((r) => r.data);
export const fetchLedgerSummary   = () => axios.get('/api/ledger/summary').then((r) => r.data);
