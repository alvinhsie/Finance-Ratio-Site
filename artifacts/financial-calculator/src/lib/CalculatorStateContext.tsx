import React, { createContext, useContext, useState } from 'react';

const LIQUIDITY_EMPTY: Record<string, string> = {
  currentAssets: '', currentLiabilities: '', inventory: '',
  cash: '', cfFromOps: '', ebit: '', interestExpense: '',
};

const PROFITABILITY_EMPTY: Record<string, string> = {
  netIncome: '', totalRevenue: '', grossProfit: '',
  operatingIncome: '', totalAssets: '', totalEquity: '', ebitda: '',
};

const LEVERAGE_EMPTY: Record<string, string> = {
  totalLiabilities: '', totalEquity: '', totalAssets: '',
  totalDebt: '', ebitda: '',
};

const EFFICIENCY_EMPTY: Record<string, string> = {
  totalRevenue: '', accountsReceivable: '', currentAssets: '',
  currentLiabilities: '', netFixedAssets: '',
};

const VALUATION_EMPTY: Record<string, string> = {
  marketPrice: '', eps: '', bvps: '', sharesOutstanding: '',
  totalDebt: '', cashEquivalents: '', ebitda: '', dividendPerShare: '',
};

const FAIRVALUE_STD_EMPTY: Record<string, string> = {
  currentEps: '', totalEquity: '', sharesOutstanding: '',
  growthRate: '', inflationRate: '', currentPrice: '',
};

const FAIRVALUE_CYC_EMPTY: Record<string, string> = {
  normalizedEps: '', totalEquity: '', sharesOutstanding: '',
  shortTermCagr: '', longTermCagr: '', inflationRate: '', currentPrice: '',
};

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

  const setCalc = (key: keyof CalculatorState, vals: Record<string, string>) => {
    setState(prev => ({ ...prev, [key]: vals }));
  };

  const clearCalc = (key: keyof CalculatorState, empty: Record<string, string>) => {
    setState(prev => ({ ...prev, [key]: { ...empty } }));
  };

  const clearAll = () => {
    setState({
      liquidity:    { ...LIQUIDITY_EMPTY },
      profitability: { ...PROFITABILITY_EMPTY },
      leverage:     { ...LEVERAGE_EMPTY },
      efficiency:   { ...EFFICIENCY_EMPTY },
      valuation:    { ...VALUATION_EMPTY },
      fairValueStd: { ...FAIRVALUE_STD_EMPTY },
      fairValueCyc: { ...FAIRVALUE_CYC_EMPTY },
    });
  };

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

export {
  LIQUIDITY_EMPTY,
  PROFITABILITY_EMPTY,
  LEVERAGE_EMPTY,
  EFFICIENCY_EMPTY,
  VALUATION_EMPTY,
  FAIRVALUE_STD_EMPTY,
  FAIRVALUE_CYC_EMPTY,
};
