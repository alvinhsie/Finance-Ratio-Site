import { formatNumber, formatPercentage } from "./utils";
import { 
  Briefcase, 
  TrendingUp, 
  Scale, 
  Activity, 
  LineChart 
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
    icon: Briefcase,
    ratios: [
      {
        id: "current-ratio",
        name: "Current Ratio",
        description: "Measures a company's ability to pay short-term obligations or those due within one year.",
        formulaDisplay: "Current Assets ÷ Current Liabilities",
        inputs: [
          { id: "currentAssets", label: "Current Assets ($)", placeholder: "e.g. 500000" },
          { id: "currentLiabilities", label: "Current Liabilities ($)", placeholder: "e.g. 250000" }
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
          { id: "currentAssets", label: "Current Assets ($)", placeholder: "e.g. 500000" },
          { id: "inventory", label: "Inventory ($)", placeholder: "e.g. 150000" },
          { id: "currentLiabilities", label: "Current Liabilities ($)", placeholder: "e.g. 250000" }
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
          { id: "cash", label: "Cash & Equivalents ($)", placeholder: "e.g. 100000" },
          { id: "currentLiabilities", label: "Current Liabilities ($)", placeholder: "e.g. 250000" }
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
          { id: "grossProfit", label: "Gross Profit ($)", placeholder: "e.g. 400000" },
          { id: "revenue", label: "Revenue ($)", placeholder: "e.g. 1000000" }
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
          { id: "netIncome", label: "Net Income ($)", placeholder: "e.g. 150000" },
          { id: "revenue", label: "Revenue ($)", placeholder: "e.g. 1000000" }
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
          { id: "netIncome", label: "Net Income ($)", placeholder: "e.g. 150000" },
          { id: "totalAssets", label: "Total Assets ($)", placeholder: "e.g. 2000000" }
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
          { id: "netIncome", label: "Net Income ($)", placeholder: "e.g. 150000" },
          { id: "equity", label: "Shareholder's Equity ($)", placeholder: "e.g. 1000000" }
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
          { id: "ebitda", label: "EBITDA ($)", placeholder: "e.g. 250000" },
          { id: "revenue", label: "Revenue ($)", placeholder: "e.g. 1000000" }
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
    name: "Leverage & Solvency",
    description: "Determine the extent to which a company uses debt to finance its assets and its ability to meet long-term obligations.",
    icon: Scale,
    ratios: [
      {
        id: "debt-to-equity",
        name: "Debt to Equity Ratio",
        description: "Evaluates a company's financial leverage by comparing its total liabilities to shareholder equity.",
        formulaDisplay: "Total Debt ÷ Shareholder's Equity",
        inputs: [
          { id: "totalDebt", label: "Total Debt ($)", placeholder: "e.g. 1200000" },
          { id: "equity", label: "Shareholder's Equity ($)", placeholder: "e.g. 1000000" }
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
          { id: "totalDebt", label: "Total Debt ($)", placeholder: "e.g. 1200000" },
          { id: "totalAssets", label: "Total Assets ($)", placeholder: "e.g. 2500000" }
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
          { id: "ebit", label: "EBIT ($)", placeholder: "e.g. 200000" },
          { id: "interestExpense", label: "Interest Expense ($)", placeholder: "e.g. 40000" }
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
          { id: "noi", label: "Net Operating Income ($)", placeholder: "e.g. 150000" },
          { id: "debtService", label: "Total Debt Service ($)", placeholder: "e.g. 100000" }
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
    icon: Activity,
    ratios: [
      {
        id: "asset-turnover",
        name: "Asset Turnover",
        description: "Measures the efficiency of a company's use of its assets in generating sales revenue.",
        formulaDisplay: "Revenue ÷ Total Assets",
        inputs: [
          { id: "revenue", label: "Revenue ($)", placeholder: "e.g. 1000000" },
          { id: "totalAssets", label: "Total Assets ($)", placeholder: "e.g. 500000" }
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
          { id: "cogs", label: "Cost of Goods Sold (COGS) ($)", placeholder: "e.g. 600000" },
          { id: "avgInventory", label: "Average Inventory ($)", placeholder: "e.g. 100000" }
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
          { id: "ar", label: "Accounts Receivable ($)", placeholder: "e.g. 80000" },
          { id: "sales", label: "Net Credit Sales ($)", placeholder: "e.g. 1000000" }
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
          { id: "price", label: "Stock Price ($)", placeholder: "e.g. 150.00" },
          { id: "eps", label: "Earnings Per Share ($)", placeholder: "e.g. 5.50" }
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
          { id: "price", label: "Stock Price ($)", placeholder: "e.g. 150.00" },
          { id: "bvps", label: "Book Value Per Share ($)", placeholder: "e.g. 50.00" }
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
          { id: "ev", label: "Enterprise Value ($)", placeholder: "e.g. 5000000" },
          { id: "ebitda", label: "EBITDA ($)", placeholder: "e.g. 500000" }
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
          { id: "dividend", label: "Annual Dividend Per Share ($)", placeholder: "e.g. 3.00" },
          { id: "price", label: "Stock Price ($)", placeholder: "e.g. 150.00" }
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
  }
];
