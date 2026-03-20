const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date:   { type: Date, required: true },
  ticker: { type: String, required: true, uppercase: true, trim: true },
  type:   { type: String, enum: ['BUY', 'SELL'], required: true },
  market: { type: String, enum: ['US', 'ID'], required: true },
  shares: { type: Number, required: true, min: 0 },
  price:  { type: Number, required: true, min: 0 },
  total:  { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
