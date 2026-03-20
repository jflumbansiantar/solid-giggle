const express                 = require('express');
const { getTransactions }     = require('../services/transactionsService');
const Transaction             = require('../models/Transaction');

const router = express.Router();

// GET all transactions (sorted newest first)
router.get('/', async (req, res) => {
  try {
    res.json(await getTransactions());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST — insert a new transaction
// Body: { date, ticker, type, market, shares, price, total }
router.post('/', async (req, res) => {
  try {
    const tx = await Transaction.create({
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ deleted: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
