/**
 * Enriches raw holding records with derived financial metrics.
 * @param {Array} holdings - Raw holdings from data layer
 * @returns {Array} Holdings with marketValue, costBasis, gainLoss, dayChange, etc.
 */
function enrichHoldings(holdings) {
  return holdings.map((h) => {
    const marketValue  = +(h.shares * h.currentPrice).toFixed(2);
    const costBasis    = +(h.shares * h.avgCost).toFixed(2);
    const gainLoss     = +(marketValue - costBasis).toFixed(2);
    const gainLossPct  = +(((h.currentPrice - h.avgCost) / h.avgCost) * 100).toFixed(2);
    const dayChange    = +(h.currentPrice - h.previousClose).toFixed(2);
    const dayChangePct = +(((h.currentPrice - h.previousClose) / h.previousClose) * 100).toFixed(2);
    const dayGainLoss  = +(h.shares * dayChange).toFixed(2);

    return { ...h, marketValue, costBasis, gainLoss, gainLossPct, dayChange, dayChangePct, dayGainLoss };
  });
}

module.exports = enrichHoldings;
