const Holding        = require('../models/Holding');
const PriceCache     = require('../models/PriceCache');
const enrichHoldings = require('../helpers/enrichHoldings');

async function getHoldings() {
  const [holdings, prices] = await Promise.all([
    Holding.find().lean(),
    PriceCache.find().lean(),
  ]);

  const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p]));

  const merged = holdings.map((h) => ({
    ...h,
    currentPrice:  priceMap[h.ticker]?.currentPrice  ?? 0,
    previousClose: priceMap[h.ticker]?.previousClose ?? 0,
  }));

  return enrichHoldings(merged);
}

module.exports = { getHoldings };
