/**
 * Seed script — run once to populate MongoDB from the static data files.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose      = require('mongoose');
const Holding       = require('../models/Holding');
const Transaction   = require('../models/Transaction');
const PriceCache    = require('../models/PriceCache');
const LedgerAccount = require('../models/LedgerAccount');
const JournalEntry  = require('../models/JournalEntry');

const rawHoldings    = require('../data/holdings');
const rawTransactions = require('../data/transactions');
const { accounts: rawAccounts, entries: rawEntries } = require('../data/ledger');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Clear existing data ──────────────────────────────────────────────────
  await Promise.all([
    Holding.deleteMany({}),
    Transaction.deleteMany({}),
    PriceCache.deleteMany({}),
    LedgerAccount.deleteMany({}),
    JournalEntry.deleteMany({}),
  ]);
  console.log('Cleared existing collections');

  // ── Holdings (core position data — no prices) ────────────────────────────
  const holdings = rawHoldings.map(({ ticker, name, type, market, shares, avgCost }) => ({
    ticker, name, type, market, shares, avgCost,
  }));
  await Holding.insertMany(holdings);
  console.log(`Inserted ${holdings.length} holdings`);

  // ── Price cache (extracted from holdings static data) ────────────────────
  const prices = rawHoldings.map(({ ticker, currentPrice, previousClose }) => ({
    ticker,
    currentPrice,
    previousClose,
    updatedAt: new Date(),
  }));
  await PriceCache.insertMany(prices);
  console.log(`Inserted ${prices.length} price cache entries`);

  // ── Transactions ─────────────────────────────────────────────────────────
  const transactions = rawTransactions.map(({ date, ticker, type, market, shares, price, total }) => ({
    date: new Date(date),
    ticker, type, market, shares, price, total,
  }));
  await Transaction.insertMany(transactions);
  console.log(`Inserted ${transactions.length} transactions`);

  // ── Ledger accounts ──────────────────────────────────────────────────────
  const accounts = rawAccounts.map(({ id, code, name, type, normalBalance, openingBalance }) => ({
    _id: id,
    code, name, type, normalBalance, openingBalance,
  }));
  await LedgerAccount.insertMany(accounts);
  console.log(`Inserted ${accounts.length} ledger accounts`);

  // ── Journal entries (with embedded lines) ────────────────────────────────
  const entries = rawEntries.map(({ id, date, description, lines }) => ({
    _id: id,
    date: new Date(date),
    description,
    lines,
  }));
  await JournalEntry.insertMany(entries);
  console.log(`Inserted ${entries.length} journal entries`);

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
