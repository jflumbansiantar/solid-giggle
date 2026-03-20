import React, { useState, useEffect } from 'react';
import { useHideNumbers }  from '../../context/HideNumbersContext';
import { useTheme }        from '../../context/ThemeContext';
import { useCurrency }     from '../../context/CurrencyContext';
import { getMarketStatus } from '../../utils/marketHours';
import './Navbar.css';

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunCloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      {/* Sun */}
      <circle cx="16" cy="6" r="3" />
      {/* Sun rays */}
      <line x1="16" y1="1" x2="16" y2="2.5"   stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="21" y1="6" x2="22.5" y2="6"   stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="19.6" y1="2.4" x2="20.7" y2="1.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cloud */}
      <path d="M16 19H7a5 5 0 0 1-.9-9.9A7 7 0 0 1 17.8 11h.2a4 4 0 0 1 0 8h-2z" />
    </svg>
  );
}

function Navbar({ activeTab, onTabChange, tabs }) {
  const { hidden, toggle }          = useHideNumbers();
  const { isDark, toggleTheme }     = useTheme();
  const { currency, toggleCurrency } = useCurrency();
  const [menuOpen, setMenuOpen]  = useState(false);
  const [markets,  setMarkets]   = useState(getMarketStatus());

  useEffect(() => {
    const id = setInterval(() => setMarkets(getMarketStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleTabChange = (id) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="navbar-brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 3v18h18" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 16l4-5 4 3 4-6" stroke="#3fb950" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="brand-name">PortfolioOS</span>
              <span className="brand-sub">Personal Finance Dashboard</span>
            </div>
          </div>

          {/* Tab Navigation — desktop only */}
          <nav className="navbar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Currency toggle */}
          <button
            className={`currency-toggle ${currency === 'USD' ? 'usd' : 'idr'}`}
            onClick={toggleCurrency}
            title={currency === 'USD' ? 'Switch to IDR (Rupiah)' : 'Switch to USD (Dollar)'}
          >
            <span className="currency-sign">{currency === 'USD' ? '$' : 'Rp'}</span>
            <span className="currency-label">{currency}</span>
          </button>

          {/* Theme toggle */}
          <button
            className={`theme-toggle ${isDark ? 'night' : 'day'}`}
            onClick={toggleTheme}
            title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
          >
            {isDark ? <MoonIcon /> : <SunCloudIcon />}
          </button>

          {/* Hide numbers toggle */}
          <button
            className={`hide-toggle${hidden ? ' active' : ''}`}
            onClick={toggle}
            title={hidden ? 'Show numbers' : 'Hide numbers'}
          >
            {hidden ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>

          {/* Market status — desktop only */}
          <div className="navbar-right">
            {[markets.us, markets.idx].map((mkt) => (
              <div key={mkt.label} className="market-status-row">
                <span className={`market-dot ${mkt.open ? 'live' : 'closed'}`} />
                <span className="market-flag-label">{mkt.flag}</span>
                <span className="market-name">{mkt.label}</span>
                <span className={mkt.open ? 'market-open' : 'market-closed'}>
                  {mkt.open ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
            <div className="last-updated">
              Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <nav className="mobile-menu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`mobile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}

            {/* Market status inside mobile menu */}
            <div className="mobile-market-status">
              {[markets.us, markets.idx].map((mkt) => (
                <div key={mkt.label} className="market-status-row">
                  <span className={`market-dot ${mkt.open ? 'live' : 'closed'}`} />
                  <span className="market-flag-label">{mkt.flag}</span>
                  <span className="market-name">{mkt.label}</span>
                  <span className={mkt.open ? 'market-open' : 'market-closed'}>
                    {mkt.open ? 'Open' : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

export default Navbar;
