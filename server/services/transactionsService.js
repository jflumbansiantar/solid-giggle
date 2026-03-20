const Transaction = require('../models/Transaction');

async function getTransactions() {
  return Transaction.find().sort({ date: -1 }).lean();
}

module.exports = { getTransactions };
