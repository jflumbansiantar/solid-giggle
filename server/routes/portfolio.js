const express                  = require('express');
const { getPortfolioSummary }  = require('../services/portfolioService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await getPortfolioSummary());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
