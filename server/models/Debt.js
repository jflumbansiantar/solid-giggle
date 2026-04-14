const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  type:           { type: String, enum: ['Credit Card', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Student Loan', 'Other'], required: true },
  balance:        { type: Number, required: true, min: 0 },
  monthlyInterestRate: { type: Number, min: 0, default: null },  // monthly %, e.g. 1.5
  interestRate:        { type: Number, required: true, min: 0 }, // annual EAR %, derived from monthly
  tenor:               { type: Number, min: 1, default: null },  // loan term in months
  minimumPayment:      { type: Number, required: true, min: 0 }, // monthly
  dueDay:              { type: Number, min: 1, max: 31, default: 1 }, // day of month payment is due
  currency:       { type: String, enum: ['USD', 'IDR'], default: 'USD' },
  debtApp:        { type: mongoose.Schema.Types.Mixed, default: '' }, // primary type is String; Mixed allows other types to be stored
  notes:          { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
