const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  ticker:  { type: String, required: true, uppercase: true, unique: true, trim: true },
  name:    { type: String, required: true },
  type:    { type: String, enum: ['Stock', 'ETF', 'Crypto'], required: true },
  market:  { type: String, enum: ['US', 'ID'], required: true },
  shares:  { type: Number, required: true, min: 0 },
  avgCost: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Holding', holdingSchema);
