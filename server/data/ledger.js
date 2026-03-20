/**
 * Chart of accounts with opening balances (as of Jan 1 2024).
 * normalBalance: the side that increases the account ('Debit' or 'Credit').
 */
const accounts = [
  // ── Assets ──────────────────────────────────────────────────────────────
  { id: 'A1000', code: '1000', name: 'Cash',               type: 'Asset',     normalBalance: 'Debit',  openingBalance: 850.00    },
  { id: 'A1010', code: '1010', name: 'Checking Account',   type: 'Asset',     normalBalance: 'Debit',  openingBalance: 8420.00   },
  { id: 'A1020', code: '1020', name: 'Savings Account',    type: 'Asset',     normalBalance: 'Debit',  openingBalance: 22500.00  },
  { id: 'A1030', code: '1030', name: 'Investment Account', type: 'Asset',     normalBalance: 'Debit',  openingBalance: 95000.00  },
  // ── Liabilities ─────────────────────────────────────────────────────────
  { id: 'L2000', code: '2000', name: 'Credit Card Payable',type: 'Liability', normalBalance: 'Credit', openingBalance: 1250.00   },
  { id: 'L2010', code: '2010', name: 'Mortgage Payable',   type: 'Liability', normalBalance: 'Credit', openingBalance: 185000.00 },
  // ── Equity ──────────────────────────────────────────────────────────────
  { id: 'E3000', code: '3000', name: "Owner's Equity",     type: 'Equity',    normalBalance: 'Credit', openingBalance: 59480.00  },
  // ── Income ──────────────────────────────────────────────────────────────
  { id: 'I4000', code: '4000', name: 'Salary Income',      type: 'Income',    normalBalance: 'Credit', openingBalance: 0         },
  { id: 'I4010', code: '4010', name: 'Dividend Income',    type: 'Income',    normalBalance: 'Credit', openingBalance: 0         },
  { id: 'I4020', code: '4020', name: 'Interest Income',    type: 'Income',    normalBalance: 'Credit', openingBalance: 0         },
  // ── Expenses ────────────────────────────────────────────────────────────
  { id: 'X5000', code: '5000', name: 'Rent',               type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5010', code: '5010', name: 'Groceries & Dining', type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5020', code: '5020', name: 'Utilities',          type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5030', code: '5030', name: 'Transportation',     type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5040', code: '5040', name: 'Entertainment',      type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5050', code: '5050', name: 'Healthcare',         type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5060', code: '5060', name: 'Subscriptions',      type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
  { id: 'X5070', code: '5070', name: 'Insurance',          type: 'Expense',   normalBalance: 'Debit',  openingBalance: 0         },
];

/**
 * Journal entries — double-entry: sum(debits) must equal sum(credits) per entry.
 * lines: [{ accountId, debit, credit }]
 */
const entries = [
  // ── January 2024 ────────────────────────────────────────────────────────
  {
    id: 'JE001', date: '2024-01-05', description: 'January salary deposit',
    lines: [
      { accountId: 'A1010', debit: 5500.00, credit: 0 },
      { accountId: 'I4000', debit: 0, credit: 5500.00 },
    ],
  },
  {
    id: 'JE002', date: '2024-01-05', description: 'Monthly savings transfer',
    lines: [
      { accountId: 'A1020', debit: 800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 800.00 },
    ],
  },
  {
    id: 'JE003', date: '2024-01-06', description: 'January rent payment',
    lines: [
      { accountId: 'X5000', debit: 1800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1800.00 },
    ],
  },
  {
    id: 'JE004', date: '2024-01-08', description: 'Grocery shopping – Whole Foods',
    lines: [
      { accountId: 'X5010', debit: 145.60, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 145.60 },
    ],
  },
  {
    id: 'JE005', date: '2024-01-10', description: 'Electric & internet bills',
    lines: [
      { accountId: 'X5020', debit: 132.40, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 132.40 },
    ],
  },
  {
    id: 'JE006', date: '2024-01-12', description: 'Investment account contribution – ETF purchase',
    lines: [
      { accountId: 'A1030', debit: 1000.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1000.00 },
    ],
  },
  {
    id: 'JE007', date: '2024-01-15', description: 'Monthly transportation (transit pass + Uber)',
    lines: [
      { accountId: 'X5030', debit: 98.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 98.00 },
    ],
  },
  {
    id: 'JE008', date: '2024-01-18', description: 'Dinner & movies',
    lines: [
      { accountId: 'X5040', debit: 112.50, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 112.50 },
    ],
  },
  {
    id: 'JE009', date: '2024-01-20', description: 'Savings account interest earned',
    lines: [
      { accountId: 'A1020', debit: 56.25, credit: 0 },
      { accountId: 'I4020', debit: 0, credit: 56.25 },
    ],
  },
  {
    id: 'JE010', date: '2024-01-22', description: 'Monthly streaming & software subscriptions',
    lines: [
      { accountId: 'X5060', debit: 48.97, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 48.97 },
    ],
  },
  {
    id: 'JE011', date: '2024-01-25', description: 'Health insurance premium',
    lines: [
      { accountId: 'X5070', debit: 220.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 220.00 },
    ],
  },
  {
    id: 'JE012', date: '2024-01-28', description: 'Doctor visit co-pay',
    lines: [
      { accountId: 'X5050', debit: 40.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 40.00 },
    ],
  },
  {
    id: 'JE013', date: '2024-01-31', description: 'Credit card payment',
    lines: [
      { accountId: 'L2000', debit: 480.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 480.00 },
    ],
  },

  // ── February 2024 ───────────────────────────────────────────────────────
  {
    id: 'JE014', date: '2024-02-05', description: 'February salary deposit',
    lines: [
      { accountId: 'A1010', debit: 5500.00, credit: 0 },
      { accountId: 'I4000', debit: 0, credit: 5500.00 },
    ],
  },
  {
    id: 'JE015', date: '2024-02-05', description: 'Monthly savings transfer',
    lines: [
      { accountId: 'A1020', debit: 800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 800.00 },
    ],
  },
  {
    id: 'JE016', date: '2024-02-06', description: 'February rent payment',
    lines: [
      { accountId: 'X5000', debit: 1800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1800.00 },
    ],
  },
  {
    id: 'JE017', date: '2024-02-09', description: 'Grocery shopping – Trader Joes & Costco',
    lines: [
      { accountId: 'X5010', debit: 198.30, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 198.30 },
    ],
  },
  {
    id: 'JE018', date: '2024-02-10', description: 'Utilities – electric & internet',
    lines: [
      { accountId: 'X5020', debit: 118.75, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 118.75 },
    ],
  },
  {
    id: 'JE019', date: '2024-02-12', description: 'Investment contribution – index fund',
    lines: [
      { accountId: 'A1030', debit: 1000.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1000.00 },
    ],
  },
  {
    id: 'JE020', date: '2024-02-14', description: 'Valentines dinner',
    lines: [
      { accountId: 'X5040', debit: 185.00, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 185.00 },
    ],
  },
  {
    id: 'JE021', date: '2024-02-15', description: 'Dividend from AAPL & VTI',
    lines: [
      { accountId: 'A1010', debit: 124.50, credit: 0 },
      { accountId: 'I4010', debit: 0, credit: 124.50 },
    ],
  },
  {
    id: 'JE022', date: '2024-02-18', description: 'Transportation',
    lines: [
      { accountId: 'X5030', debit: 85.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 85.00 },
    ],
  },
  {
    id: 'JE023', date: '2024-02-20', description: 'Savings account interest earned',
    lines: [
      { accountId: 'A1020', debit: 58.90, credit: 0 },
      { accountId: 'I4020', debit: 0, credit: 58.90 },
    ],
  },
  {
    id: 'JE024', date: '2024-02-22', description: 'Subscriptions',
    lines: [
      { accountId: 'X5060', debit: 48.97, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 48.97 },
    ],
  },
  {
    id: 'JE025', date: '2024-02-25', description: 'Health insurance premium',
    lines: [
      { accountId: 'X5070', debit: 220.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 220.00 },
    ],
  },
  {
    id: 'JE026', date: '2024-02-28', description: 'Credit card payment',
    lines: [
      { accountId: 'L2000', debit: 510.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 510.00 },
    ],
  },

  // ── March 2024 ──────────────────────────────────────────────────────────
  {
    id: 'JE027', date: '2024-03-05', description: 'March salary deposit',
    lines: [
      { accountId: 'A1010', debit: 5500.00, credit: 0 },
      { accountId: 'I4000', debit: 0, credit: 5500.00 },
    ],
  },
  {
    id: 'JE028', date: '2024-03-05', description: 'Monthly savings transfer',
    lines: [
      { accountId: 'A1020', debit: 800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 800.00 },
    ],
  },
  {
    id: 'JE029', date: '2024-03-06', description: 'March rent payment',
    lines: [
      { accountId: 'X5000', debit: 1800.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1800.00 },
    ],
  },
  {
    id: 'JE030', date: '2024-03-08', description: 'Grocery shopping',
    lines: [
      { accountId: 'X5010', debit: 167.45, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 167.45 },
    ],
  },
  {
    id: 'JE031', date: '2024-03-10', description: 'Utilities',
    lines: [
      { accountId: 'X5020', debit: 109.80, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 109.80 },
    ],
  },
  {
    id: 'JE032', date: '2024-03-12', description: 'Investment contribution',
    lines: [
      { accountId: 'A1030', debit: 1000.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 1000.00 },
    ],
  },
  {
    id: 'JE033', date: '2024-03-14', description: 'Transportation',
    lines: [
      { accountId: 'X5030', debit: 92.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 92.00 },
    ],
  },
  {
    id: 'JE034', date: '2024-03-16', description: 'Concert tickets',
    lines: [
      { accountId: 'X5040', debit: 210.00, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 210.00 },
    ],
  },
  {
    id: 'JE035', date: '2024-03-18', description: 'Dividend from MSFT & QQQ',
    lines: [
      { accountId: 'A1010', debit: 138.20, credit: 0 },
      { accountId: 'I4010', debit: 0, credit: 138.20 },
    ],
  },
  {
    id: 'JE036', date: '2024-03-20', description: 'Savings account interest earned',
    lines: [
      { accountId: 'A1020', debit: 61.40, credit: 0 },
      { accountId: 'I4020', debit: 0, credit: 61.40 },
    ],
  },
  {
    id: 'JE037', date: '2024-03-22', description: 'Annual physical exam',
    lines: [
      { accountId: 'X5050', debit: 75.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 75.00 },
    ],
  },
  {
    id: 'JE038', date: '2024-03-22', description: 'Subscriptions',
    lines: [
      { accountId: 'X5060', debit: 48.97, credit: 0 },
      { accountId: 'L2000', debit: 0, credit: 48.97 },
    ],
  },
  {
    id: 'JE039', date: '2024-03-25', description: 'Health insurance premium',
    lines: [
      { accountId: 'X5070', debit: 220.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 220.00 },
    ],
  },
  {
    id: 'JE040', date: '2024-03-31', description: 'Credit card payment',
    lines: [
      { accountId: 'L2000', debit: 540.00, credit: 0 },
      { accountId: 'A1010', debit: 0, credit: 540.00 },
    ],
  },
];

module.exports = { accounts, entries };
