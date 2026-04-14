const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date:     { type: Date, required: true },
  category: { type: String, enum: ['STOCK', 'DEBT', 'INCOME', 'EXPENSE'], default: 'STOCK' },
  name:     { type: String, required: true, trim: true }, // General name (Stock Ticker, "Salary", "KTA BCA", etc.)
  type:     { type: String, required: true }, // e.g. BUY, SELL, SALARY, PAYMENT, BONUS, FOOD
  total:    { type: Number, required: true, min: 0 },
  
  // Optional Stock specific fields
  market:   { type: String, enum: ['US', 'ID'] }, // not required globally
  shares:   { type: Number, min: 0 },
  price:    { type: Number, min: 0 },
}, { timestamps: true });

// Fallback logic for queries that might be broken by missing 'ticker' or 'ticker' alias
// Adding virtual getter/setter for ticker mapped to name for back-compatibility
transactionSchema.virtual('ticker')
  .get(function() { return this.name; })
  .set(function(v) { this.name = v; });

// Ensure virtuals are included in JSON and Objects
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
