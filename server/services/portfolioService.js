const { getHoldings } = require('./holdingsService');
const Transaction     = require('../models/Transaction');

async function getPortfolioSummary() {
  const [enriched, rawRecent] = await Promise.all([
    getHoldings(),
    Transaction.find().sort({ date: -1 }).limit(5).lean(),
  ]);

  const totalValue    = +enriched.reduce((s, h) => s + h.marketValue, 0).toFixed(2);
  const totalCost     = +enriched.reduce((s, h) => s + h.costBasis,   0).toFixed(2);
  const totalGainLoss = +(totalValue - totalCost).toFixed(2);
  const totalReturn   = +(((totalValue - totalCost) / totalCost) * 100).toFixed(2);
  const dayGainLoss   = +enriched.reduce((s, h) => s + h.dayGainLoss, 0).toFixed(2);
  const dayReturn     = +((dayGainLoss / (totalValue - dayGainLoss)) * 100).toFixed(2);

  // Allocation by asset type
  const allocationMap = {};
  enriched.forEach((h) => {
    allocationMap[h.type] = (allocationMap[h.type] || 0) + h.marketValue;
  });
  const allocation = Object.entries(allocationMap).map(([type, value]) => ({
    type,
    value: +value.toFixed(2),
    percentage: +((value / totalValue) * 100).toFixed(1),
  }));

  // Top movers by absolute day change %
  const topMovers = [...enriched]
    .sort((a, b) => Math.abs(b.dayChangePct) - Math.abs(a.dayChangePct))
    .slice(0, 5)
    .map(({ ticker, name, dayChange, dayChangePct, market }) => ({ ticker, name, dayChange, dayChangePct, market }));

  // Market breakdown (US vs IDX)
  const marketBreakdown = ['US', 'ID'].map((mkt) => {
    const mktHoldings = enriched.filter((h) => h.market === mkt);
    const value      = +mktHoldings.reduce((s, h) => s + h.marketValue, 0).toFixed(2);
    const cost       = +mktHoldings.reduce((s, h) => s + h.costBasis,   0).toFixed(2);
    const dayGL      = +mktHoldings.reduce((s, h) => s + h.dayGainLoss, 0).toFixed(2);
    const totalGL    = +(value - cost).toFixed(2);
    const totalGLPct = cost > 0 ? +((totalGL / cost) * 100).toFixed(2) : 0;
    return { market: mkt, value, dayGL, totalGL, totalGLPct, count: mktHoldings.length };
  });

  // Recent transactions — normalise date to 'YYYY-MM-DD' string for frontend
  const recentTransactions = rawRecent.map((tx) => ({
    ...tx,
    date: tx.date instanceof Date
      ? tx.date.toISOString().slice(0, 10)
      : tx.date,
  }));

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalReturn,
    dayGainLoss,
    dayReturn,
    allocation,
    topMovers,
    holdingsCount: enriched.length,
    marketBreakdown,
    recentTransactions,
  };
}

module.exports = { getPortfolioSummary };
