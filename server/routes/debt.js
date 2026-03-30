const express     = require('express');
const debtService = require('../services/debtService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await debtService.getDebts());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await debtService.createDebt(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    res.json(await debtService.updateDebt(req.params.id, req.body));
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const debt = await debtService.deleteDebt(req.params.id);
    res.json({ deleted: debt._id });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
