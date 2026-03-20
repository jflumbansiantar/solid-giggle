const express                             = require('express');
const { getAccounts, getEntries, getSummary } = require('../services/ledgerService');
const LedgerAccount                       = require('../models/LedgerAccount');
const JournalEntry                        = require('../models/JournalEntry');

const router = express.Router();

// ── Accounts ─────────────────────────────────────────────────────────────────

// GET all accounts (with computed balances)
router.get('/accounts', async (req, res) => {
  try {
    res.json(await getAccounts());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST — insert a new ledger account
// Body: { _id, code, name, type, normalBalance, openingBalance }
router.post('/accounts', async (req, res) => {
  try {
    const account = await LedgerAccount.create(req.body);
    res.status(201).json(account);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /accounts/:id
router.patch('/accounts/:id', async (req, res) => {
  try {
    const account = await LedgerAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Journal Entries ───────────────────────────────────────────────────────────

// GET all entries (enriched with account name/type)
router.get('/entries', async (req, res) => {
  try {
    res.json(await getEntries());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST — insert a new journal entry (with lines embedded)
// Body: { _id, date, description, lines: [{ accountId, debit, credit }] }
router.post('/entries', async (req, res) => {
  try {
    const entry = await JournalEntry.create({
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json(entry);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /entries/:id/lines — add a line to an existing journal entry
// Body: { accountId, debit, credit }
router.post('/entries/:id/lines', async (req, res) => {
  try {
    const entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      { $push: { lines: req.body } },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
    res.status(201).json(entry);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /entries/:id
router.delete('/entries/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
    res.json({ deleted: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────

router.get('/summary', async (req, res) => {
  try {
    res.json(await getSummary());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
