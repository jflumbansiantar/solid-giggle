const express        = require('express');
const authMiddleware = require('../middleware/auth');
const auth         = require('./auth');
const holdings     = require('./holdings');
const portfolio    = require('./portfolio');
const transactions = require('./transactions');
const performance  = require('./performance');
const ledger       = require('./ledger');
const prices       = require('./prices');
const settings     = require('./settings');
const debt         = require('./debt');
const market       = require('./market');

const router = express.Router();

// Public route — no auth required
router.use('/auth', auth);

// All routes below require a valid JWT
router.use(authMiddleware);

router.use('/holdings',     holdings);
router.use('/portfolio',    portfolio);
router.use('/transactions', transactions);
router.use('/performance',  performance);
router.use('/ledger',       ledger);
router.use('/price-cache',  prices);
router.use('/settings',     settings);
router.use('/debts',        debt);
router.use('/market',       market);

module.exports = router;
