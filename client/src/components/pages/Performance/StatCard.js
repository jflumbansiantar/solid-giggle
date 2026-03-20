import React from 'react';

function StatCard({ label, value, sub, isGain }) {
  return (
    <div className="perf-stat card">
      <span className="ps-label">{label}</span>
      <span className={`ps-value ${isGain !== undefined ? (isGain ? 'gain' : 'loss') : ''}`}>{value}</span>
      {sub && <span className="ps-sub muted">{sub}</span>}
    </div>
  );
}

export default StatCard;
