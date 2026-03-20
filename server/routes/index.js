const express      = require('express');
const holdings     = require('./holdings');
const portfolio    = require('./portfolio');
const transactions = require('./transactions');
const performance  = require('./performance');
const ledger       = require('./ledger');
const prices       = require('./prices');

const router = express.Router();

router.use('/holdings',     holdings);
router.use('/portfolio',    portfolio);
router.use('/transactions', transactions);
router.use('/performance',  performance);
router.use('/ledger',       ledger);
router.use('/price-cache',  prices);

module.exports = router;
