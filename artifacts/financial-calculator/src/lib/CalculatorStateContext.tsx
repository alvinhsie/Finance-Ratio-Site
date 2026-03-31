import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  LIQUIDITY_EMPTY, PROFITABILITY_EMPTY, LEVERAGE_EMPTY,
  EFFICIENCY_EMPTY, VALUATION_EMPTY, FAIRVALUE_STD_EMPTY, FAIRVALUE_CYC_EMPTY,
} from './calculatorDefaults';

// Fields that exist in multiple calculators and should be kept in sync.
const SHARED_FIELDS = new Set([
  'currentAssets',
  'currentLiabilities',
  'totalRevenue',
  'totalAssets',
  'totalEquity',
  'totalDebt',
  'ebitda',
  'sharesOutstanding',
]);

interface CalculatorState {
  liquidity:    Record<string, string>;
  profitability: Record<string, string>;
  leverage:     Record<string, string>;
  efficiency:   Record<string, string>;
  valuation:    Record<string, string>;
  fairValueStd: Record<string, string>;
  fairValueCyc: Record<string, string>;
}

interface CalculatorStateContextValue {
  state: CalculatorState;
  setCalc: (key: keyof CalculatorState, vals: Record<string, string>) => void;
  clearCalc: (key: keyof CalculatorState, empty: Record<string, string>) => void;
  clearAll: () => void;
}

const defaultState: CalculatorState = {
  liquidity:    { ...LIQUIDITY_EMPTY },
  profitability: { ...PROFITABILITY_EMPTY },
  leverage:     { ...LEVERAGE_EMPTY },
  efficiency:   { ...EFFICIENCY_EMPTY },
  valuation:    { ...VALUATION_EMPTY },
  fairValueStd: { ...FAIRVALUE_STD_EMPTY },
  fairValueCyc: { ...FAIRVALUE_CYC_EMPTY },
};

const CalculatorStateContext = createContext<CalculatorStateContextValue | null>(null);

export function CalculatorStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalculatorState>({ ...defaultState });

  const setCalc = useCallback((key: keyof CalculatorState, vals: Record<string, string>) => {
    setState(prev => {
      const next: CalculatorState = { ...prev, [key]: vals };

      // Collect which shared fields changed in this update
      const changed: Array<[string, string]> = [];
      for (const [field, value] of Object.entries(vals)) {
        if (SHARED_FIELDS.has(field) && value !== prev[key][field]) {
          changed.push([field, value]);
        }
      }

      // Propagate each changed shared field to every other calculator that has it
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
    setState({
      liquidity:    { ...LIQUIDITY_EMPTY },
      profitability: { ...PROFITABILITY_EMPTY },
      leverage:     { ...LEVERAGE_EMPTY },
      efficiency:   { ...EFFICIENCY_EMPTY },
      valuation:    { ...VALUATION_EMPTY },
      fairValueStd: { ...FAIRVALUE_STD_EMPTY },
      fairValueCyc: { ...FAIRVALUE_CYC_EMPTY },
    });
  }, []);

  return (
    <CalculatorStateContext.Provider value={{ state, setCalc, clearCalc, clearAll }}>
      {children}
    </CalculatorStateContext.Provider>
  );
}

export function useCalculatorState() {
  const ctx = useContext(CalculatorStateContext);
  if (!ctx) throw new Error('useCalculatorState must be used within CalculatorStateProvider');
  return ctx;
}
