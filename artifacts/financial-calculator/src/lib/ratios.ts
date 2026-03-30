import { formatNumber, formatPercentage } from "./utils";
import { 
  Droplets, 
  TrendingUp, 
  Files, 
  Zap, 
  LineChart,
  Target
} from "lucide-react";

export type InterpretationType = 'good' | 'average' | 'poor' | 'neutral';

export interface RatioInput {
  id: string;
  label: string;
  placeholder?: string;
}

export interface RatioResult {
  value: number;
  formatted: string;
  interpretation: InterpretationType;
  interpretationText: string;
}

export interface RatioDef {
  id: string;
  name: string;
  description: string;
  formulaDisplay: string;
  inputs: RatioInput[];
  calculate: (values: Record<string, number>) => RatioResult | null;
}

export interface CategoryDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  ratios: RatioDef[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "liquidity",
    name: "Liquidity",
    description: "Measure a company's ability to pay off its short-term debt obligations.",
    icon: Droplets,
    ratios: [
      {
        id: "current-ratio",
        name: "Current Ratio",
        description: "Measures a company's ability to pay short-term obligations or those due within one year.",
        formulaDisplay: "Current Assets ÷ Current Liabilities",
        inputs: [
          { id: "currentAssets", label: "Current Assets", placeholder: "e.g. 500000" },
          { id: "currentLiabilities", label: "Current Liabilities", placeholder: "e.g. 250000" }
        ],
        calculate: (vals) => {
          if (!vals.currentLiabilities) return null;
          const val = vals.currentAssets / vals.currentLiabilities;
          let interp: InterpretationType = 'average';
          let text = "Adequate liquidity.";
          if (val >= 1.5 && val <= 3) { interp = 'good'; text = "Strong liquidity position. Generally, a ratio between 1.5 and 3 is considered healthy."; }
          else if (val > 3) { interp = 'neutral'; text = "Very high liquidity. Might indicate inefficient use of assets."; }
          else if (val < 1) { interp = 'poor'; text = "Poor liquidity. Company may struggle to meet short-term obligations."; }
          return { value: val, formatted: `${formatNumber(val)}x`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "quick-ratio",
        name: "Quick Ratio (Acid Test)",
        description: "Measures a company's capacity to pay its current liabilities without needing to sell its inventory.",
        formulaDisplay: "(Current Assets - Inventory) ÷ Current Liabilities",
        inputs: [
          { id: "currentAssets", label: "Current Assets", placeholder: "e.g. 500000" },
          { id: "inventory", label: "Inventory", placeholder: "e.g. 150000" },
          { id: "currentLiabilities", label: "Current Liabilities", placeholder: "e.g. 250000" }
        ],
        calculate: (vals) => {
          if (!vals.currentLiabilities) return null;
          const val = (vals.currentAssets - vals.inventory) / vals.currentLiabilities;
          let interp: InterpretationType = 'average';
          let text = "Acceptable quick liquidity.";
          if (val > 1) { interp = 'good'; text = "Strong ability to meet short-term obligations without selling inventory."; }
          else if (val < 1) { interp = 'poor'; text = "May rely too heavily on inventory to meet short-term obligations."; }
          return { value: val, formatted: `${formatNumber(val)}x`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "cash-ratio",
        name: "Cash Ratio",
        description: "The most conservative liquidity ratio. It measures a firm's ability to pay off current liabilities with only cash and cash equivalents.",
        formulaDisplay: "Cash & Equivalents ÷ Current Liabilities",
        inputs: [
          { id: "cash", label: "Cash & Equivalents", placeholder: "e.g. 100000" },
          { id: "currentLiabilities", label: "Current Liabilities", placeholder: "e.g. 250000" }
        ],
        calculate: (vals) => {
          if (!vals.currentLiabilities) return null;
          const val = vals.cash / vals.currentLiabilities;
          let interp: InterpretationType = 'neutral';
          let text = "Ratio generally below 1 is common, as companies rarely keep enough cash to cover all current liabilities.";
          if (val >= 0.5) { interp = 'good'; text = "Very strong cash position."; }
          else if (val < 0.1) { interp = 'poor'; text = "Very low cash reserves, high reliance on receivables/inventory."; }
          return { value: val, formatted: `${formatNumber(val)}x`, interpretation: interp, interpretationText: text };
        }
      }
    ]
  },
  {
    id: "profitability",
    name: "Profitability",
    description: "Evaluate a company's ability to generate earnings relative to revenue, assets, or equity.",
    icon: TrendingUp,
    ratios: [
      {
        id: "gross-margin",
        name: "Gross Profit Margin",
        description: "The proportion of money left over from revenues after accounting for the cost of goods sold (COGS).",
        formulaDisplay: "(Gross Profit ÷ Revenue) × 100",
        inputs: [
          { id: "grossProfit", label: "Gross Profit", placeholder: "e.g. 400000" },
          { id: "revenue", label: "Revenue", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.revenue) return null;
          const val = (vals.grossProfit / vals.revenue) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 40 ? 'good' : val > 20 ? 'average' : 'poor', 
            interpretationText: "Highly dependent on industry. Higher is always better, showing efficient production/pricing." 
          };
        }
      },
      {
        id: "net-margin",
        name: "Net Profit Margin",
        description: "Shows how much of each dollar collected by a company as revenue translates into profit.",
        formulaDisplay: "(Net Income ÷ Revenue) × 100",
        inputs: [
          { id: "netIncome", label: "Net Income", placeholder: "e.g. 150000" },
          { id: "revenue", label: "Revenue", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.revenue) return null;
          const val = (vals.netIncome / vals.revenue) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 10 ? 'good' : val > 5 ? 'average' : 'poor', 
            interpretationText: ">10% is generally considered excellent for most industries, though retail operates lower." 
          };
        }
      },
      {
        id: "roa",
        name: "Return on Assets (ROA)",
        description: "Indicates how profitable a company is relative to its total assets.",
        formulaDisplay: "(Net Income ÷ Total Assets) × 100",
        inputs: [
          { id: "netIncome", label: "Net Income", placeholder: "e.g. 150000" },
          { id: "totalAssets", label: "Total Assets", placeholder: "e.g. 2000000" }
        ],
        calculate: (vals) => {
          if (!vals.totalAssets) return null;
          const val = (vals.netIncome / vals.totalAssets) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 5 ? 'good' : val > 2 ? 'average' : 'poor', 
            interpretationText: "Over 5% is generally good. Shows how efficiently management uses assets to generate earnings." 
          };
        }
      },
      {
        id: "roe",
        name: "Return on Equity (ROE)",
        description: "Measure of financial performance calculated by dividing net income by shareholders' equity.",
        formulaDisplay: "(Net Income ÷ Shareholder's Equity) × 100",
        inputs: [
          { id: "netIncome", label: "Net Income", placeholder: "e.g. 150000" },
          { id: "equity", label: "Shareholder's Equity", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.equity) return null;
          const val = (vals.netIncome / vals.equity) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 15 ? 'good' : val > 10 ? 'average' : 'poor', 
            interpretationText: "15-20% is widely considered good. Measures how effectively management uses investors' money." 
          };
        }
      },
      {
        id: "ebitda-margin",
        name: "EBITDA Margin",
        description: "Measures a company's operating profitability as a percentage of its revenue.",
        formulaDisplay: "(EBITDA ÷ Revenue) × 100",
        inputs: [
          { id: "ebitda", label: "EBITDA", placeholder: "e.g. 250000" },
          { id: "revenue", label: "Revenue", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.revenue) return null;
          const val = (vals.ebitda / vals.revenue) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 15 ? 'good' : val > 8 ? 'average' : 'poor', 
            interpretationText: "Provides a clear view of core operational profitability by stripping out non-operating expenses." 
          };
        }
      }
    ]
  },
  {
    id: "leverage",
    name: "Leverage",
    description: "Determine the extent to which a company uses debt to finance its assets and its ability to meet long-term obligations.",
    icon: Files,
    ratios: [
      {
        id: "debt-to-equity",
        name: "Debt to Equity Ratio",
        description: "Evaluates a company's financial leverage by comparing its total liabilities to shareholder equity.",
        formulaDisplay: "Total Debt ÷ Shareholder's Equity",
        inputs: [
          { id: "totalDebt", label: "Total Debt", placeholder: "e.g. 1200000" },
          { id: "equity", label: "Shareholder's Equity", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.equity) return null;
          const val = vals.totalDebt / vals.equity;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: val > 2 ? 'poor' : val > 1 ? 'average' : 'good', 
            interpretationText: "A ratio > 2 is generally considered risky (highly leveraged), though acceptable in capital-intensive industries." 
          };
        }
      },
      {
        id: "debt-ratio",
        name: "Debt Ratio",
        description: "Measures the proportion of a company's assets that are financed by debt.",
        formulaDisplay: "Total Debt ÷ Total Assets",
        inputs: [
          { id: "totalDebt", label: "Total Debt", placeholder: "e.g. 1200000" },
          { id: "totalAssets", label: "Total Assets", placeholder: "e.g. 2500000" }
        ],
        calculate: (vals) => {
          if (!vals.totalAssets) return null;
          const val = vals.totalDebt / vals.totalAssets;
          return { 
            value: val, 
            formatted: formatPercentage(val * 100), // Display as %
            interpretation: val > 0.6 ? 'poor' : val > 0.4 ? 'average' : 'good', 
            interpretationText: "A ratio greater than 0.5 (50%) indicates that most of the company's assets are financed through debt." 
          };
        }
      },
      {
        id: "interest-coverage",
        name: "Interest Coverage Ratio",
        description: "Determines how easily a company can pay interest on its outstanding debt.",
        formulaDisplay: "EBIT ÷ Interest Expense",
        inputs: [
          { id: "ebit", label: "EBIT", placeholder: "e.g. 200000" },
          { id: "interestExpense", label: "Interest Expense", placeholder: "e.g. 40000" }
        ],
        calculate: (vals) => {
          if (!vals.interestExpense) return null;
          const val = vals.ebit / vals.interestExpense;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: val > 3 ? 'good' : val > 1.5 ? 'average' : 'poor', 
            interpretationText: "A ratio above 3 is generally considered safe. Below 1.5 warns of potential default risk." 
          };
        }
      },
      {
        id: "dscr",
        name: "Debt Service Coverage Ratio (DSCR)",
        description: "Measures cash flow available to pay current debt obligations.",
        formulaDisplay: "Net Operating Income ÷ Total Debt Service",
        inputs: [
          { id: "noi", label: "Net Operating Income", placeholder: "e.g. 150000" },
          { id: "debtService", label: "Total Debt Service", placeholder: "e.g. 100000" }
        ],
        calculate: (vals) => {
          if (!vals.debtService) return null;
          const val = vals.noi / vals.debtService;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: val >= 1.25 ? 'good' : val >= 1 ? 'average' : 'poor', 
            interpretationText: "A DSCR less than 1 means negative cash flow. Lenders usually require a DSCR of at least 1.2x to 1.25x." 
          };
        }
      }
    ]
  },
  {
    id: "efficiency",
    name: "Efficiency",
    description: "Measure how well a company uses its assets and liabilities internally.",
    icon: Zap,
    ratios: [
      {
        id: "asset-turnover",
        name: "Asset Turnover",
        description: "Measures the efficiency of a company's use of its assets in generating sales revenue.",
        formulaDisplay: "Revenue ÷ Total Assets",
        inputs: [
          { id: "revenue", label: "Revenue", placeholder: "e.g. 1000000" },
          { id: "totalAssets", label: "Total Assets", placeholder: "e.g. 500000" }
        ],
        calculate: (vals) => {
          if (!vals.totalAssets) return null;
          const val = vals.revenue / vals.totalAssets;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: 'neutral', 
            interpretationText: "Highly industry dependent. Retailers have high turnover, utilities have low. Higher is better within peers." 
          };
        }
      },
      {
        id: "inventory-turnover",
        name: "Inventory Turnover",
        description: "Shows how many times a company has sold and replaced inventory during a given period.",
        formulaDisplay: "Cost of Goods Sold ÷ Average Inventory",
        inputs: [
          { id: "cogs", label: "Cost of Goods Sold (COGS)", placeholder: "e.g. 600000" },
          { id: "avgInventory", label: "Average Inventory", placeholder: "e.g. 100000" }
        ],
        calculate: (vals) => {
          if (!vals.avgInventory) return null;
          const val = vals.cogs / vals.avgInventory;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: 'neutral', 
            interpretationText: "A high ratio implies strong sales or insufficient inventory. A low ratio implies weak sales or excess inventory." 
          };
        }
      },
      {
        id: "dso",
        name: "Days Sales Outstanding (DSO)",
        description: "The average number of days that it takes a company to collect payment after a sale has been made.",
        formulaDisplay: "(Accounts Receivable ÷ Net Credit Sales) × 365",
        inputs: [
          { id: "ar", label: "Accounts Receivable", placeholder: "e.g. 80000" },
          { id: "sales", label: "Net Credit Sales", placeholder: "e.g. 1000000" }
        ],
        calculate: (vals) => {
          if (!vals.sales) return null;
          const val = (vals.ar / vals.sales) * 365;
          return { 
            value: val, 
            formatted: `${formatNumber(val, 0)} days`, 
            interpretation: val < 45 ? 'good' : val < 60 ? 'average' : 'poor', 
            interpretationText: "Under 45 days is generally considered excellent. Over 60 days may indicate collection issues." 
          };
        }
      }
    ]
  },
  {
    id: "valuation",
    name: "Valuation",
    description: "Assess the attractiveness of a stock or investment.",
    icon: LineChart,
    ratios: [
      {
        id: "pe-ratio",
        name: "Price-to-Earnings (P/E)",
        description: "Relates a company's share price to its earnings per share.",
        formulaDisplay: "Stock Price ÷ Earnings Per Share",
        inputs: [
          { id: "price", label: "Stock Price", placeholder: "e.g. 150.00" },
          { id: "eps", label: "Earnings Per Share", placeholder: "e.g. 5.50" }
        ],
        calculate: (vals) => {
          if (!vals.eps) return null;
          const val = vals.price / vals.eps;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: 'neutral', 
            interpretationText: "A high P/E could mean the stock is overvalued, or that investors expect high growth. Compare to industry average." 
          };
        }
      },
      {
        id: "pb-ratio",
        name: "Price-to-Book (P/B)",
        description: "Compares a firm's market capitalization to its book value.",
        formulaDisplay: "Stock Price ÷ Book Value Per Share",
        inputs: [
          { id: "price", label: "Stock Price", placeholder: "e.g. 150.00" },
          { id: "bvps", label: "Book Value Per Share", placeholder: "e.g. 50.00" }
        ],
        calculate: (vals) => {
          if (!vals.bvps) return null;
          const val = vals.price / vals.bvps;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: val < 1 ? 'good' : 'neutral', 
            interpretationText: "P/B < 1 may indicate an undervalued stock, or something is fundamentally wrong with the company." 
          };
        }
      },
      {
        id: "ev-ebitda",
        name: "EV/EBITDA",
        description: "A valuation multiple that is often used in addition to, or as an alternative to, the P/E ratio.",
        formulaDisplay: "Enterprise Value ÷ EBITDA",
        inputs: [
          { id: "ev", label: "Enterprise Value", placeholder: "e.g. 5000000" },
          { id: "ebitda", label: "EBITDA", placeholder: "e.g. 500000" }
        ],
        calculate: (vals) => {
          if (!vals.ebitda) return null;
          const val = vals.ev / vals.ebitda;
          return { 
            value: val, 
            formatted: `${formatNumber(val)}x`, 
            interpretation: val < 10 ? 'good' : 'average', 
            interpretationText: "A ratio under 10x is generally viewed as healthy and below average (potentially undervalued). Highly industry-dependent." 
          };
        }
      },
      {
        id: "dividend-yield",
        name: "Dividend Yield",
        description: "The amount of money a company pays shareholders for owning a share of its stock divided by its current stock price.",
        formulaDisplay: "(Annual Dividend Per Share ÷ Stock Price) × 100",
        inputs: [
          { id: "dividend", label: "Annual Dividend Per Share", placeholder: "e.g. 3.00" },
          { id: "price", label: "Stock Price", placeholder: "e.g. 150.00" }
        ],
        calculate: (vals) => {
          if (!vals.price) return null;
          const val = (vals.dividend / vals.price) * 100;
          return { 
            value: val, 
            formatted: formatPercentage(val), 
            interpretation: val > 6 ? 'neutral' : val > 2 ? 'good' : 'average', 
            interpretationText: "2-6% is typical for mature companies. Yields > 6% might signal risk that the dividend will be cut." 
          };
        }
      }
    ]
  },
  {
    id: "fair-value",
    name: "Fair Value",
    description: "Estimate the intrinsic value of a stock using fundamental valuation models.",
    icon: Target,
    ratios: [
      {
        id: "graham-number",
        name: "Graham Number",
        description: "A figure that measures a stock's fundamental value by taking into account earnings per share and book value per share.",
        formulaDisplay: "√(22.5 × EPS × Book Value Per Share)",
        inputs: [
          { id: "eps", label: "Earnings Per Share – EPS", placeholder: "e.g. 5.50" },
          { id: "bvps", label: "Book Value Per Share", placeholder: "e.g. 30.00" },
          { id: "price", label: "Current Stock Price", placeholder: "e.g. 120.00" }
        ],
        calculate: (vals) => {
          if (!vals.eps || !vals.bvps || vals.eps <= 0 || vals.bvps <= 0) return null;
          const val = Math.sqrt(22.5 * vals.eps * vals.bvps);
          const margin = vals.price ? ((vals.price - val) / val) * 100 : null;
          let interp: InterpretationType = 'neutral';
          let text = `Graham Number fair value: $${formatNumber(val, 2)}.`;
          if (vals.price) {
            if (vals.price < val * 0.9) { interp = 'good'; text += ` Stock appears undervalued by ~${formatNumber(Math.abs(margin!), 1)}% vs. Graham Number.`; }
            else if (vals.price > val * 1.1) { interp = 'poor'; text += ` Stock appears overvalued by ~${formatNumber(Math.abs(margin!), 1)}% vs. Graham Number.`; }
            else { interp = 'average'; text += " Stock is trading near its Graham Number fair value."; }
          }
          return { value: val, formatted: `$${formatNumber(val, 2)}`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "graham-intrinsic",
        name: "Graham Intrinsic Value",
        description: "Benjamin Graham's revised formula estimating intrinsic value based on earnings and expected growth.",
        formulaDisplay: "EPS × (8.5 + 2g) × (4.4 ÷ AAA Bond Yield)",
        inputs: [
          { id: "eps", label: "Earnings Per Share – EPS", placeholder: "e.g. 5.50" },
          { id: "growth", label: "Expected Annual Growth Rate (%)", placeholder: "e.g. 10" },
          { id: "bondYield", label: "Current AAA Bond Yield (%)", placeholder: "e.g. 4.5" },
          { id: "price", label: "Current Stock Price", placeholder: "e.g. 120.00" }
        ],
        calculate: (vals) => {
          if (!vals.eps || !vals.bondYield || vals.bondYield <= 0) return null;
          const val = (vals.eps * (8.5 + 2 * vals.growth) * 4.4) / vals.bondYield;
          let interp: InterpretationType = 'neutral';
          let text = `Intrinsic value estimate: $${formatNumber(val, 2)}.`;
          if (vals.price) {
            const pct = ((vals.price - val) / val) * 100;
            if (vals.price < val * 0.85) { interp = 'good'; text += ` Trading at a ${formatNumber(Math.abs(pct), 1)}% discount — potential margin of safety.`; }
            else if (vals.price > val * 1.15) { interp = 'poor'; text += ` Trading at a ${formatNumber(Math.abs(pct), 1)}% premium — may be overvalued.`; }
            else { interp = 'average'; text += " Trading near intrinsic value."; }
          }
          return { value: val, formatted: `$${formatNumber(val, 2)}`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "peter-lynch-fv",
        name: "Peter Lynch Fair Value",
        description: "Estimates fair value where a company's P/E ratio should equal its earnings growth rate (PEG = 1).",
        formulaDisplay: "EPS × Earnings Growth Rate (%)",
        inputs: [
          { id: "eps", label: "Earnings Per Share – EPS", placeholder: "e.g. 5.50" },
          { id: "growth", label: "Annual EPS Growth Rate (%)", placeholder: "e.g. 15" },
          { id: "price", label: "Current Stock Price", placeholder: "e.g. 120.00" }
        ],
        calculate: (vals) => {
          if (!vals.eps || !vals.growth || vals.growth <= 0) return null;
          const val = vals.eps * vals.growth;
          let interp: InterpretationType = 'neutral';
          let text = `Peter Lynch fair value: $${formatNumber(val, 2)} (PEG = 1).`;
          if (vals.price) {
            const pct = ((vals.price - val) / val) * 100;
            if (vals.price < val * 0.9) { interp = 'good'; text += ` Undervalued by ~${formatNumber(Math.abs(pct), 1)}%. PEG below 1 is considered attractive.`; }
            else if (vals.price > val * 1.1) { interp = 'poor'; text += ` Overvalued by ~${formatNumber(Math.abs(pct), 1)}%. PEG above 1 means paying a premium for growth.`; }
            else { interp = 'average'; text += " Fairly valued at PEG ≈ 1."; }
          }
          return { value: val, formatted: `$${formatNumber(val, 2)}`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "ddm",
        name: "Dividend Discount Model (DDM)",
        description: "Values a stock based on the theory that it is worth the sum of all its future dividend payments, discounted back to present value.",
        formulaDisplay: "D₁ ÷ (Required Return − Dividend Growth Rate)",
        inputs: [
          { id: "dividend", label: "Annual Dividend Per Share", placeholder: "e.g. 3.00" },
          { id: "growth", label: "Dividend Growth Rate (%)", placeholder: "e.g. 5" },
          { id: "rate", label: "Required Rate of Return (%)", placeholder: "e.g. 10" },
          { id: "price", label: "Current Stock Price", placeholder: "e.g. 120.00" }
        ],
        calculate: (vals) => {
          const r = vals.rate / 100;
          const g = vals.growth / 100;
          if (!vals.dividend || !vals.rate || r <= g) return null;
          const d1 = vals.dividend * (1 + g);
          const val = d1 / (r - g);
          let interp: InterpretationType = 'neutral';
          let text = `DDM fair value: $${formatNumber(val, 2)}.`;
          if (vals.price) {
            const pct = ((vals.price - val) / val) * 100;
            if (vals.price < val * 0.9) { interp = 'good'; text += ` Stock appears undervalued by ~${formatNumber(Math.abs(pct), 1)}%.`; }
            else if (vals.price > val * 1.1) { interp = 'poor'; text += ` Stock appears overvalued by ~${formatNumber(Math.abs(pct), 1)}%.`; }
            else { interp = 'average'; text += " Stock is trading near DDM fair value."; }
          }
          return { value: val, formatted: `$${formatNumber(val, 2)}`, interpretation: interp, interpretationText: text };
        }
      },
      {
        id: "dcf-simple",
        name: "Simple DCF Fair Value",
        description: "Estimates intrinsic value by discounting projected free cash flow per share over a period, then adding a terminal value.",
        formulaDisplay: "Σ [FCF/Share × (1+g)ᵗ ÷ (1+r)ᵗ] + Terminal Value",
        inputs: [
          { id: "fcfPerShare", label: "Free Cash Flow Per Share", placeholder: "e.g. 8.00" },
          { id: "growth", label: "FCF Growth Rate – 10 yr (%)", placeholder: "e.g. 12" },
          { id: "terminalGrowth", label: "Terminal Growth Rate (%)", placeholder: "e.g. 3" },
          { id: "discountRate", label: "Discount Rate / WACC (%)", placeholder: "e.g. 10" },
          { id: "price", label: "Current Stock Price", placeholder: "e.g. 120.00" }
        ],
        calculate: (vals) => {
          const g = vals.growth / 100;
          const tg = vals.terminalGrowth / 100;
          const r = vals.discountRate / 100;
          if (!vals.fcfPerShare || !vals.discountRate || r <= tg) return null;
          let pv = 0;
          let fcf = vals.fcfPerShare;
          for (let t = 1; t <= 10; t++) {
            fcf *= (1 + g);
            pv += fcf / Math.pow(1 + r, t);
          }
          const terminalValue = (fcf * (1 + tg)) / (r - tg);
          const pvTerminal = terminalValue / Math.pow(1 + r, 10);
          const val = pv + pvTerminal;
          let interp: InterpretationType = 'neutral';
          let text = `DCF fair value: $${formatNumber(val, 2)}.`;
          if (vals.price) {
            const pct = ((vals.price - val) / val) * 100;
            if (vals.price < val * 0.8) { interp = 'good'; text += ` Over 20% margin of safety — appears significantly undervalued.`; }
            else if (vals.price < val * 0.95) { interp = 'average'; text += ` Modest discount of ~${formatNumber(Math.abs(pct), 1)}% to intrinsic value.`; }
            else if (vals.price > val * 1.1) { interp = 'poor'; text += ` Trading above intrinsic value by ~${formatNumber(Math.abs(pct), 1)}%.`; }
            else { interp = 'average'; text += " Trading near DCF intrinsic value."; }
          }
          return { value: val, formatted: `$${formatNumber(val, 2)}`, interpretation: interp, interpretationText: text };
        }
      }
    ]
  }
];
