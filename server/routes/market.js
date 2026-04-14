const express            = require('express');
const { getLiveQuotes }  = require('../services/marketService');

const router = express.Router();

// GET /api/market/quotes — live quotes for all holdings
router.get('/quotes', async (_req, res) => {
  try {
    res.json(await getLiveQuotes());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
