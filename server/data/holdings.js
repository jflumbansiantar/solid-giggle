const holdings = [
  // ── US Markets ──────────────────────────────────────────────────────────────
  { id: 1,  ticker: 'AAPL',  name: 'Apple Inc.',                      type: 'Stock',  market: 'US', shares: 50,   avgCost: 158.42,  currentPrice: 213.18,  previousClose: 210.62 },
  { id: 2,  ticker: 'MSFT',  name: 'Microsoft Corporation',           type: 'Stock',  market: 'US', shares: 30,   avgCost: 310.75,  currentPrice: 415.32,  previousClose: 412.88 },
  { id: 3,  ticker: 'GOOGL', name: 'Alphabet Inc.',                   type: 'Stock',  market: 'US', shares: 25,   avgCost: 128.90,  currentPrice: 172.64,  previousClose: 171.20 },
  { id: 4,  ticker: 'NVDA',  name: 'NVIDIA Corporation',              type: 'Stock',  market: 'US', shares: 20,   avgCost: 495.60,  currentPrice: 875.40,  previousClose: 862.10 },
  { id: 5,  ticker: 'AMZN',  name: 'Amazon.com Inc.',                 type: 'Stock',  market: 'US', shares: 18,   avgCost: 148.30,  currentPrice: 191.75,  previousClose: 189.90 },
  { id: 6,  ticker: 'META',  name: 'Meta Platforms Inc.',             type: 'Stock',  market: 'US', shares: 22,   avgCost: 285.40,  currentPrice: 512.88,  previousClose: 508.20 },
  { id: 7,  ticker: 'VTI',   name: 'Vanguard Total Stock Market ETF', type: 'ETF',    market: 'US', shares: 80,   avgCost: 195.20,  currentPrice: 238.47,  previousClose: 237.10 },
  { id: 8,  ticker: 'QQQ',   name: 'Invesco QQQ Trust',               type: 'ETF',    market: 'US', shares: 35,   avgCost: 342.80,  currentPrice: 461.92,  previousClose: 458.75 },
  { id: 9,  ticker: 'BTC',   name: 'Bitcoin',                         type: 'Crypto', market: 'US', shares: 0.45, avgCost: 38200.00, currentPrice: 67450.00, previousClose: 65800.00 },
  { id: 10, ticker: 'ETH',   name: 'Ethereum',                        type: 'Crypto', market: 'US', shares: 3.2,  avgCost: 2100.00,  currentPrice: 3510.00,  previousClose: 3420.00 },

  // ── Indonesia (IDX) ─────────────────────────────────────────────────────────
  { id: 11, ticker: 'BBCA',  name: 'Bank Central Asia Tbk',           type: 'Stock',  market: 'ID', shares: 200,  avgCost: 4.12,    currentPrice: 4.80,    previousClose: 4.75 },
  { id: 12, ticker: 'TLKM',  name: 'Telkom Indonesia Tbk',            type: 'Stock',  market: 'ID', shares: 500,  avgCost: 3.60,    currentPrice: 3.20,    previousClose: 3.30 },
  { id: 13, ticker: 'BBRI',  name: 'Bank Rakyat Indonesia Tbk',       type: 'Stock',  market: 'ID', shares: 350,  avgCost: 2.50,    currentPrice: 2.95,    previousClose: 2.90 },
  { id: 14, ticker: 'ASII',  name: 'Astra International Tbk',         type: 'Stock',  market: 'ID', shares: 150,  avgCost: 4.85,    currentPrice: 5.10,    previousClose: 5.05 },
];

module.exports = holdings;
