import React from 'react';
import { fmtUSDCompact }  from '../../../utils/formatters';
import { useHideNumbers } from '../../../context/HideNumbersContext';

const MASK = '••••••';

function CustomTooltip({ active, payload, label }) {
  const { hidden } = useHideNumbers();
  const mc = (v) => hidden ? MASK : fmtUSDCompact(v);

  if (!active || !payload || !payload.length) return null;

  const portfolio = payload.find((p) => p.dataKey === 'portfolio');
  const benchmark = payload.find((p) => p.dataKey === 'benchmark');
  const diff = portfolio && benchmark ? portfolio.value - benchmark.value : 0;

  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {portfolio && (
        <p className="tooltip-row">
          <span className="tooltip-dot" style={{ background: '#58a6ff' }} />
          <span>Portfolio</span>
          <span className="tooltip-val">{mc(portfolio.value)}</span>
        </p>
      )}
      {benchmark && (
        <p className="tooltip-row">
          <span className="tooltip-dot" style={{ background: '#3fb950' }} />
          <span>S&P 500</span>
          <span className="tooltip-val">{mc(benchmark.value)}</span>
        </p>
      )}
      {portfolio && benchmark && (
        <p className={`tooltip-diff ${diff >= 0 ? 'gain' : 'loss'}`}>
          Alpha: {diff >= 0 ? '+' : ''}{mc(diff)}
        </p>
      )}
    </div>
  );
}

export default CustomTooltip;
