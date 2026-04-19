import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fmtUSD, fmtUSDCompact, fmtIDR, fmtIDRCompact } from '../utils/formatters';
import { fetchSettings } from '../api/portfolioApi';

const CurrencyContext = createContext();

const FALLBACK_RATE = 16250;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('currency') || 'USD'
  );
  const [usdToIdr, setUsdToIdr] = useState(FALLBACK_RATE);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        const rate = parseFloat(s.usdToIdr);
        if (!isNaN(rate) && rate > 0) setUsdToIdr(rate);
      })
      .catch(() => {/* keep fallback */});
  }, []);

  const toggleCurrency = useCallback(() => {
    document.documentElement.classList.add('currency-transitioning');
    setCurrency((c) => {
      const next = c === 'USD' ? 'IDR' : 'USD';
      localStorage.setItem('currency', next);
      return next;
    });
    setTimeout(() => document.documentElement.classList.remove('currency-transitioning'), 350);
  }, []);

  const fmtMoney = useCallback((n) => {
    const v = isNaN(n) ? 0 : (n ?? 0);
    if (currency === 'IDR') return fmtIDR(v * usdToIdr);
    return fmtUSD(v);
  }, [currency, usdToIdr]);

  const fmtMoneyCompact = useCallback((n) => {
    const v = isNaN(n) ? 0 : (n ?? 0);
    if (currency === 'IDR') return fmtIDRCompact(v * usdToIdr);
    return fmtUSDCompact(v);
  }, [currency, usdToIdr]);

  // Format without conversion — just apply currency symbol to the raw value
  const fmtRaw = useCallback((n) => {
    if (currency === 'IDR') return fmtIDR(n);
    return fmtUSD(n);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, usdToIdr, toggleCurrency, fmtMoney, fmtMoneyCompact, fmtRaw }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
