const express  = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings — returns all settings as a flat { key: value } object
router.get('/', async (req, res) => {
  try {
    const docs = await Settings.find().lean();
    const result = Object.fromEntries(docs.map((d) => [d.key, d.value]));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/settings/:key — upsert a setting value
// Body: { value: <any> }
router.patch('/:key', async (req, res) => {
  try {
    const doc = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ key: doc.key, value: doc.value });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
