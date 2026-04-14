const Transaction = require('../models/Transaction');

async function getTransactions() {
  const txs = await Transaction.find().sort({ date: -1 }).lean();
  return txs.map(tx => ({
    ...tx,
    // Provide a fallback for older DB records that have 'ticker' instead of 'name' and no 'category'
    name: tx.name || tx.ticker,
    ticker: tx.ticker || tx.name,
    category: tx.category || 'STOCK'
  }));
}

module.exports = { getTransactions };
