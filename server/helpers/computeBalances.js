/**
 * Computes the current balance for each account by replaying journal entry lines
 * over the opening balances.
 *
 * Rules for double-entry:
 *   Debit-normal accounts (Asset, Expense):  balance += debit - credit
 *   Credit-normal accounts (Liability, Equity, Income): balance += credit - debit
 *
 * @param {Array} accounts - raw accounts from data layer
 * @param {Array} entries  - journal entries with lines
 * @returns {Array} accounts enriched with { balance, totalDebits, totalCredits }
 */
function computeBalances(accounts, entries) {
  // Build per-account activity totals
  const activity = {};
  accounts.forEach((a) => {
    activity[a.id] = { totalDebits: 0, totalCredits: 0 };
  });

  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      if (activity[line.accountId]) {
        activity[line.accountId].totalDebits  += line.debit;
        activity[line.accountId].totalCredits += line.credit;
      }
    });
  });

  return accounts.map((a) => {
    const { totalDebits, totalCredits } = activity[a.id];
    const netActivity =
      a.normalBalance === 'Debit'
        ? totalDebits - totalCredits
        : totalCredits - totalDebits;
    const balance = +(a.openingBalance + netActivity).toFixed(2);

    return {
      ...a,
      balance,
      totalDebits:  +totalDebits.toFixed(2),
      totalCredits: +totalCredits.toFixed(2),
    };
  });
}

module.exports = computeBalances;
