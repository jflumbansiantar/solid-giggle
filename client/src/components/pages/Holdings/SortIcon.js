import React from 'react';

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <span className="sort-icon neutral">↕</span>;
  return <span className="sort-icon active">{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

export default SortIcon;
