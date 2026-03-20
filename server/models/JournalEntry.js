const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  debit:     { type: Number, default: 0, min: 0 },
  credit:    { type: Number, default: 0, min: 0 },
}, { _id: false });

const journalEntrySchema = new mongoose.Schema({
  _id:         { type: String },   // business ID e.g. 'JE001'
  date:        { type: Date, required: true },
  description: { type: String, required: true },
  lines:       { type: [lineSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
