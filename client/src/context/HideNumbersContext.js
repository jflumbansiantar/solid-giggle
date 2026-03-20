import { createContext, useContext, useState } from 'react';

const HideNumbersContext = createContext();

export function HideNumbersProvider({ children }) {
  const [hidden, setHidden] = useState(false);
  const toggle = () => setHidden((h) => !h);
  return (
    <HideNumbersContext.Provider value={{ hidden, toggle }}>
      {children}
    </HideNumbersContext.Provider>
  );
}

export function useHideNumbers() {
  return useContext(HideNumbersContext);
}
