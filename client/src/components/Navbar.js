import React from 'react';
import './Navbar.css';

function Navbar({ activeTab, onTabChange, tabs }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3v18h18"
                stroke="#58a6ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 16l4-5 4 3 4-6"
                stroke="#3fb950"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <span className="brand-name">PortfolioOS</span>
            <span className="brand-sub">Personal Finance Dashboard</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="navbar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="navbar-right">
          <div className="market-status">
            <span className="market-dot live" />
            <span className="market-label">Market Open</span>
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
