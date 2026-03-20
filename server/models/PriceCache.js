const mongoose = require('mongoose');

const priceCacheSchema = new mongoose.Schema({
  ticker:        { type: String, required: true, uppercase: true, unique: true, trim: true },
  currentPrice:  { type: Number, required: true, min: 0 },
  previousClose: { type: Number, required: true, min: 0 },
  updatedAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('PriceCache', priceCacheSchema);
