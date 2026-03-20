const transactions = [
  // ── US Markets ──────────────────────────────────────────────────────────────
  { id: 1,  date: '2024-03-18', ticker: 'NVDA',  type: 'BUY',  market: 'US', shares: 5,    price: 875.40,  total: 4377.00  },
  { id: 2,  date: '2024-03-15', ticker: 'AAPL',  type: 'BUY',  market: 'US', shares: 10,   price: 210.50,  total: 2105.00  },
  { id: 3,  date: '2024-03-12', ticker: 'BTC',   type: 'BUY',  market: 'US', shares: 0.1,  price: 66200.00, total: 6620.00 },
  { id: 4,  date: '2024-03-10', ticker: 'VTI',   type: 'SELL', market: 'US', shares: 15,   price: 236.80,  total: 3552.00  },
  { id: 5,  date: '2024-03-07', ticker: 'META',  type: 'BUY',  market: 'US', shares: 8,    price: 505.30,  total: 4042.40  },
  { id: 6,  date: '2024-03-05', ticker: 'QQQ',   type: 'BUY',  market: 'US', shares: 10,   price: 458.20,  total: 4582.00  },
  { id: 7,  date: '2024-03-01', ticker: 'MSFT',  type: 'SELL', market: 'US', shares: 5,    price: 408.60,  total: 2043.00  },
  { id: 8,  date: '2024-02-27', ticker: 'GOOGL', type: 'BUY',  market: 'US', shares: 10,   price: 168.40,  total: 1684.00  },
  { id: 9,  date: '2024-02-22', ticker: 'ETH',   type: 'BUY',  market: 'US', shares: 1.0,  price: 3350.00, total: 3350.00  },
  { id: 10, date: '2024-02-19', ticker: 'AMZN',  type: 'BUY',  market: 'US', shares: 8,    price: 188.90,  total: 1511.20  },

  // ── Indonesia (IDX) ─────────────────────────────────────────────────────────
  { id: 11, date: '2024-03-16', ticker: 'BBCA',  type: 'BUY',  market: 'ID', shares: 100,  price: 4.80,    total: 480.00   },
  { id: 12, date: '2024-03-08', ticker: 'TLKM',  type: 'BUY',  market: 'ID', shares: 200,  price: 3.30,    total: 660.00   },
  { id: 13, date: '2024-02-28', ticker: 'BBRI',  type: 'SELL', market: 'ID', shares: 50,   price: 2.95,    total: 147.50   },
  { id: 14, date: '2024-02-14', ticker: 'ASII',  type: 'BUY',  market: 'ID', shares: 150,  price: 4.85,    total: 727.50   },
];

module.exports = transactions;
