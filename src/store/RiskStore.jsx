import { createContext, useContext, useState, useEffect } from 'react';
import seedData from '../data/seed.json';

const RiskStoreContext = createContext(null);

export function RiskStoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = sessionStorage.getItem('rms-state');
    return saved ? JSON.parse(saved) : seedData;
  });

  useEffect(() => {
    sessionStorage.setItem('rms-state', JSON.stringify(state));
  }, [state]);

  const addRisk = (risk) => setState(s => ({ ...s, risks: [...s.risks, risk] }));

  const updateRisk = (id, patch) => setState(s => ({
    ...s,
    risks: s.risks.map(r => r.id === id ? { ...r, ...patch } : r),
  }));

  const addAction = (riskId, action) => setState(s => ({
    ...s,
    risks: s.risks.map(r =>
      r.id === riskId ? { ...r, actions: [...(r.actions || []), action] } : r
    ),
  }));

  const resetDemo = () => {
    sessionStorage.removeItem('rms-state');
    setState(seedData);
  };

  return (
    <RiskStoreContext.Provider value={{ state, addRisk, updateRisk, addAction, resetDemo }}>
      {children}
    </RiskStoreContext.Provider>
  );
}

export const useRiskStore = () => useContext(RiskStoreContext);
