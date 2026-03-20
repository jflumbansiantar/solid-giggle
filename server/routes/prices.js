const express    = require('express');
const PriceCache = require('../models/PriceCache');

const router = express.Router();

// GET all cached prices
router.get('/', async (req, res) => {
  try {
    res.json(await PriceCache.find().lean());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST — upsert price for a ticker (insert if new, update if exists)
// Body: { ticker, currentPrice, previousClose }
router.post('/', async (req, res) => {
  try {
    const { ticker, currentPrice, previousClose } = req.body;
    const price = await PriceCache.findOneAndUpdate(
      { ticker: ticker.toUpperCase() },
      { currentPrice, previousClose, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(price);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /:ticker
router.delete('/:ticker', async (req, res) => {
  try {
    const price = await PriceCache.findOneAndDelete({ ticker: req.params.ticker.toUpperCase() });
    if (!price) return res.status(404).json({ error: 'Price not found' });
    res.json({ deleted: req.params.ticker.toUpperCase() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
