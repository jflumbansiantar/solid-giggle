import React from 'react';
import { ALLOCATION_COLORS } from '../../../constants/ui';

function AllocationBar({ allocation }) {
  return (
    <div className="allocation-bar-wrap">
      <div className="allocation-bar">
        {allocation.map((a) => (
          <div
            key={a.type}
            className="allocation-segment"
            style={{ width: `${a.percentage}%`, background: ALLOCATION_COLORS[a.type] || '#8b949e' }}
            title={`${a.type}: ${a.percentage}%`}
          />
        ))}
      </div>
      <div className="allocation-legend">
        {allocation.map((a) => (
          <div key={a.type} className="legend-item">
            <span className="legend-dot" style={{ background: ALLOCATION_COLORS[a.type] || '#8b949e' }} />
            <span className="legend-label">{a.type}</span>
            <span className="legend-pct">{a.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllocationBar;
