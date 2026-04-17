export const LIQUIDITY_EMPTY: Record<string, string> = {
  currentAssets: '', currentLiabilities: '', inventory: '',
  cash: '', cfFromOps: '', ebit: '', interestExpense: '',
};

export const PROFITABILITY_EMPTY: Record<string, string> = {
  netIncome: '', totalRevenue: '', grossProfit: '',
  operatingIncome: '', totalAssets: '', totalEquity: '', ebitda: '',
};

export const LEVERAGE_EMPTY: Record<string, string> = {
  totalLiabilities: '', totalEquity: '', totalAssets: '',
  totalDebt: '', ebitda: '',
};

export const EFFICIENCY_EMPTY: Record<string, string> = {
  totalRevenue: '', accountsReceivable: '', currentAssets: '',
  currentLiabilities: '', netFixedAssets: '',
};

export const VALUATION_EMPTY: Record<string, string> = {
  marketPrice: '', eps: '', bvps: '', sharesOutstanding: '',
  totalDebt: '', cashEquivalents: '', ebitda: '', dividendPerShare: '',
};

export const FAIRVALUE_STD_EMPTY: Record<string, string> = {
  currentEps: '', totalEquity: '', sharesOutstanding: '',
  growthRate: '', inflationRate: '', currentPrice: '',
};

export const FAIRVALUE_CYC_EMPTY: Record<string, string> = {
  normalizedEps: '', totalEquity: '', sharesOutstanding: '',
  shortTermCagr: '', longTermCagr: '', inflationRate: '', currentPrice: '',
};

export const FAIRVALUE_DCF_EMPTY: Record<string, string> = {
  freeCashFlow: '', sharesOutstanding: '',
  growthRate: '', terminalGrowthRate: '', discountRate: '',
  netDebt: '', currentPrice: '',
};
