import { useCalculatorState, FairValueMode } from '@/lib/CalculatorStateContext';
import {
  FAIRVALUE_STD_EMPTY, FAIRVALUE_CYC_EMPTY,
  FAIRVALUE_DCF_EMPTY, FAIRVALUE_DDM_EMPTY, FAIRVALUE_NAV_EMPTY,
} from '@/lib/calculatorDefaults';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BookOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';

// ── Formatters ────────────────────────────────────────────────────────────
function fmtNum(v: number, decimals = 2): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(v: number, decimals = 1): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}
function signColor(v: number | null) {
  if (v === null) return '';
  return v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';
}

// ── Mode definitions ──────────────────────────────────────────────────────
const MODE_CONFIG: {
  id: FairValueMode;
  labelEn: string;
  labelId: string;
  color: string;
  stateKey: 'fairValueStd' | 'fairValueCyc' | 'fairValueDcf' | 'fairValueDdm' | 'fairValueNav';
  emptyState: Record<string, string>;
}[] = [
  { id: 'standard', labelEn: 'Standard',    labelId: 'Standar',      color: 'bg-background text-foreground border border-border shadow-sm', stateKey: 'fairValueStd', emptyState: FAIRVALUE_STD_EMPTY },
  { id: 'cyclical', labelEn: 'Cyclical',    labelId: 'Siklus',       color: 'bg-amber-500 text-white shadow-sm',                            stateKey: 'fairValueCyc', emptyState: FAIRVALUE_CYC_EMPTY },
  { id: 'dcf',      labelEn: 'DCF',         labelId: 'DCF',          color: 'bg-emerald-600 text-white shadow-sm',                          stateKey: 'fairValueDcf', emptyState: FAIRVALUE_DCF_EMPTY },
  { id: 'ddm',      labelEn: 'DDM',         labelId: 'DDM',          color: 'bg-violet-600 text-white shadow-sm',                           stateKey: 'fairValueDdm', emptyState: FAIRVALUE_DDM_EMPTY },
  { id: 'nav',      labelEn: 'Asset-Based', labelId: 'Berbasis Aset',color: 'bg-sky-600 text-white shadow-sm',                              stateKey: 'fairValueNav', emptyState: FAIRVALUE_NAV_EMPTY },
];

// ── Result row component ──────────────────────────────────────────────────
function ResultRow({
  label, sub, value, highlight, positive, negative,
}: {
  label: string; sub?: string; value: string;
  highlight?: boolean; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3.5', highlight && 'bg-primary/5 dark:bg-primary/10')}>
      <div className="flex-1 min-w-0 pr-3">
        <p className={cn('text-sm font-semibold text-foreground', highlight && 'font-bold')}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>}
      </div>
      <span className={cn(
        'shrink-0 tabular-nums font-bold',
        highlight ? 'text-lg text-primary' : 'text-sm text-foreground',
        positive && 'text-emerald-600 dark:text-emerald-400',
        negative && 'text-rose-500 dark:text-rose-400',
      )}>
        {value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function FairValueCalculator() {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  const { state, fairValueMode: mode, setFairValueMode: setMode, setCalc, clearAll } = useCalculatorState();

  const cfg = MODE_CONFIG.find(m => m.id === mode)!;
  const vals = state[cfg.stateKey];
  const setVals = (v: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) =>
    setCalc(cfg.stateKey, typeof v === 'function' ? v(vals) : v);

  const n = (k: string) => parseFloat(vals[k] || '0') || 0;
  const filled = (k: string) => (vals[k] ?? '').trim() !== '';

  const toggleSign = (id: string) => {
    setVals(prev => {
      const cur = prev[id];
      if (!cur || cur === '0') return prev;
      const num = parseFloat(cur);
      if (isNaN(num)) return prev;
      return { ...prev, [id]: String(-num) };
    });
  };

  const catT = t.categories['fair-value' as keyof typeof t.categories] as any;

  // ── Input definitions per mode ────────────────────────────────────────
  type InputDef = { id: string; en: string; id_: string; subtitleEn: string; subtitleId: string; };

  const stdInputs: InputDef[] = [
    { id: 'currentEps',        en: 'Current EPS (Annualized)',      id_: 'EPS Saat Ini (Tahunan)',             subtitleEn: 'Earnings per share — trailing 12 months',               subtitleId: 'Laba per saham — 12 bulan terakhir' },
    { id: 'totalEquity',       en: 'Total Equity',                  id_: 'Total Ekuitas',                     subtitleEn: "Total shareholders' equity from the balance sheet",      subtitleId: 'Total ekuitas pemegang saham dari neraca' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',            id_: 'Jumlah Saham Beredar',               subtitleEn: 'Total issued shares currently held by investors',         subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'growthRate',        en: 'EPS Growth Rate — CAGR (%)',    id_: 'Pertumbuhan EPS — CAGR (%)',         subtitleEn: 'Expected annual EPS growth over 10 years',               subtitleId: 'Proyeksi pertumbuhan EPS tahunan selama 10 tahun' },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)', id_: 'Tingkat Diskonto / Inflasi (%)',     subtitleEn: 'Required return used to discount future earnings',        subtitleId: 'Tingkat imbal hasil untuk mendiskontokan laba masa depan' },
    { id: 'currentPrice',      en: 'Current Stock Price',           id_: 'Harga Saham Saat Ini',               subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety', subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const cycInputs: InputDef[] = [
    { id: 'normalizedEps',     en: 'Normalized EPS (5–7 yr avg)',      id_: 'EPS Dinormalisasi (rata-rata 5–7 thn)',   subtitleEn: 'Average EPS over a full business cycle',             subtitleId: 'Rata-rata EPS selama satu siklus bisnis' },
    { id: 'totalEquity',       en: 'Total Equity',                     id_: 'Total Ekuitas',                          subtitleEn: "Total shareholders' equity from the balance sheet", subtitleId: 'Total ekuitas pemegang saham dari neraca' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',               id_: 'Jumlah Saham Beredar',                   subtitleEn: 'Total issued shares currently held by investors',    subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'shortTermCagr',     en: 'Short-Term CAGR — Yr 1–5 (%)',    id_: 'CAGR Jangka Pendek — Thn 1–5 (%)',       subtitleEn: 'EPS growth rate for the first 5 years',             subtitleId: 'Tingkat pertumbuhan EPS untuk 5 tahun pertama' },
    { id: 'longTermCagr',      en: 'Long-Term CAGR — Yr 6–10 (%)',    id_: 'CAGR Jangka Panjang — Thn 6–10 (%)',     subtitleEn: 'EPS growth rate for years 6 to 10',                 subtitleId: 'Tingkat pertumbuhan EPS untuk tahun 6 hingga 10' },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)',    id_: 'Tingkat Diskonto / Inflasi (%)',          subtitleEn: 'Required return used to discount future earnings',   subtitleId: 'Tingkat imbal hasil untuk mendiskontokan laba masa depan' },
    { id: 'currentPrice',      en: 'Current Stock Price',              id_: 'Harga Saham Saat Ini',                   subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety', subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const dcfInputs: InputDef[] = [
    { id: 'freeCashFlow',      en: 'Free Cash Flow (Annual)',          id_: 'Arus Kas Bebas (Tahunan)',               subtitleEn: 'Latest annual FCF (Operating CF – CapEx)',          subtitleId: 'FCF tahunan terbaru (Arus Kas Operasi – CapEx)' },
    { id: 'fcfGrowthRate',     en: 'FCF Growth Rate — Yr 1–5 (%)',    id_: 'Pertumbuhan FCF — Thn 1–5 (%)',          subtitleEn: 'Expected FCF growth for the first 5 years',         subtitleId: 'Proyeksi pertumbuhan FCF untuk 5 tahun pertama' },
    { id: 'terminalGrowthRate',en: 'Terminal Growth Rate (%)',         id_: 'Tingkat Pertumbuhan Terminal (%)',        subtitleEn: 'Perpetual growth rate after year 5 (must be < WACC)', subtitleId: 'Tingkat pertumbuhan abadi setelah tahun 5 (harus < WACC)' },
    { id: 'discountRate',      en: 'WACC / Discount Rate (%)',         id_: 'WACC / Tingkat Diskonto (%)',             subtitleEn: 'Weighted average cost of capital',                  subtitleId: 'Biaya modal rata-rata tertimbang' },
    { id: 'netDebt',           en: 'Net Debt',                         id_: 'Utang Bersih',                           subtitleEn: 'Total Debt – Cash (optional, default 0)',           subtitleId: 'Total Utang – Kas (opsional, default 0)' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',               id_: 'Jumlah Saham Beredar',                   subtitleEn: 'Total issued shares currently held by investors',    subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'currentPrice',      en: 'Current Stock Price',              id_: 'Harga Saham Saat Ini',                   subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety', subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const ddmInputs: InputDef[] = [
    { id: 'dividendPerShare',  en: 'Annual Dividend Per Share',        id_: 'Dividen Tahunan Per Saham',              subtitleEn: 'Most recent full-year dividend paid per share',      subtitleId: 'Dividen per saham untuk tahun penuh terakhir' },
    { id: 'dividendGrowthRate',en: 'Dividend Growth Rate (%)',         id_: 'Tingkat Pertumbuhan Dividen (%)',         subtitleEn: 'Expected long-term annual dividend growth rate',     subtitleId: 'Proyeksi tingkat pertumbuhan dividen jangka panjang' },
    { id: 'requiredReturn',    en: 'Required Return (%)',              id_: 'Imbal Hasil yang Diharapkan (%)',         subtitleEn: 'Minimum return you require (must exceed growth rate)', subtitleId: 'Imbal hasil minimum yang diharapkan (harus melebihi pertumbuhan)' },
    { id: 'currentPrice',      en: 'Current Stock Price',              id_: 'Harga Saham Saat Ini',                   subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety', subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const navInputs: InputDef[] = [
    { id: 'totalAssets',       en: 'Total Assets',                     id_: 'Total Aset',                             subtitleEn: 'Total assets from the balance sheet',               subtitleId: 'Total aset dari neraca' },
    { id: 'totalLiabilities',  en: 'Total Liabilities',                id_: 'Total Liabilitas',                       subtitleEn: 'Total liabilities from the balance sheet',          subtitleId: 'Total liabilitas dari neraca' },
    { id: 'intangibles',       en: 'Intangibles / Goodwill',           id_: 'Aset Tidak Berwujud / Goodwill',         subtitleEn: 'Optional — deducted for conservative NAV',          subtitleId: 'Opsional — dikurangi untuk NAV konservatif' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',               id_: 'Jumlah Saham Beredar',                   subtitleEn: 'Total issued shares currently held by investors',    subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'currentPrice',      en: 'Current Stock Price',              id_: 'Harga Saham Saat Ini',                   subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety', subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const inputsByMode: Record<FairValueMode, InputDef[]> = {
    standard: stdInputs, cyclical: cycInputs, dcf: dcfInputs, ddm: ddmInputs, nav: navInputs,
  };
  const inputs = inputsByMode[mode];

  // ── Validation gates ──────────────────────────────────────────────────
  const requiredFilled: boolean = (() => {
    switch (mode) {
      case 'standard':
        return filled('currentEps') && filled('totalEquity') && filled('sharesOutstanding') &&
               filled('growthRate') && filled('inflationRate') &&
               n('inflationRate') > 0 && n('sharesOutstanding') > 0;
      case 'cyclical':
        return filled('normalizedEps') && filled('totalEquity') && filled('sharesOutstanding') &&
               filled('shortTermCagr') && filled('longTermCagr') && filled('inflationRate') &&
               n('inflationRate') > 0 && n('sharesOutstanding') > 0;
      case 'dcf':
        return filled('freeCashFlow') && filled('fcfGrowthRate') && filled('terminalGrowthRate') &&
               filled('discountRate') && filled('sharesOutstanding') &&
               n('discountRate') > n('terminalGrowthRate') && n('sharesOutstanding') > 0;
      case 'ddm':
        return filled('dividendPerShare') && filled('dividendGrowthRate') && filled('requiredReturn') &&
               n('dividendPerShare') > 0 && n('requiredReturn') > n('dividendGrowthRate');
      case 'nav':
        return filled('totalAssets') && filled('totalLiabilities') && filled('sharesOutstanding') &&
               n('sharesOutstanding') > 0;
    }
  })();

  const hasPriceInput = filled('currentPrice') && n('currentPrice') > 0;

  // ── Computations ──────────────────────────────────────────────────────
  type CalcResult = {
    rows: { label: string; sub?: string; value: string; highlight?: boolean; positive?: boolean; negative?: boolean }[];
    intrinsic: number;
    upside: number | null;
    mos: number | null;
  };

  const compute = (): CalcResult => {
    const price = n('currentPrice');

    const upsideFromIntrinsic = (intrinsic: number) => ({
      upside: hasPriceInput ? ((intrinsic - price) / price) * 100 : null,
      mos:    hasPriceInput && intrinsic !== 0 ? ((intrinsic - price) / intrinsic) * 100 : null,
    });

    if (mode === 'standard') {
      const eps   = n('currentEps');
      const bvps  = n('totalEquity') / n('sharesOutstanding');
      const g     = n('growthRate') / 100;
      const r     = n('inflationRate') / 100;
      let totalEps = 0;
      for (let i = 1; i <= 10; i++) totalEps += eps * Math.pow(1 + g, i);
      const discountedEps = totalEps / Math.pow(1 + r, 10);
      const intrinsic     = (totalEps + bvps) / Math.pow(1 + r, 10);
      const { upside, mos } = upsideFromIntrinsic(intrinsic);
      return {
        intrinsic, upside, mos,
        rows: [
          { label: L('Book Value / Share', 'Nilai Buku / Saham'),     sub: L('Total Equity ÷ Shares Outstanding', 'Total Ekuitas ÷ Saham Beredar'),            value: fmtNum(bvps) },
          { label: L('Total EPS (10 Years)', 'Total EPS (10 Tahun)'), sub: L('Cumulative projected EPS over 10 years', 'Akumulasi proyeksi EPS 10 tahun'),      value: fmtNum(totalEps) },
          { label: L('Discounted Total EPS', 'Total EPS Terdiskonto'), sub: L(`Discounted at ${fmtNum(n('inflationRate'), 1)}% over 10 yrs`, `Didiskontokan ${fmtNum(n('inflationRate'), 1)}% selama 10 thn`), value: fmtNum(discountedEps) },
          { label: L('Intrinsic Value', 'Nilai Intrinsik'),            sub: L('Inflation-adjusted fair value per share', 'Nilai wajar per saham disesuaikan inflasi'), value: fmtNum(intrinsic), highlight: true },
        ],
      };
    }

    if (mode === 'cyclical') {
      const eps  = n('normalizedEps');
      const bvps = n('totalEquity') / n('sharesOutstanding');
      const g1   = n('shortTermCagr') / 100;
      const g2   = n('longTermCagr') / 100;
      const r    = n('inflationRate') / 100;
      let totalEps = 0;
      for (let i = 1; i <= 5; i++) totalEps += eps * Math.pow(1 + g1, i);
      const eps5 = eps * Math.pow(1 + g1, 5);
      for (let i = 1; i <= 5; i++) totalEps += eps5 * Math.pow(1 + g2, i);
      const discountedEps = totalEps / Math.pow(1 + r, 10);
      const intrinsic     = (totalEps + bvps) / Math.pow(1 + r, 10);
      const { upside, mos } = upsideFromIntrinsic(intrinsic);
      return {
        intrinsic, upside, mos,
        rows: [
          { label: L('Book Value / Share', 'Nilai Buku / Saham'),          sub: L('Total Equity ÷ Shares Outstanding', 'Total Ekuitas ÷ Saham Beredar'),          value: fmtNum(bvps) },
          { label: L('Total EPS (10 Years)', 'Total EPS (10 Tahun)'),      sub: L('Two-stage cumulative EPS (5+5 years)', 'EPS kumulatif dua tahap (5+5 tahun)'),  value: fmtNum(totalEps) },
          { label: L('Discounted Total EPS', 'Total EPS Terdiskonto'),     sub: L(`Discounted at ${fmtNum(n('inflationRate'), 1)}% over 10 yrs`, `Didiskontokan ${fmtNum(n('inflationRate'), 1)}% selama 10 thn`), value: fmtNum(discountedEps) },
          { label: L('Intrinsic Value', 'Nilai Intrinsik'),                 sub: L('Inflation-adjusted fair value per share', 'Nilai wajar per saham disesuaikan inflasi'), value: fmtNum(intrinsic), highlight: true },
        ],
      };
    }

    if (mode === 'dcf') {
      const fcf  = n('freeCashFlow');
      const g    = n('fcfGrowthRate') / 100;
      const gT   = n('terminalGrowthRate') / 100;
      const r    = n('discountRate') / 100;
      const nd   = n('netDebt');
      const sh   = n('sharesOutstanding');
      let pvFcf  = 0;
      let fcfYear = fcf;
      for (let i = 1; i <= 5; i++) {
        fcfYear = fcf * Math.pow(1 + g, i);
        pvFcf  += fcfYear / Math.pow(1 + r, i);
      }
      const fcf5        = fcf * Math.pow(1 + g, 5);
      const terminalVal = fcf5 * (1 + gT) / (r - gT);
      const pvTerminal  = terminalVal / Math.pow(1 + r, 5);
      const enterpriseVal = pvFcf + pvTerminal;
      const equityVal   = enterpriseVal - nd;
      const intrinsic   = equityVal / sh;
      const { upside, mos } = upsideFromIntrinsic(intrinsic);
      return {
        intrinsic, upside, mos,
        rows: [
          { label: L('PV of FCF (Yr 1–5)', 'PV FCF (Thn 1–5)'),           sub: L('Sum of discounted FCF for years 1–5', 'Jumlah FCF terdiskonto tahun 1–5'),        value: fmtNum(pvFcf) },
          { label: L('Terminal Value (PV)', 'Nilai Terminal (PV)'),         sub: L('Gordon Growth TV discounted to present', 'Nilai Terminal Gordon Growth didiskontokan'), value: fmtNum(pvTerminal) },
          { label: L('Enterprise Value', 'Nilai Perusahaan'),               sub: L('PV FCF + PV Terminal Value', 'PV FCF + Nilai Terminal PV'),                       value: fmtNum(enterpriseVal) },
          { label: L('Equity Value', 'Nilai Ekuitas'),                      sub: L('Enterprise Value – Net Debt', 'Nilai Perusahaan – Utang Bersih'),                  value: fmtNum(equityVal) },
          { label: L('Intrinsic Value / Share', 'Nilai Intrinsik / Saham'), sub: L('Equity Value ÷ Shares Outstanding', 'Nilai Ekuitas ÷ Saham Beredar'),             value: fmtNum(intrinsic), highlight: true },
        ],
      };
    }

    if (mode === 'ddm') {
      const dps = n('dividendPerShare');
      const g   = n('dividendGrowthRate') / 100;
      const r   = n('requiredReturn') / 100;
      const intrinsic = dps * (1 + g) / (r - g);
      const { upside, mos } = upsideFromIntrinsic(intrinsic);
      return {
        intrinsic, upside, mos,
        rows: [
          { label: L('Next-Year Dividend / Share', 'Dividen Tahun Depan / Saham'), sub: `DPS × (1 + g) = ${fmtNum(dps)} × (1 + ${n('dividendGrowthRate').toFixed(1)}%)`, value: fmtNum(dps * (1 + g)) },
          { label: L('Spread (r − g)', 'Selisih (r − g)'),                          sub: L('Required return minus growth rate', 'Imbal hasil dikurangi tingkat pertumbuhan'),  value: `${fmtNum((r - g) * 100, 2)}%` },
          { label: L('Intrinsic Value', 'Nilai Intrinsik'),                          sub: L('D₁ ÷ (Required Return − Growth)', 'D₁ ÷ (Imbal Hasil − Pertumbuhan)'),           value: fmtNum(intrinsic), highlight: true },
        ],
      };
    }

    // nav
    const assets = n('totalAssets');
    const liabs  = n('totalLiabilities');
    const intang = n('intangibles');
    const sh     = n('sharesOutstanding');
    const nav    = assets - liabs - intang;
    const intrinsic = nav / sh;
    const { upside, mos } = upsideFromIntrinsic(intrinsic);
    return {
      intrinsic, upside, mos,
      rows: [
        { label: L('Total Assets', 'Total Aset'),                              sub: L('From the balance sheet', 'Dari neraca'),                                value: fmtNum(assets) },
        { label: L('Total Liabilities', 'Total Liabilitas'),                   sub: L('From the balance sheet', 'Dari neraca'),                                value: fmtNum(liabs) },
        { label: L('Intangibles / Goodwill', 'Aset Tak Berwujud / Goodwill'), sub: L('Deducted for conservative NAV', 'Dikurangi untuk NAV konservatif'),     value: fmtNum(intang) },
        { label: L('Net Asset Value (NAV)', 'Nilai Aset Bersih (NAV)'),        sub: L('Assets – Liabilities – Intangibles', 'Aset – Liabilitas – Tak Berwujud'), value: fmtNum(nav) },
        { label: L('NAV / Share', 'NAV / Saham'),                              sub: L('Net Asset Value ÷ Shares Outstanding', 'NAV ÷ Saham Beredar'),          value: fmtNum(intrinsic), highlight: true },
      ],
    };
  };

  const calc = requiredFilled ? compute() : null;

  // ── "How it works" formulas ──────────────────────────────────────────
  const formulasByMode: Record<FairValueMode, { label: string; eq: string }[]> = {
    standard: [
      { label: L('Book Value / Share', 'Nilai Buku / Saham'),     eq: 'Total Equity ÷ Shares Outstanding' },
      { label: L('Total EPS (10 yrs)', 'Total EPS (10 thn)'),     eq: 'Σ EPS × (1+CAGR)ⁱ  for i = 1 → 10' },
      { label: L('Intrinsic Value', 'Nilai Intrinsik'),            eq: '(Total EPS + BV/Share) ÷ (1+Inflation)¹⁰' },
    ],
    cyclical: [
      { label: L('Book Value / Share', 'Nilai Buku / Saham'),     eq: 'Total Equity ÷ Shares Outstanding' },
      { label: L('Stage 1 (Yr 1–5)', 'Tahap 1 (Thn 1–5)'),       eq: 'Σ NormEPS × (1+SCAGR)ⁱ  for i = 1 → 5' },
      { label: L('Stage 2 (Yr 6–10)', 'Tahap 2 (Thn 6–10)'),     eq: 'Σ EPS₅ × (1+LCAGR)ⁱ  for i = 1 → 5' },
      { label: L('Intrinsic Value', 'Nilai Intrinsik'),            eq: '(Stage 1 + Stage 2 + BV/Share) ÷ (1+Inflation)¹⁰' },
    ],
    dcf: [
      { label: L('PV of FCF (Yr 1–5)', 'PV FCF (Thn 1–5)'),      eq: 'Σ FCF × (1+g)ⁱ ÷ (1+WACC)ⁱ  for i = 1 → 5' },
      { label: L('Terminal Value', 'Nilai Terminal'),              eq: 'FCF₅ × (1+g_terminal) ÷ (WACC − g_terminal)' },
      { label: L('Enterprise Value', 'Nilai Perusahaan'),          eq: 'PV of FCF + PV of Terminal Value' },
      { label: L('Equity Value', 'Nilai Ekuitas'),                 eq: 'Enterprise Value − Net Debt' },
      { label: L('Intrinsic Value / Share', 'Nilai Intrinsik / Saham'), eq: 'Equity Value ÷ Shares Outstanding' },
    ],
    ddm: [
      { label: L('Next-Year Dividend', 'Dividen Tahun Depan'),    eq: 'DPS × (1 + Dividend Growth Rate)' },
      { label: L('Intrinsic Value', 'Nilai Intrinsik'),            eq: 'D₁ ÷ (Required Return − Dividend Growth)' },
      { label: L('Valid When', 'Berlaku Jika'),                    eq: 'Required Return > Dividend Growth Rate' },
    ],
    nav: [
      { label: L('Net Asset Value', 'Nilai Aset Bersih'),          eq: 'Total Assets − Total Liabilities − Intangibles' },
      { label: L('NAV / Share', 'NAV / Saham'),                    eq: 'NAV ÷ Shares Outstanding' },
    ],
  };

  // ── Guard / hints per mode ────────────────────────────────────────────
  const guardHint: Record<FairValueMode, string> = {
    standard: L('Enter EPS, Equity, Shares, Growth Rate, and Discount Rate to see results.', 'Masukkan EPS, Ekuitas, Saham, Pertumbuhan, dan Tingkat Diskonto untuk melihat hasil.'),
    cyclical: L('Enter Normalized EPS, Equity, Shares, both CAGRs, and Discount Rate to see results.', 'Masukkan EPS Dinormalisasi, Ekuitas, Saham, kedua CAGR, dan Tingkat Diskonto untuk melihat hasil.'),
    dcf:      L('Enter FCF, growth rates, WACC, and shares. WACC must exceed terminal growth rate.', 'Masukkan FCF, tingkat pertumbuhan, WACC, dan saham. WACC harus melebihi tingkat pertumbuhan terminal.'),
    ddm:      L('Enter Dividend/Share, Growth Rate, and Required Return. Required return must exceed growth rate.', 'Masukkan Dividen/Saham, Pertumbuhan, dan Imbal Hasil. Imbal hasil harus melebihi pertumbuhan.'),
    nav:      L('Enter Total Assets, Total Liabilities, and Shares Outstanding.', 'Masukkan Total Aset, Total Liabilitas, dan Saham Beredar.'),
  };

  // ── Mode description ──────────────────────────────────────────────────
  const modeDesc: Record<FairValueMode, string> = {
    standard: L('EPS-Based Discounted Cash Flow', 'DCF Berbasis EPS'),
    cyclical: L('Cyclical · Normalized EPS DCF', 'Siklus · DCF EPS Dinormalisasi'),
    dcf:      L('Free Cash Flow DCF with Terminal Value', 'DCF Arus Kas Bebas dengan Nilai Terminal'),
    ddm:      L('Dividend Discount Model — Gordon Growth', 'Model Diskon Dividen — Gordon Growth'),
    nav:      L('Asset-Based · Net Asset Value per Share', 'Berbasis Aset · Nilai Aset Bersih per Saham'),
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Fair Value'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{modeDesc[mode]}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── RESULTS column ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {L('Results', 'Hasil')}
          </p>

          {!requiredFilled ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-semibold text-foreground/60">
                  {L('Fill in all required inputs', 'Isi semua input yang diperlukan')}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{guardHint[mode]}</p>
              </div>
            </motion.div>
          ) : calc && (
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">

              {/* Main results card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {calc.rows.map((row, i) => (
                  <div key={i}>
                    {i > 0 && !calc.rows[i - 1].highlight && <div className="border-t border-border/60 mx-4" />}
                    <ResultRow {...row} />
                  </div>
                ))}

                {/* Upside / Downside */}
                {calc.upside !== null && (
                  <>
                    <div className="border-t border-border/60 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {L('Upside / Downside', 'Potensi Naik / Turun')}
                      </p>
                      <div className={cn('flex items-center gap-1 shrink-0 ml-4', signColor(calc.upside))}>
                        {calc.upside >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-bold tabular-nums">{fmtPct(calc.upside)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Margin of Safety */}
                {calc.mos !== null && (
                  <>
                    <div className="border-t border-border/60 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">Margin of Safety</p>
                      <span className={cn('text-sm font-bold tabular-nums shrink-0 ml-4', signColor(calc.mos))}>
                        {fmtPct(calc.mos)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* How it works */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    {L('How it works', 'Cara kerjanya')}
                  </p>
                </div>
                <div className="divide-y divide-border/40">
                  {formulasByMode[mode].map((f, i) => (
                    <div key={f.label} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground/80">{f.label}</p>
                        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{f.eq}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── INPUTS column ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {L('Inputs', 'Input')}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVals({ ...cfg.emptyState })}
                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                {L('Clear', 'Hapus')}
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                {L('Clear All', 'Hapus Semua')}
              </button>
            </div>
          </div>

          {/* ── Mode toggle — 5 tabs ── */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-muted/40 p-1">
            {MODE_CONFIG.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'flex-1 min-w-[calc(33%-4px)] py-2 px-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap',
                  mode === m.id ? m.color : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {isEn ? m.labelEn : m.labelId}
              </button>
            ))}
          </div>

          {/* ── Context notices ── */}
          {mode === 'cyclical' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
                {L(
                  'Cyclical mode uses Normalized EPS — the average EPS over a full business cycle (5–7 years) — to avoid overvaluing at peak earnings or undervaluing at trough earnings.',
                  'Mode Siklus menggunakan EPS Dinormalisasi — rata-rata EPS selama satu siklus bisnis (5–7 tahun) — untuk menghindari penilaian terlalu tinggi saat laba puncak atau terlalu rendah saat laba trough.',
                )}
              </p>
            </motion.div>
          )}

          {mode === 'dcf' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                {L(
                  'FCF-based DCF projects Free Cash Flow for 5 years, then applies a Terminal Value using the Gordon Growth Model. WACC must exceed the terminal growth rate.',
                  'DCF berbasis FCF memproyeksikan Arus Kas Bebas selama 5 tahun, lalu menerapkan Nilai Terminal menggunakan Gordon Growth Model. WACC harus melebihi tingkat pertumbuhan terminal.',
                )}
              </p>
            </motion.div>
          )}

          {mode === 'ddm' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 leading-relaxed">
                {L(
                  'DDM (Gordon Growth Model) values a stock based on its future dividends, discounted to present value. Best suited for stable, dividend-paying companies. Required return must exceed dividend growth rate.',
                  'DDM (Gordon Growth Model) menilai saham berdasarkan dividen masa depan yang didiskontokan ke nilai sekarang. Paling cocok untuk perusahaan stabil yang membayar dividen. Imbal hasil harus melebihi pertumbuhan dividen.',
                )}
              </p>
            </motion.div>
          )}

          {mode === 'nav' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 leading-relaxed">
                {L(
                  'Asset-Based Valuation calculates Net Asset Value (NAV) by subtracting total liabilities and intangibles from total assets, then divides by shares outstanding. Best for capital-intensive or asset-heavy companies.',
                  'Valuasi Berbasis Aset menghitung Nilai Aset Bersih (NAV) dengan mengurangi total liabilitas dan aset tak berwujud dari total aset, lalu dibagi saham beredar. Paling cocok untuk perusahaan padat modal atau aset.',
                )}
              </p>
            </motion.div>
          )}

          {/* ── Input fields ── */}
          <div className="space-y-3">
            {inputs.map((inp, i) => {
              const label    = isEn ? inp.en   : inp.id_;
              const subtitle = isEn ? inp.subtitleEn : inp.subtitleId;
              return (
                <motion.div
                  key={`${mode}-${inp.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl px-4 py-3.5"
                >
                  <p className="font-bold text-sm text-foreground mb-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground mb-2.5">{subtitle}</p>
                  <div className="flex items-center rounded-xl overflow-hidden border border-border bg-muted/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <button
                      onClick={() => toggleSign(inp.id)}
                      className="px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border-r border-border shrink-0 select-none"
                    >
                      +/−
                    </button>
                    <NumericInput
                      value={vals[inp.id] ?? ''}
                      onChange={raw => setVals(prev => ({ ...prev, [inp.id]: raw }))}
                      placeholder="0"
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none min-w-0"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
