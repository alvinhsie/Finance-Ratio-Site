import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  LIQUIDITY_EMPTY, PROFITABILITY_EMPTY, LEVERAGE_EMPTY,
  EFFICIENCY_EMPTY, VALUATION_EMPTY,
  FAIRVALUE_STD_EMPTY, FAIRVALUE_CYC_EMPTY,
  FAIRVALUE_DCF_EMPTY, FAIRVALUE_DDM_EMPTY, FAIRVALUE_NAV_EMPTY,
} from './calculatorDefaults';

const SHARED_FIELDS = new Set([
  'currentAssets',
  'currentLiabilities',
  'totalRevenue',
  'totalAssets',
  'totalLiabilities',
  'totalEquity',
  'totalDebt',
  'ebitda',
  'sharesOutstanding',
]);

const SESSION_STATE_KEY   = 'finratio_calc_state';
const SESSION_FV_MODE_KEY = 'finratio_fv_mode';

export type FairValueMode = 'standard' | 'cyclical' | 'dcf' | 'ddm' | 'nav';

interface CalculatorState {
  liquidity:     Record<string, string>;
  profitability: Record<string, string>;
  leverage:      Record<string, string>;
  efficiency:    Record<string, string>;
  valuation:     Record<string, string>;
  fairValueStd:  Record<string, string>;
  fairValueCyc:  Record<string, string>;
  fairValueDcf:  Record<string, string>;
  fairValueDdm:  Record<string, string>;
  fairValueNav:  Record<string, string>;
}

interface CalculatorStateContextValue {
  state: CalculatorState;
  fairValueMode: FairValueMode;
  setFairValueMode: (mode: FairValueMode) => void;
  setCalc: (key: keyof CalculatorState, vals: Record<string, string>) => void;
  clearCalc: (key: keyof CalculatorState, empty: Record<string, string>) => void;
  clearAll: () => void;
}

const defaultState: CalculatorState = {
  liquidity:     { ...LIQUIDITY_EMPTY },
  profitability: { ...PROFITABILITY_EMPTY },
  leverage:      { ...LEVERAGE_EMPTY },
  efficiency:    { ...EFFICIENCY_EMPTY },
  valuation:     { ...VALUATION_EMPTY },
  fairValueStd:  { ...FAIRVALUE_STD_EMPTY },
  fairValueCyc:  { ...FAIRVALUE_CYC_EMPTY },
  fairValueDcf:  { ...FAIRVALUE_DCF_EMPTY },
  fairValueDdm:  { ...FAIRVALUE_DDM_EMPTY },
  fairValueNav:  { ...FAIRVALUE_NAV_EMPTY },
};

function loadStateFromSession(): CalculatorState {
  try {
    const saved = sessionStorage.getItem(SESSION_STATE_KEY);
    if (!saved) return { ...defaultState };
    const parsed = JSON.parse(saved) as Partial<CalculatorState>;
    return {
      liquidity:     { ...LIQUIDITY_EMPTY,      ...(parsed.liquidity     ?? {}) },
      profitability: { ...PROFITABILITY_EMPTY,  ...(parsed.profitability ?? {}) },
      leverage:      { ...LEVERAGE_EMPTY,       ...(parsed.leverage      ?? {}) },
      efficiency:    { ...EFFICIENCY_EMPTY,     ...(parsed.efficiency    ?? {}) },
      valuation:     { ...VALUATION_EMPTY,      ...(parsed.valuation     ?? {}) },
      fairValueStd:  { ...FAIRVALUE_STD_EMPTY,  ...(parsed.fairValueStd  ?? {}) },
      fairValueCyc:  { ...FAIRVALUE_CYC_EMPTY,  ...(parsed.fairValueCyc  ?? {}) },
      fairValueDcf:  { ...FAIRVALUE_DCF_EMPTY,  ...(parsed.fairValueDcf  ?? {}) },
      fairValueDdm:  { ...FAIRVALUE_DDM_EMPTY,  ...(parsed.fairValueDdm  ?? {}) },
      fairValueNav:  { ...FAIRVALUE_NAV_EMPTY,  ...(parsed.fairValueNav  ?? {}) },
    };
  } catch {
    return { ...defaultState };
  }
}

const VALID_MODES: FairValueMode[] = ['standard', 'cyclical', 'dcf', 'ddm', 'nav'];

function loadFvModeFromSession(): FairValueMode {
  try {
    const saved = sessionStorage.getItem(SESSION_FV_MODE_KEY);
    if (saved && VALID_MODES.includes(saved as FairValueMode)) return saved as FairValueMode;
  } catch {}
  return 'standard';
}

const CalculatorStateContext = createContext<CalculatorStateContextValue | null>(null);

export function CalculatorStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>(() => loadStateFromSession());
  const [fairValueMode, setFairValueModeInternal] = useState<FairValueMode>(() => loadFvModeFromSession());

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const setFairValueMode = useCallback((mode: FairValueMode) => {
    setFairValueModeInternal(mode);
    try {
      sessionStorage.setItem(SESSION_FV_MODE_KEY, mode);
    } catch {}
  }, []);

  const setCalc = useCallback((key: keyof CalculatorState, vals: Record<string, string>) => {
    setState(prev => {
      const next: CalculatorState = { ...prev, [key]: vals };

      const changed: Array<[string, string]> = [];
      for (const [field, value] of Object.entries(vals)) {
        if (SHARED_FIELDS.has(field) && value !== prev[key][field]) {
          changed.push([field, value]);
        }
      }

      if (changed.length > 0) {
        const allKeys = Object.keys(next) as (keyof CalculatorState)[];
        for (const otherKey of allKeys) {
          if (otherKey === key) continue;
          const otherVals = next[otherKey];
          const updates: Record<string, string> = {};
          for (const [field, value] of changed) {
            if (field in otherVals) updates[field] = value;
          }
          if (Object.keys(updates).length > 0) {
            next[otherKey] = { ...otherVals, ...updates };
          }
        }
      }

      return next;
    });
  }, []);

  const clearCalc = useCallback((key: keyof CalculatorState, empty: Record<string, string>) => {
    setState(prev => ({ ...prev, [key]: { ...empty } }));
  }, []);

  const clearAll = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STATE_KEY);
      sessionStorage.removeItem(SESSION_FV_MODE_KEY);
    } catch {}
    setState({ ...defaultState });
    setFairValueModeInternal('standard');
  }, []);

  return (
    <CalculatorStateContext.Provider value={{ state, fairValueMode, setFairValueMode, setCalc, clearCalc, clearAll }}>
      {children}
    </CalculatorStateContext.Provider>
  );
}

export function useCalculatorState() {
  const ctx = useContext(CalculatorStateContext);
  if (!ctx) throw new Error('useCalculatorState must be used within CalculatorStateProvider');
  return ctx;
}
