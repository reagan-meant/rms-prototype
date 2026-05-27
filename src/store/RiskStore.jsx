import { createContext, useContext, useState, useEffect } from 'react';
import seedData from '../data/seed.json';

const RiskStoreContext = createContext(null);

const SEED_VERSION = '3';

export function RiskStoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = sessionStorage.getItem('rms-state');
    const version = sessionStorage.getItem('rms-version');
    if (saved && version === SEED_VERSION) return JSON.parse(saved);
    return seedData;
  });

  useEffect(() => {
    sessionStorage.setItem('rms-state', JSON.stringify(state));
    sessionStorage.setItem('rms-version', SEED_VERSION);
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

  const updateAction = (riskId, actionId, patch) => setState(s => ({
    ...s,
    risks: s.risks.map(r =>
      r.id === riskId
        ? {
            ...r,
            actions: r.actions.map(a =>
              a.id === actionId ? { ...a, ...patch } : a
            ),
          }
        : r
    ),
  }));

  const resetDemo = () => {
    sessionStorage.removeItem('rms-state');
    setState(seedData);
  };

  return (
    <RiskStoreContext.Provider value={{ state, addRisk, updateRisk, addAction, updateAction, resetDemo }}>
      {children}
    </RiskStoreContext.Provider>
  );
}

export const useRiskStore = () => useContext(RiskStoreContext);
