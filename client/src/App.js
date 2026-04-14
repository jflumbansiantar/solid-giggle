import { useState } from 'react';
import './App.css';
import { HideNumbersProvider } from './context/HideNumbersContext';
import { ThemeProvider }       from './context/ThemeContext';
import { CurrencyProvider }    from './context/CurrencyContext';
import { TABS }         from './constants/ui';
import Navbar           from './components/layout/Navbar';
import BubbleBackground from './components/BubbleBackground';
import Dashboard        from './components/pages/Dashboard/Dashboard';
import Holdings         from './components/pages/Holdings/Holdings';
import TaxCalc          from './components/pages/TaxCalc/TaxCalc';
import DebtPage         from './components/pages/Debt/DebtPage';
import DataEntry        from './components/pages/DataEntry/DataEntry';
import MarketPage       from './components/pages/Market/MarketPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThemeProvider>
    <CurrencyProvider>
    <HideNumbersProvider>
    <div className="app">
      <BubbleBackground />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS} />

      <main className="main-content">
        {activeTab === 'dashboard'    && <Dashboard />}
        {activeTab === 'holdings'     && <Holdings />}
        {activeTab === 'tax'          && <TaxCalc />}
        {activeTab === 'debt'         && <DebtPage />}
        {activeTab === 'market'       && <MarketPage />}
        {activeTab === 'data-entry'   && <DataEntry />}
      </main>
    </div>
    </HideNumbersProvider>
    </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
