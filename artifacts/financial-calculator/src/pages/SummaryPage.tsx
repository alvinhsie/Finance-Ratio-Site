import React from 'react';
import { useCalculatorState } from '@/lib/CalculatorStateContext';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Droplets, TrendingUp, ShieldAlert, Zap,
  BarChart2, Target, CheckCircle2, XCircle, ShieldCheck,
  Flame, RefreshCcw, AlertTriangle,
} from 'lucide-react';

type Interp = 'good' | 'average' | 'poor' | 'neutral';

interface Metric {
  label: string;
  labelId: string;
  value: number | null;
  formatted: string;
  interp: Interp;
}

const VALUE_COLOR: Record<Interp, string> = {
  good:    'text-green-600 dark:text-green-400',
  average: 'text-yellow-400',
  poor:    'text-red-500 dark:text-red-400',
  neutral: 'text-blue-600 dark:text-blue-400',
};

function n(v: string) { return parseFloat(v) || 0; }
function has(vals: Record<string, string>, k: string) {
  return vals[k] !== '' && !isNaN(parseFloat(vals[k]));
}

function fmtX(v: number)   { return `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`; }
function fmtPct(v: number) { return `${v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`; }
function fmtNum(v: number) {
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9)  return `${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6)  return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDays(v: number) { return `${Math.round(v)} days`; }
function fmtSign(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`; }

function computeLiquidity(v: Record<string, string>): Metric[] {
  const h = (k: string) => has(v, k);
  return [
    (() => {
      const val = (h('currentAssets') && h('currentLiabilities') && n(v.currentLiabilities) !== 0)
        ? n(v.currentAssets) / n(v.currentLiabilities) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val >= 1.5 && val <= 3) interp = 'good';
        else if (val > 3)           interp = 'neutral';
        else if (val >= 1)          interp = 'average';
        else                        interp = 'poor';
      }
      return { label: 'Current Ratio', labelId: 'Rasio Lancar', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('currentAssets') && h('inventory') && h('currentLiabilities') && n(v.currentLiabilities) !== 0)
        ? (n(v.currentAssets) - n(v.inventory)) / n(v.currentLiabilities) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 1)    interp = 'good';
        else if (val === 1) interp = 'neutral';
        else            interp = 'poor';
      }
      return { label: 'Quick Ratio', labelId: 'Rasio Cepat', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('cash') && h('currentLiabilities') && n(v.currentLiabilities) !== 0)
        ? n(v.cash) / n(v.currentLiabilities) : null;
      let interp: Interp = 'neutral';
      if (val !== null) {
        if (val >= 0.5) interp = 'good';
        else if (val >= 0.1) interp = 'neutral';
        else            interp = 'poor';
      }
      return { label: 'Cash Ratio', labelId: 'Rasio Kas', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('currentAssets') && h('currentLiabilities'))
        ? n(v.currentAssets) - n(v.currentLiabilities) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 0)  interp = 'good';
        else if (val < 0) interp = 'poor';
        else          interp = 'average';
      }
      return { label: 'Working Capital', labelId: 'Modal Kerja', value: val, formatted: val !== null ? fmtNum(val) : '—', interp };
    })(),
    (() => {
      const val = (h('cfFromOps') && h('currentLiabilities') && n(v.currentLiabilities) !== 0)
        ? n(v.cfFromOps) / n(v.currentLiabilities) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val >= 1)   interp = 'good';
        else if (val >= 0.5) interp = 'average';
        else            interp = 'poor';
      }
      return { label: 'Operating CF Ratio', labelId: 'Rasio Arus Kas Operasi', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('ebit') && h('interestExpense') && n(v.interestExpense) !== 0)
        ? n(v.ebit) / n(v.interestExpense) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 3)    interp = 'good';
        else if (val >= 1.5) interp = 'average';
        else            interp = 'poor';
      }
      return { label: 'Interest Coverage', labelId: 'Cakupan Bunga', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
  ];
}

function computeProfitability(v: Record<string, string>): Metric[] {
  const h = (k: string) => has(v, k);
  return [
    (() => {
      const val = (h('netIncome') && h('totalRevenue') && n(v.totalRevenue) !== 0)
        ? (n(v.netIncome) / n(v.totalRevenue)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 20)     interp = 'good';
        else if (val >= 5) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Net Profit Margin', labelId: 'Margin Laba Bersih', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
    (() => {
      const val = (h('grossProfit') && h('totalRevenue') && n(v.totalRevenue) !== 0)
        ? (n(v.grossProfit) / n(v.totalRevenue)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 40)      interp = 'good';
        else if (val >= 20) interp = 'average';
        else               interp = 'poor';
      }
      return { label: 'Gross Profit Margin', labelId: 'Margin Laba Kotor', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
    (() => {
      const val = (h('operatingIncome') && h('totalRevenue') && n(v.totalRevenue) !== 0)
        ? (n(v.operatingIncome) / n(v.totalRevenue)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 15)      interp = 'good';
        else if (val >= 5) interp = 'average';
        else               interp = 'poor';
      }
      return { label: 'Operating Margin', labelId: 'Margin Operasi', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
    (() => {
      const val = (h('netIncome') && h('totalAssets') && n(v.totalAssets) !== 0)
        ? (n(v.netIncome) / n(v.totalAssets)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 5)       interp = 'good';
        else if (val >= 2) interp = 'average';
        else               interp = 'poor';
      }
      return { label: 'Return on Assets (ROA)', labelId: 'Imbal Hasil Aset (ROA)', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
    (() => {
      const val = (h('netIncome') && h('totalEquity') && n(v.totalEquity) !== 0)
        ? (n(v.netIncome) / n(v.totalEquity)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 15)      interp = 'good';
        else if (val >= 8) interp = 'average';
        else               interp = 'poor';
      }
      return { label: 'Return on Equity (ROE)', labelId: 'Imbal Hasil Ekuitas (ROE)', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
    (() => {
      const val = (h('ebitda') && h('totalRevenue') && n(v.totalRevenue) !== 0)
        ? (n(v.ebitda) / n(v.totalRevenue)) * 100 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 30)       interp = 'good';
        else if (val >= 15) interp = 'average';
        else                interp = 'poor';
      }
      return { label: 'EBITDA Margin', labelId: 'Margin EBITDA', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
  ];
}

function computeLeverage(v: Record<string, string>): Metric[] {
  const h = (k: string) => has(v, k);
  return [
    (() => {
      const val = (h('totalLiabilities') && h('totalEquity') && n(v.totalEquity) !== 0)
        ? n(v.totalLiabilities) / n(v.totalEquity) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val < 1)      interp = 'good';
        else if (val <= 2) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Liabilities / Equity', labelId: 'Liabilitas / Ekuitas', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('totalLiabilities') && h('totalAssets') && n(v.totalAssets) !== 0)
        ? n(v.totalLiabilities) / n(v.totalAssets) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val < 0.3)       interp = 'good';
        else if (val <= 0.6) interp = 'average';
        else                 interp = 'poor';
      }
      return { label: 'Debt / Assets', labelId: 'Utang / Aset', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('totalDebt') && h('ebitda') && n(v.ebitda) !== 0)
        ? n(v.totalDebt) / n(v.ebitda) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val < 2)      interp = 'good';
        else if (val <= 4) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Debt / EBITDA', labelId: 'Utang / EBITDA', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
  ];
}

function computeEfficiency(v: Record<string, string>): Metric[] {
  const h = (k: string) => has(v, k);
  return [
    (() => {
      const val = (h('totalRevenue') && h('accountsReceivable') && n(v.accountsReceivable) !== 0)
        ? n(v.totalRevenue) / n(v.accountsReceivable) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 8)      interp = 'good';
        else if (val >= 4) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Receivables Turnover', labelId: 'Perputaran Piutang', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('accountsReceivable') && h('totalRevenue') && n(v.totalRevenue) !== 0)
        ? (n(v.accountsReceivable) / n(v.totalRevenue)) * 365 : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val < 30)      interp = 'good';
        else if (val <= 60) interp = 'average';
        else               interp = 'poor';
      }
      return { label: 'Days Sales Outstanding', labelId: 'Hari Penjualan Beredar', value: val, formatted: val !== null ? fmtDays(val) : '—', interp };
    })(),
    (() => {
      const wc = n(v.currentAssets) - n(v.currentLiabilities);
      const val = (h('totalRevenue') && h('currentAssets') && h('currentLiabilities') && wc !== 0)
        ? n(v.totalRevenue) / wc : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 6)      interp = 'good';
        else if (val >= 2) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Working Capital Turnover', labelId: 'Perputaran Modal Kerja', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('totalRevenue') && h('netFixedAssets') && n(v.netFixedAssets) !== 0)
        ? n(v.totalRevenue) / n(v.netFixedAssets) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val > 5)      interp = 'good';
        else if (val >= 2) interp = 'average';
        else              interp = 'poor';
      }
      return { label: 'Fixed Asset Turnover', labelId: 'Perputaran Aset Tetap', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
  ];
}

function computeValuation(v: Record<string, string>): Metric[] {
  const h = (k: string) => has(v, k);
  const marketCap = n(v.marketPrice) * n(v.sharesOutstanding);
  const ev = marketCap + n(v.totalDebt) - n(v.cashEquivalents);
  return [
    (() => {
      const val = (h('marketPrice') && h('eps') && n(v.eps) !== 0)
        ? n(v.marketPrice) / n(v.eps) : null;
      let interp: Interp = 'neutral';
      if (val !== null) {
        if (val < 0)        interp = 'poor';
        else if (val < 10)  interp = 'neutral';
        else if (val <= 20) interp = 'good';
        else if (val <= 30) interp = 'average';
        else                interp = 'poor';
      }
      return { label: 'P/E Ratio', labelId: 'Rasio P/E', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('marketPrice') && h('bvps') && n(v.bvps) !== 0)
        ? n(v.marketPrice) / n(v.bvps) : null;
      let interp: Interp = 'neutral';
      if (val !== null) {
        if (val < 1)       interp = 'neutral';
        else if (val <= 3) interp = 'good';
        else               interp = 'poor';
      }
      return { label: 'P/B Ratio', labelId: 'Rasio P/B', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('marketPrice') && h('sharesOutstanding') && h('totalDebt') && h('cashEquivalents') && h('ebitda') && n(v.ebitda) !== 0)
        ? ev / n(v.ebitda) : null;
      let interp: Interp = 'average';
      if (val !== null) {
        if (val < 8)        interp = 'good';
        else if (val <= 15) interp = 'average';
        else                interp = 'poor';
      }
      return { label: 'EV/EBITDA', labelId: 'EV/EBITDA', value: val, formatted: val !== null ? fmtX(val) : '—', interp };
    })(),
    (() => {
      const val = (h('dividendPerShare') && h('marketPrice') && n(v.marketPrice) !== 0)
        ? (n(v.dividendPerShare) / n(v.marketPrice)) * 100 : null;
      let interp: Interp = 'neutral';
      if (val !== null) {
        if (val >= 4)     interp = 'good';
        else if (val >= 2) interp = 'average';
        else if (val > 0) interp = 'poor';
        else              interp = 'neutral';
      }
      return { label: 'Dividend Yield', labelId: 'Imbal Hasil Dividen', value: val, formatted: val !== null ? fmtPct(val) : '—', interp };
    })(),
  ];
}

interface FVResult {
  bvps: number;
  intrinsic: number;
  upside: number | null;
  mos: number | null;
}

function computeFairValue(vals: Record<string, string>, mode: 'standard' | 'cyclical'): FVResult | null {
  const isFilled = (k: string) => vals[k]?.trim() !== '';
  const nv = (k: string) => parseFloat(vals[k] || '0') || 0;

  const stdReady = isFilled('currentEps') && isFilled('totalEquity') && isFilled('sharesOutstanding') &&
    isFilled('growthRate') && isFilled('inflationRate') && nv('inflationRate') > 0 && nv('sharesOutstanding') > 0;
  const cycReady = isFilled('normalizedEps') && isFilled('totalEquity') && isFilled('sharesOutstanding') &&
    isFilled('shortTermCagr') && isFilled('longTermCagr') && isFilled('inflationRate') &&
    nv('inflationRate') > 0 && nv('sharesOutstanding') > 0;

  if (mode === 'standard' && !stdReady) return null;
  if (mode === 'cyclical' && !cycReady) return null;

  const bvps = nv('totalEquity') / nv('sharesOutstanding');
  const r    = nv('inflationRate') / 100;
  let totalEps = 0;

  if (mode === 'standard') {
    const eps = nv('currentEps');
    const g   = nv('growthRate') / 100;
    for (let i = 1; i <= 10; i++) totalEps += eps * Math.pow(1 + g, i);
  } else {
    const eps = nv('normalizedEps');
    const g1  = nv('shortTermCagr') / 100;
    const g2  = nv('longTermCagr')  / 100;
    for (let i = 1; i <= 5; i++) totalEps += eps * Math.pow(1 + g1, i);
    const eps5 = eps * Math.pow(1 + g1, 5);
    for (let i = 1; i <= 5; i++) totalEps += eps5 * Math.pow(1 + g2, i);
  }

  const discountFactor = Math.pow(1 + r, 10);
  const intrinsic = (totalEps + bvps) / discountFactor;
  const price = nv('currentPrice');
  const hasPriceInput = isFilled('currentPrice') && price > 0;

  const upside = hasPriceInput ? ((intrinsic - price) / price) * 100 : null;
  const mos    = hasPriceInput && intrinsic !== 0 ? ((intrinsic - price) / intrinsic) * 100 : null;

  return { bvps, intrinsic, upside, mos };
}

interface SectionProps {
  title: string;
  titleId: string;
  icon: React.ReactNode;
  accentColor: string;
  headerBg: string;
  leftBorder: string;
  metrics: Metric[];
  extra?: React.ReactNode;
  language: string;
}

function SectionCard({ title, titleId, icon, accentColor, headerBg, leftBorder, metrics, extra, language }: SectionProps) {
  const visibleMetrics = metrics.filter(m => m.value !== null);
  const totalMetrics = metrics.length;
  const filledCount = visibleMetrics.length;

  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden border-l-4', leftBorder)}>
      <div className={cn('flex items-center gap-2.5 px-5 py-3', headerBg)}>
        <span className={cn('shrink-0', accentColor)}>{icon}</span>
        <span className="font-semibold text-sm text-foreground">
          {language === 'id' ? titleId : title}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {filledCount}/{totalMetrics}
        </span>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0">
              <span className="text-xs text-muted-foreground leading-tight">
                {language === 'id' ? m.labelId : m.label}
              </span>
              <span className={cn('text-sm font-semibold tabular-nums shrink-0', m.value !== null ? VALUE_COLOR[m.interp] : 'text-muted-foreground/40')}>
                {m.formatted}
              </span>
            </div>
          ))}
        </div>
        {extra}
      </div>
    </div>
  );
}

type HealthState = 'safe' | 'cashBurner' | 'recovery' | 'danger';

function getLiquidityHealth(wc: number | null, ocfr: number | null): HealthState | null {
  if (wc === null || ocfr === null) return null;
  if (wc > 0 && ocfr >= 1)  return 'safe';
  if (wc > 0 && ocfr < 1)   return 'cashBurner';
  if (wc <= 0 && ocfr >= 1) return 'recovery';
  return 'danger';
}

const HEALTH_CONFIG: Record<HealthState, {
  icon: React.ReactNode; bg: string; text: string; border: string;
  labelEn: string; labelId: string;
}> = {
  safe:        { icon: <ShieldCheck className="w-4 h-4" />, bg: 'bg-green-50 dark:bg-green-950/40',   text: 'text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-800',  labelEn: 'Safe',                labelId: 'Aman' },
  cashBurner:  { icon: <Flame       className="w-4 h-4" />, bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', labelEn: 'Potential Cash Burner', labelId: 'Potensi Pembakar Kas' },
  recovery:    { icon: <RefreshCcw  className="w-4 h-4" />, bg: 'bg-blue-50 dark:bg-blue-950/40',     text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800',    labelEn: 'Recovery',            labelId: 'Pemulihan' },
  danger:      { icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-red-50 dark:bg-red-950/40',     text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800',      labelEn: 'Danger',              labelId: 'Berbahaya' },
};

export function SummaryPage() {
  const { language } = useLanguage();
  const { state, fairValueMode } = useCalculatorState();
  const liq  = state.liquidity;
  const prof = state.profitability;
  const lev  = state.leverage;
  const eff  = state.efficiency;
  const val  = state.valuation;
  const fvVals = fairValueMode === 'standard' ? state.fairValueStd : state.fairValueCyc;

  const isEn = language === 'en';

  const checks = {
    liquidity:    has(liq,  'currentAssets')  && has(liq,  'currentLiabilities'),
    profitability: has(prof, 'netIncome')      && has(prof, 'totalRevenue'),
    leverage:     has(lev,  'totalLiabilities') && has(lev,  'totalEquity'),
    efficiency:   has(eff,  'totalRevenue')   && has(eff,  'currentAssets') && has(eff, 'currentLiabilities'),
    valuation:    has(val,  'marketPrice')    && has(val,  'eps'),
  };

  const allRequired = Object.values(checks).every(Boolean);

  const liqMetrics  = computeLiquidity(liq);
  const profMetrics = computeProfitability(prof);
  const levMetrics  = computeLeverage(lev);
  const effMetrics  = computeEfficiency(eff);
  const valMetrics  = computeValuation(val);
  const fvResult    = computeFairValue(fvVals, fairValueMode);

  const wc   = liqMetrics[3].value;
  const ocfr = liqMetrics[4].value;
  const health = getLiquidityHealth(wc, ocfr);

  const TAB_LABELS: Record<keyof typeof checks, { en: string; id: string }> = {
    liquidity:    { en: 'Liquidity',    id: 'Likuiditas' },
    profitability: { en: 'Profitability', id: 'Profitabilitas' },
    leverage:     { en: 'Leverage',     id: 'Leverage' },
    efficiency:   { en: 'Efficiency',   id: 'Efisiensi' },
    valuation:    { en: 'Valuation',    id: 'Valuasi' },
  };

  const missingTabs = (Object.entries(checks) as [keyof typeof checks, boolean][])
    .filter(([, v]) => !v)
    .map(([k]) => isEn ? TAB_LABELS[k].en : TAB_LABELS[k].id);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEn ? 'Company Summary' : 'Ringkasan Perusahaan'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEn
                ? 'All ratios at a glance — fill every calculator tab to unlock this view.'
                : 'Semua rasio sekaligus — isi setiap tab kalkulator untuk membuka tampilan ini.'}
            </p>
          </div>
        </div>

        {/* Readiness chips */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(checks) as [keyof typeof checks, boolean][]).map(([key, ready]) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                ready
                  ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                  : 'bg-muted text-muted-foreground border-border/50'
              )}
            >
              {ready
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <XCircle className="w-3.5 h-3.5" />}
              {isEn ? TAB_LABELS[key].en : TAB_LABELS[key].id}
            </div>
          ))}
        </div>

        {/* Not ready alert */}
        {!allRequired && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5 flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                {isEn ? 'Some tabs need data' : 'Beberapa tab membutuhkan data'}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {isEn
                  ? `Please fill in the required fields in: ${missingTabs.join(', ')}.`
                  : `Harap isi kolom yang diperlukan di: ${missingTabs.join(', ')}.`}
              </p>
            </div>
          </div>
        )}

        {/* Main sections — always rendered once all required tabs are filled */}
        {allRequired && (
          <div className="space-y-5">

            {/* Liquidity */}
            <SectionCard
              title="Liquidity" titleId="Likuiditas"
              icon={<Droplets className="w-4 h-4" />}
              accentColor="text-sky-500 dark:text-sky-400"
              headerBg="bg-sky-50 dark:bg-sky-950/30"
              leftBorder="border-l-sky-400 dark:border-l-sky-500"
              metrics={liqMetrics}
              language={language}
              extra={health !== null ? (
                <div className={cn(
                  'flex items-center gap-2 mt-4 px-3 py-2 rounded-xl border text-sm font-semibold',
                  HEALTH_CONFIG[health].bg, HEALTH_CONFIG[health].text, HEALTH_CONFIG[health].border
                )}>
                  {HEALTH_CONFIG[health].icon}
                  <span>{isEn ? 'Liquidity Health:' : 'Kesehatan Likuiditas:'}</span>
                  <span>{isEn ? HEALTH_CONFIG[health].labelEn : HEALTH_CONFIG[health].labelId}</span>
                </div>
              ) : undefined}
            />

            {/* Profitability */}
            <SectionCard
              title="Profitability" titleId="Profitabilitas"
              icon={<TrendingUp className="w-4 h-4" />}
              accentColor="text-emerald-500 dark:text-emerald-400"
              headerBg="bg-emerald-50 dark:bg-emerald-950/30"
              leftBorder="border-l-emerald-400 dark:border-l-emerald-500"
              metrics={profMetrics}
              language={language}
            />

            {/* Leverage */}
            <SectionCard
              title="Leverage" titleId="Leverage"
              icon={<ShieldAlert className="w-4 h-4" />}
              accentColor="text-orange-500 dark:text-orange-400"
              headerBg="bg-orange-50 dark:bg-orange-950/30"
              leftBorder="border-l-orange-400 dark:border-l-orange-500"
              metrics={levMetrics}
              language={language}
            />

            {/* Efficiency */}
            <SectionCard
              title="Efficiency" titleId="Efisiensi"
              icon={<Zap className="w-4 h-4" />}
              accentColor="text-violet-500 dark:text-violet-400"
              headerBg="bg-violet-50 dark:bg-violet-950/30"
              leftBorder="border-l-violet-400 dark:border-l-violet-500"
              metrics={effMetrics}
              language={language}
            />

            {/* Valuation */}
            <SectionCard
              title="Valuation" titleId="Valuasi"
              icon={<BarChart2 className="w-4 h-4" />}
              accentColor="text-rose-500 dark:text-rose-400"
              headerBg="bg-rose-50 dark:bg-rose-950/30"
              leftBorder="border-l-rose-400 dark:border-l-rose-500"
              metrics={valMetrics}
              language={language}
            />

            {/* Fair Value — conditional */}
            {fvResult !== null ? (
              <div className="rounded-2xl border border-border/50 border-l-4 border-l-teal-400 dark:border-l-teal-500 bg-card shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3 bg-teal-50 dark:bg-teal-950/30">
                  <Target className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {isEn ? 'Fair Value' : 'Nilai Wajar'}
                  </span>
                  <span className="ml-1 text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium border border-teal-200 dark:border-teal-800">
                    {fairValueMode === 'standard'
                      ? (isEn ? 'Standard' : 'Standar')
                      : (isEn ? 'Cyclical' : 'Siklus')}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">
                        {isEn ? 'Book Value / Share' : 'Nilai Buku / Saham'}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                        {fvResult.bvps.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">
                        {isEn ? 'Intrinsic Value' : 'Nilai Intrinsik'}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                        {fvResult.intrinsic.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {fvResult.upside !== null && (
                      <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">
                          {isEn ? 'Upside / Downside' : 'Potensi Naik / Turun'}
                        </span>
                        <span className={cn(
                          'text-sm font-semibold tabular-nums',
                          fvResult.upside >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                        )}>
                          {fmtSign(fvResult.upside)}
                        </span>
                      </div>
                    )}
                    {fvResult.mos !== null && (
                      <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">
                          {isEn ? 'Margin of Safety' : 'Margin Keamanan'}
                        </span>
                        <span className={cn(
                          'text-sm font-semibold tabular-nums',
                          fvResult.mos >= 20 ? 'text-green-600 dark:text-green-400'
                          : fvResult.mos >= 0 ? 'text-yellow-400'
                          : 'text-red-500 dark:text-red-400'
                        )}>
                          {fmtSign(fvResult.mos)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-5 flex gap-4 items-start">
                <Target className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-muted-foreground text-sm">
                    {isEn ? 'Fair Value not filled' : 'Nilai Wajar belum diisi'}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {isEn
                      ? 'Fill in the Fair Value tab to see the intrinsic value, upside/downside, and margin of safety.'
                      : 'Isi tab Nilai Wajar untuk melihat nilai intrinsik, potensi naik/turun, dan margin keamanan.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
