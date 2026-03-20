import React from 'react';
import { fmt }          from '../../../utils/formatters';
import { MARKET_FLAG }  from '../../../constants/ui';

function TopMoverRow({ m }) {
  const isGain = m.dayChangePct >= 0;
  return (
    <div className="mover-row">
      <span className="mover-ticker">
        {m.market && <span style={{ marginRight: 4, fontSize: 13 }}>{MARKET_FLAG[m.market]}</span>}
        {m.ticker}
      </span>
      <span className="mover-name">{m.name}</span>
      <span className={isGain ? 'gain' : 'loss'}>
        {isGain ? '+' : ''}{fmt(m.dayChangePct)}%
      </span>
    </div>
  );
}

export default TopMoverRow;
