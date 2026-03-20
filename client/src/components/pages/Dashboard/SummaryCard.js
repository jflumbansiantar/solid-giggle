import React from 'react';

function SummaryCard({ title, value, sub, subClass, icon }) {
  return (
    <div className="summary-card card">
      <div className="sc-header">
        <span className="sc-title">{title}</span>
        <span className="sc-icon">{icon}</span>
      </div>
      <div className="sc-value">{value}</div>
      {sub && <div className={`sc-sub ${subClass || ''}`}>{sub}</div>}
    </div>
  );
}

export default SummaryCard;
