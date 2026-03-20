import { useState } from 'react';
import './App.css';
import { HideNumbersProvider } from './context/HideNumbersContext';
import { ThemeProvider }       from './context/ThemeContext';
import { CurrencyProvider }    from './context/CurrencyContext';
import { TABS }         from './constants/ui';
import Navbar           from './components/layout/Navbar';
import Dashboard        from './components/pages/Dashboard/Dashboard';
import Holdings         from './components/pages/Holdings/Holdings';
import Transactions     from './components/pages/Transactions/Transactions';
import PerformanceChart from './components/pages/Performance/PerformanceChart';
import Ledger           from './components/pages/Ledger/Ledger';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThemeProvider>
    <CurrencyProvider>
    <HideNumbersProvider>
    <div className="app">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS} />

      <main className="main-content">
        {activeTab === 'dashboard'    && <Dashboard />}
        {activeTab === 'holdings'     && <Holdings />}
        {activeTab === 'performance'  && <PerformanceChart />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'ledger'       && <Ledger />}
      </main>
    </div>
    </HideNumbersProvider>
    </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
