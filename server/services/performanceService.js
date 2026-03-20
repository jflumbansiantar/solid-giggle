const MONTHS = [
  'Mar 23','Apr 23','May 23','Jun 23','Jul 23','Aug 23',
  'Sep 23','Oct 23','Nov 23','Dec 23','Jan 24','Feb 24','Mar 24',
];

const PORTFOLIO_VALUES = [
  98000, 101500, 99800, 105200, 110400, 107300,
  103600, 108900, 118700, 124300, 121800, 131500, 148920,
];

const BENCHMARK_VALUES = [
  98000, 100200, 98500, 103100, 107800, 104900,
  101200, 106400, 114800, 119600, 117300, 126400, 141200,
];

function getPerformanceData() {
  return MONTHS.map((date, i) => ({
    date,
    portfolio: PORTFOLIO_VALUES[i],
    benchmark: BENCHMARK_VALUES[i],
  }));
}

module.exports = { getPerformanceData };
