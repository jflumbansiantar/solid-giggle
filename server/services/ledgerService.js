const LedgerAccount   = require('../models/LedgerAccount');
const JournalEntry    = require('../models/JournalEntry');
const computeBalances = require('../helpers/computeBalances');

async function getAccounts() {
  const [accounts, entries] = await Promise.all([
    LedgerAccount.find().lean(),
    JournalEntry.find().lean(),
  ]);
  return computeBalances(accounts, entries);
}

async function getEntries() {
  const [accounts, entries] = await Promise.all([
    LedgerAccount.find().lean(),
    JournalEntry.find().sort({ date: -1 }).lean(),
  ]);
  const accountMap = Object.fromEntries(accounts.map((a) => [a._id, a]));
  return entries.map((e) => ({
    ...e,
    lines: e.lines.map((l) => ({
      ...l,
      accountName: accountMap[l.accountId]?.name ?? l.accountId,
      accountType: accountMap[l.accountId]?.type ?? '',
    })),
  }));
}

async function getSummary() {
  const [accounts, entries] = await Promise.all([
    LedgerAccount.find().lean(),
    JournalEntry.find().lean(),
  ]);
  const withBalances = computeBalances(accounts, entries);
  const byType = (type) => withBalances.filter((a) => a.type === type);

  const totalIncome      = +byType('Income').reduce((s, a)    => s + a.balance, 0).toFixed(2);
  const totalExpenses    = +byType('Expense').reduce((s, a)   => s + a.balance, 0).toFixed(2);
  const netIncome        = +(totalIncome - totalExpenses).toFixed(2);
  const totalAssets      = +byType('Asset').reduce((s, a)     => s + a.balance, 0).toFixed(2);
  const totalLiabilities = +byType('Liability').reduce((s, a) => s + a.balance, 0).toFixed(2);
  const totalEquity      = +byType('Equity').reduce((s, a)    => s + a.balance, 0).toFixed(2);
  const netWorth         = +(totalAssets - totalLiabilities).toFixed(2);

  const incomeBreakdown = byType('Income').map((a) => ({
    name:       a.name,
    balance:    a.balance,
    percentage: totalIncome > 0 ? +((a.balance / totalIncome) * 100).toFixed(1) : 0,
  }));

  const expenseBreakdown = byType('Expense')
    .filter((a) => a.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .map((a) => ({
      name:       a.name,
      balance:    a.balance,
      percentage: totalExpenses > 0 ? +((a.balance / totalExpenses) * 100).toFixed(1) : 0,
    }));

  const monthlyMap = {};
  entries.forEach((entry) => {
    const month = new Date(entry.date).toISOString().slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
    entry.lines.forEach((line) => {
      const acc = accounts.find((a) => a._id === line.accountId);
      if (!acc) return;
      if (acc.type === 'Income')  monthlyMap[month].income   += line.credit;
      if (acc.type === 'Expense') monthlyMap[month].expenses += line.debit;
    });
  });

  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      income:    +v.income.toFixed(2),
      expenses:  +v.expenses.toFixed(2),
      netIncome: +(v.income - v.expenses).toFixed(2),
    }));

  return {
    totalIncome, totalExpenses, netIncome,
    totalAssets, totalLiabilities, totalEquity, netWorth,
    incomeBreakdown, expenseBreakdown, monthlyTrend,
  };
}

module.exports = { getAccounts, getEntries, getSummary };
