const mongoose = require('mongoose');

const ledgerAccountSchema = new mongoose.Schema({
  _id:            { type: String },   // business ID e.g. 'A1000', 'L2000'
  code:           { type: String, required: true },
  name:           { type: String, required: true },
  type:           { type: String, enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'], required: true },
  normalBalance:  { type: String, enum: ['Debit', 'Credit'], required: true },
  openingBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LedgerAccount', ledgerAccountSchema);
