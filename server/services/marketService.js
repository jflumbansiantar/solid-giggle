const YahooFinance = require('yahoo-finance2').default;
const Holding      = require('../models/Holding');

const yf = new YahooFinance();

// Map internal ticker + market to Yahoo Finance symbol
function toYfSymbol(ticker, market) {
  if (market === 'ID') return `${ticker}.JK`;
  if (ticker === 'BTC') return 'BTC-USD';
  if (ticker === 'ETH') return 'ETH-USD';
  return ticker;
}

async function getLiveQuotes() {
  const holdings = await Holding.find().lean();
  if (!holdings.length) return [];

  // Build symbol → internal ticker map
  const symbolMap = new Map(); // yfSymbol -> { ticker, market }
  for (const h of holdings) {
    symbolMap.set(toYfSymbol(h.ticker, h.market), { ticker: h.ticker, market: h.market });
  }

  const symbols = [...symbolMap.keys()];
  const rawQuotes = await yf.quote(symbols);
  const quotesArr = Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes];

  return quotesArr.map((q) => {
    const internal = symbolMap.get(q.symbol) ?? { ticker: q.symbol, market: 'US' };
    return {
      ticker:        internal.ticker,
      market:        internal.market,
      name:          q.longName || q.shortName || internal.ticker,
      currency:      q.currency || 'USD',
      price:         q.regularMarketPrice          ?? null,
      previousClose: q.regularMarketPreviousClose  ?? null,
      change:        q.regularMarketChange         ?? null,
      changePct:     q.regularMarketChangePercent  ?? null,
      volume:        q.regularMarketVolume         ?? null,
      marketCap:     q.marketCap                   ?? null,
      dayHigh:       q.regularMarketDayHigh        ?? null,
      dayLow:        q.regularMarketDayLow         ?? null,
    };
  });
}

module.exports = { getLiveQuotes };



