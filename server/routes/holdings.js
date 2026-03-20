const express        = require('express');
const { getHoldings } = require('../services/holdingsService');
const Holding        = require('../models/Holding');

const router = express.Router();

// GET all holdings (enriched with prices)
router.get('/', async (req, res) => {
  try {
    res.json(await getHoldings());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST — insert a new holding
// Body: { ticker, name, type, market, shares, avgCost }
router.post('/', async (req, res) => {
  try {
    const holding = await Holding.create(req.body);
    res.status(201).json(holding);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /:ticker — update shares / avgCost of an existing holding
router.patch('/:ticker', async (req, res) => {
  try {
    const holding = await Holding.findOneAndUpdate(
      { ticker: req.params.ticker.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );
    if (!holding) return res.status(404).json({ error: 'Holding not found' });
    res.json(holding);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /:ticker
router.delete('/:ticker', async (req, res) => {
  try {
    const holding = await Holding.findOneAndDelete({ ticker: req.params.ticker.toUpperCase() });
    if (!holding) return res.status(404).json({ error: 'Holding not found' });
    res.json({ deleted: holding.ticker });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
