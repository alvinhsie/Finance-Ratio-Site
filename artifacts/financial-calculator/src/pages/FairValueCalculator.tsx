import { useCalculatorState } from '@/lib/CalculatorStateContext';
import { FAIRVALUE_STD_EMPTY, FAIRVALUE_CYC_EMPTY, FAIRVALUE_DCF_EMPTY } from '@/lib/calculatorDefaults';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BookOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';

function fmtNum(v: number, decimals = 2): string {
  return v.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(v: number, decimals = 1): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function FairValueCalculator() {
  const { language, t } = useLanguage();
  const { state, fairValueMode: mode, setFairValueMode: setMode, setCalc, clearAll } = useCalculatorState();

  const stdVals = state.fairValueStd;
  const cycVals = state.fairValueCyc;
  const dcfVals = state.fairValueDcf;

  const setStdVals = (v: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) =>
    setCalc('fairValueStd', typeof v === 'function' ? v(state.fairValueStd) : v);
  const setCycVals = (v: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) =>
    setCalc('fairValueCyc', typeof v === 'function' ? v(state.fairValueCyc) : v);
  const setDcfVals = (v: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) =>
    setCalc('fairValueDcf', typeof v === 'function' ? v(state.fairValueDcf) : v);

  const vals    = mode === 'standard' ? stdVals : mode === 'cyclical' ? cycVals : dcfVals;
  const setVals = mode === 'standard' ? setStdVals : mode === 'cyclical' ? setCycVals : setDcfVals;

  const n = (k: string) => parseFloat(vals[k] || '0') || 0;
  const isFilled = (k: string) => vals[k]?.trim() !== '';

  // ── Required-fields gate ─────────────────────────────────────────
  const requiredFilled = mode === 'standard'
    ? isFilled('currentEps') && isFilled('totalEquity') && isFilled('sharesOutstanding') &&
      isFilled('growthRate') && isFilled('inflationRate') &&
      n('inflationRate') > 0 && n('sharesOutstanding') > 0
    : mode === 'cyclical'
    ? isFilled('normalizedEps') && isFilled('totalEquity') && isFilled('sharesOutstanding') &&
      isFilled('shortTermCagr') && isFilled('longTermCagr') && isFilled('inflationRate') &&
      n('inflationRate') > 0 && n('sharesOutstanding') > 0
    : isFilled('freeCashFlow') && isFilled('sharesOutstanding') &&
      isFilled('growthRate') && isFilled('discountRate') && isFilled('terminalGrowthRate') &&
      n('sharesOutstanding') > 0 && n('discountRate') > n('terminalGrowthRate');

  const hasPriceInput = isFilled('currentPrice') && n('currentPrice') > 0;

  // ── Computation ──────────────────────────────────────────────────
  type CalcResult =
    | { kind: 'eps'; bvps: number; totalEps: number; discountedEps: number; intrinsic: number; upside: number | null; mos: number | null }
    | { kind: 'dcf'; fcfPS: number; pvFcfs: number; pvTV: number; evPerShare: number; netDebtPS: number; intrinsic: number; upside: number | null; mos: number | null };

  const compute = (): CalcResult => {
    if (mode === 'dcf') {
      const fcf    = n('freeCashFlow');
      const shares = n('sharesOutstanding');
      const g      = n('growthRate') / 100;
      const r      = n('discountRate') / 100;
      const gt     = n('terminalGrowthRate') / 100;
      const netDebt = isFilled('netDebt') ? n('netDebt') : 0;
      const price  = n('currentPrice');

      const fcfPS = fcf / shares;
      let pvFcfs = 0;
      let fcf10 = fcfPS;
      for (let i = 1; i <= 10; i++) {
        const fcfI = fcfPS * Math.pow(1 + g, i);
        pvFcfs += fcfI / Math.pow(1 + r, i);
        if (i === 10) fcf10 = fcfI;
      }
      const tv      = (fcf10 * (1 + gt)) / (r - gt);
      const pvTV    = tv / Math.pow(1 + r, 10);
      const evPerShare   = pvFcfs + pvTV;
      const netDebtPS    = netDebt / shares;
      const intrinsic    = evPerShare - netDebtPS;
      const upside = hasPriceInput && price > 0 ? ((intrinsic - price) / price) * 100 : null;
      const mos    = hasPriceInput && intrinsic !== 0 ? ((intrinsic - price) / intrinsic) * 100 : null;
      return { kind: 'dcf', fcfPS, pvFcfs, pvTV, evPerShare, netDebtPS, intrinsic, upside, mos };
    }

    // EPS-based (standard / cyclical)
    const bvps  = n('totalEquity') / n('sharesOutstanding');
    const r     = n('inflationRate') / 100;
    const price = n('currentPrice');
    let totalEps = 0;
    if (mode === 'standard') {
      const eps = n('currentEps');
      const g   = n('growthRate') / 100;
      for (let i = 1; i <= 10; i++) totalEps += eps * Math.pow(1 + g, i);
    } else {
      const eps = n('normalizedEps');
      const g1  = n('shortTermCagr') / 100;
      const g2  = n('longTermCagr')  / 100;
      for (let i = 1; i <= 5; i++) totalEps += eps * Math.pow(1 + g1, i);
      const eps5 = eps * Math.pow(1 + g1, 5);
      for (let i = 1; i <= 5; i++) totalEps += eps5 * Math.pow(1 + g2, i);
    }
    const discountFactor = Math.pow(1 + r, 10);
    const discountedEps  = totalEps / discountFactor;
    const intrinsic      = (totalEps + bvps) / discountFactor;
    const upside = hasPriceInput && price > 0 ? ((intrinsic - price) / price) * 100 : null;
    const mos    = hasPriceInput && intrinsic !== 0 ? ((intrinsic - price) / intrinsic) * 100 : null;
    return { kind: 'eps', bvps, totalEps, discountedEps, intrinsic, upside, mos };
  };

  const calc = requiredFilled ? compute() : null;

  const toggleSign = (id: string) => {
    setVals(prev => {
      const cur = prev[id];
      if (cur === '' || cur === '0') return prev;
      const num = parseFloat(cur);
      if (isNaN(num)) return prev;
      return { ...prev, [id]: String(-num) };
    });
  };

  const catT = t.categories['fair-value' as keyof typeof t.categories] as any;

  const signColor = (v: number | null) => {
    if (v === null) return '';
    return v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';
  };

  // ── Input definitions ────────────────────────────────────────────
  const stdInputs = [
    { id: 'currentEps',        en: 'Current EPS (Annualized)',      id_: 'EPS Saat Ini (Tahunan)',          subtitleEn: 'Earnings per share for the trailing 12 months',             subtitleId: 'Laba per saham untuk 12 bulan terakhir' },
    { id: 'totalEquity',       en: 'Total Equity',                  id_: 'Total Ekuitas',                  subtitleEn: "Total shareholders' equity from the balance sheet",          subtitleId: 'Total ekuitas pemegang saham dari neraca' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',            id_: 'Jumlah Saham Beredar',            subtitleEn: 'Total issued shares currently held by investors',            subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'growthRate',        en: 'EPS Growth Rate — CAGR (%)',    id_: 'Pertumbuhan EPS — CAGR (%)',      subtitleEn: 'Expected annual EPS growth rate over 10 years',              subtitleId: 'Proyeksi pertumbuhan EPS tahunan selama 10 tahun' },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)', id_: 'Tingkat Diskonto / Inflasi (%)', subtitleEn: 'Required return rate used to discount future earnings',      subtitleId: 'Tingkat imbal hasil untuk mendiskontokan laba masa depan' },
    { id: 'currentPrice',      en: 'Current Stock Price',           id_: 'Harga Saham Saat Ini',           subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety',  subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const cycInputs = [
    { id: 'normalizedEps',     en: 'Normalized EPS (5–7 yr avg)',        id_: 'EPS Dinormalisasi (rata-rata 5–7 thn)', subtitleEn: 'Average EPS over a full business cycle to smooth peaks & troughs', subtitleId: 'Rata-rata EPS selama satu siklus bisnis untuk meratakan puncak dan lembah' },
    { id: 'totalEquity',       en: 'Total Equity',                       id_: 'Total Ekuitas',                        subtitleEn: "Total shareholders' equity from the balance sheet",              subtitleId: 'Total ekuitas pemegang saham dari neraca' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',                 id_: 'Jumlah Saham Beredar',                 subtitleEn: 'Total issued shares currently held by investors',                subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'shortTermCagr',     en: 'Short-Term CAGR — Yr 1–5 (%)',      id_: 'CAGR Jangka Pendek — Thn 1–5 (%)',     subtitleEn: 'EPS growth rate for the first 5 years',                         subtitleId: 'Tingkat pertumbuhan EPS untuk 5 tahun pertama' },
    { id: 'longTermCagr',      en: 'Long-Term CAGR — Yr 6–10 (%)',      id_: 'CAGR Jangka Panjang — Thn 6–10 (%)',   subtitleEn: 'EPS growth rate for years 6 to 10',                             subtitleId: 'Tingkat pertumbuhan EPS untuk tahun 6 hingga 10' },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)',      id_: 'Tingkat Diskonto / Inflasi (%)',        subtitleEn: 'Required return rate used to discount future earnings',          subtitleId: 'Tingkat imbal hasil untuk mendiskontokan laba masa depan' },
    { id: 'currentPrice',      en: 'Current Stock Price',                id_: 'Harga Saham Saat Ini',                 subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety',      subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const dcfInputs = [
    { id: 'freeCashFlow',       en: 'Free Cash Flow (Annual)',         id_: 'Arus Kas Bebas (Tahunan)',           subtitleEn: 'Latest annual FCF — Operating Cash Flow minus Capital Expenditures',  subtitleId: 'FCF tahunan terkini — Arus kas operasional dikurangi belanja modal' },
    { id: 'sharesOutstanding',  en: 'Shares Outstanding',              id_: 'Jumlah Saham Beredar',               subtitleEn: 'Total issued shares currently held by investors',                    subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'growthRate',         en: 'FCF Growth Rate — CAGR (%)',      id_: 'Pertumbuhan FCF — CAGR (%)',         subtitleEn: 'Expected annual FCF growth rate over the 10-year projection period',  subtitleId: 'Proyeksi pertumbuhan FCF tahunan selama periode 10 tahun' },
    { id: 'terminalGrowthRate', en: 'Terminal Growth Rate (%)',         id_: 'Tingkat Pertumbuhan Terminal (%)',   subtitleEn: 'Perpetuity growth rate after year 10 — must be less than discount rate', subtitleId: 'Tingkat pertumbuhan abadi setelah tahun ke-10 — harus lebih kecil dari tingkat diskonto' },
    { id: 'discountRate',       en: 'Discount Rate / WACC (%)',         id_: 'Tingkat Diskonto / WACC (%)',        subtitleEn: 'Weighted average cost of capital used to discount future cash flows',  subtitleId: 'Biaya modal rata-rata tertimbang untuk mendiskontokan arus kas masa depan' },
    { id: 'netDebt',            en: 'Net Debt',                         id_: 'Utang Bersih',                       subtitleEn: 'Optional — Total Debt minus Cash. Deducted from Enterprise Value',    subtitleId: 'Opsional — Total Utang dikurangi Kas. Dikurangkan dari Nilai Perusahaan' },
    { id: 'currentPrice',       en: 'Current Stock Price',              id_: 'Harga Saham Saat Ini',               subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety',           subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  const inputs = mode === 'standard' ? stdInputs : mode === 'cyclical' ? cycInputs : dcfInputs;

  // ── "How it works" formulas ──────────────────────────────────────
  const stdFormulas = [
    { label: language === 'en' ? 'Book Value / Share' : 'Nilai Buku / Saham',   eq: 'Total Equity ÷ Shares Outstanding' },
    { label: language === 'en' ? 'Total EPS (10 yrs)' : 'Total EPS (10 thn)',    eq: 'Σ EPS × (1+CAGR)ⁱ  for i = 1 → 10' },
    { label: language === 'en' ? 'Intrinsic Value'    : 'Nilai Intrinsik',       eq: '(Total EPS + BV/Share) ÷ (1+Inflation)¹⁰' },
  ];

  const cycFormulas = [
    { label: language === 'en' ? 'Book Value / Share' : 'Nilai Buku / Saham',   eq: 'Total Equity ÷ Shares Outstanding' },
    { label: language === 'en' ? 'Stage 1 (Yr 1–5)'  : 'Tahap 1 (Thn 1–5)',    eq: 'Σ NormEPS × (1+SCAGR)ⁱ  for i = 1 → 5' },
    { label: language === 'en' ? 'Stage 2 (Yr 6–10)' : 'Tahap 2 (Thn 6–10)',   eq: 'Σ EPS₅ × (1+LCAGR)ⁱ  for i = 1 → 5' },
    { label: language === 'en' ? 'Total EPS'         : 'Total EPS',             eq: 'Stage 1 + Stage 2' },
    { label: language === 'en' ? 'Intrinsic Value'   : 'Nilai Intrinsik',       eq: '(Total EPS + BV/Share) ÷ (1+Inflation)¹⁰' },
  ];

  const dcfFormulas = [
    { label: language === 'en' ? 'FCF / Share'          : 'FCF / Saham',             eq: 'Free Cash Flow ÷ Shares Outstanding' },
    { label: language === 'en' ? 'PV of FCFs (10 yrs)'  : 'PV FCF (10 thn)',         eq: 'Σ FCF/sh × (1+g)ⁱ ÷ (1+r)ⁱ  for i = 1 → 10' },
    { label: language === 'en' ? 'Terminal Value'        : 'Nilai Terminal',          eq: 'FCF₁₀ × (1+gₜ) ÷ (r − gₜ)' },
    { label: language === 'en' ? 'PV of Terminal Value'  : 'PV Nilai Terminal',       eq: 'Terminal Value ÷ (1+r)¹⁰' },
    { label: language === 'en' ? 'Intrinsic Value'       : 'Nilai Intrinsik',         eq: '(PV FCFs + PV TV) − Net Debt/Share' },
  ];

  const emptyForMode = mode === 'standard' ? FAIRVALUE_STD_EMPTY : mode === 'cyclical' ? FAIRVALUE_CYC_EMPTY : FAIRVALUE_DCF_EMPTY;

  // ── Placeholder text for empty state ────────────────────────────
  const emptyHintEn = mode === 'standard'
    ? 'Enter EPS, Equity, Shares, Growth Rate, and Discount Rate to see results.'
    : mode === 'cyclical'
    ? 'Enter Normalized EPS, Equity, Shares, both CAGRs, and Discount Rate to see results.'
    : n('discountRate') > 0 && n('terminalGrowthRate') >= n('discountRate')
    ? 'Discount Rate must be greater than Terminal Growth Rate.'
    : 'Enter FCF, Shares, Growth Rate, Terminal Rate, and Discount Rate to see results.';

  const emptyHintId = mode === 'standard'
    ? 'Masukkan EPS, Ekuitas, Saham, Pertumbuhan, dan Tingkat Diskonto untuk melihat hasil.'
    : mode === 'cyclical'
    ? 'Masukkan EPS Dinormalisasi, Ekuitas, Saham, kedua CAGR, dan Tingkat Diskonto untuk melihat hasil.'
    : n('discountRate') > 0 && n('terminalGrowthRate') >= n('discountRate')
    ? 'Tingkat Diskonto harus lebih besar dari Tingkat Pertumbuhan Terminal.'
    : 'Masukkan FCF, Saham, Pertumbuhan, Tingkat Terminal, dan Tingkat Diskonto untuk melihat hasil.';

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Fair Value'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mode === 'standard'
            ? (language === 'en' ? 'EPS-Based Discounted Cash Flow' : 'DCF Berbasis EPS')
            : mode === 'cyclical'
            ? (language === 'en' ? 'Cyclical · Normalized EPS DCF' : 'Siklus · DCF EPS Dinormalisasi')
            : (language === 'en' ? 'Free Cash Flow · Multi-Stage DCF' : 'Arus Kas Bebas · DCF Multi-Tahap')}
        </p>
      </motion.div>

      {/* ── Primary toggle: tab-style, full width, above results ── */}
      <div className="flex justify-center md:justify-start border-b border-border mb-6">
        <button
          onClick={() => { if (mode === 'dcf') setMode('standard'); }}
          className={cn(
            'px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            mode !== 'dcf'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {language === 'en' ? 'EPS-Based DCF' : 'DCF Berbasis EPS'}
        </button>
        <button
          onClick={() => setMode('dcf')}
          className={cn(
            'px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            mode === 'dcf'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {language === 'en' ? 'Free Cash Flow DCF' : 'DCF Arus Kas Bebas'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── RESULTS column ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {language === 'en' ? 'Results' : 'Hasil'}
          </p>

          {!requiredFilled ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-semibold text-foreground/60">
                  {language === 'en' ? 'Fill in all required inputs' : 'Isi semua input yang diperlukan'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {language === 'en' ? emptyHintEn : emptyHintId}
                </p>
              </div>
            </motion.div>
          ) : calc && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              {/* ── Results card ── */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">

                {calc.kind === 'eps' ? (
                  <>
                    {/* Book Value / Share */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'Book Value / Share' : 'Nilai Buku / Saham'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en' ? 'Total Equity ÷ Shares Outstanding' : 'Total Ekuitas ÷ Saham Beredar'}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.bvps)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 mx-4" />

                    {/* Total EPS */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'Total EPS (10 Years)' : 'Total EPS (10 Tahun)'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {mode === 'standard'
                            ? (language === 'en' ? 'Cumulative projected EPS over 10 years' : 'Akumulasi proyeksi EPS selama 10 tahun')
                            : (language === 'en' ? 'Two-stage cumulative EPS (5 yrs short + 5 yrs long)' : 'EPS kumulatif dua tahap (5 thn pendek + 5 thn panjang)')}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.totalEps)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 mx-4" />

                    {/* Discounted Total EPS */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'Discounted Total EPS' : 'Total EPS Terdiskonto'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en'
                            ? `Total EPS discounted by ${fmtNum(n('inflationRate'), 1)}% over 10 yrs`
                            : `Total EPS didiskontokan ${fmtNum(n('inflationRate'), 1)}% selama 10 thn`}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.discountedEps)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* FCF per Share */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'FCF / Share' : 'FCF / Saham'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en' ? 'Free Cash Flow ÷ Shares Outstanding' : 'Arus Kas Bebas ÷ Saham Beredar'}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.fcfPS)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 mx-4" />

                    {/* PV of FCFs */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'PV of FCFs (10 Years)' : 'PV FCF (10 Tahun)'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en' ? 'Sum of discounted free cash flows' : 'Jumlah arus kas bebas yang terdiskonto'}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.pvFcfs)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 mx-4" />

                    {/* PV of Terminal Value */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'PV of Terminal Value' : 'PV Nilai Terminal'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en'
                            ? `Gordon Growth at ${fmtNum(n('terminalGrowthRate'), 1)}% discounted to present`
                            : `Gordon Growth ${fmtNum(n('terminalGrowthRate'), 1)}% didiskontokan ke masa kini`}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.pvTV)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 mx-4" />

                    {/* Enterprise Value / Share */}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {language === 'en' ? 'Enterprise Value / Share' : 'Nilai Perusahaan / Saham'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {language === 'en' ? 'PV of FCFs + PV of Terminal Value' : 'PV FCF + PV Nilai Terminal'}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                        {fmtNum(calc.evPerShare)}
                      </span>
                    </div>

                    {/* Net Debt / Share — only if filled */}
                    {isFilled('netDebt') && (
                      <>
                        <div className="border-t border-border/60 mx-4" />
                        <div className="flex items-center justify-between px-4 py-3.5">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {language === 'en' ? 'Net Debt / Share' : 'Utang Bersih / Saham'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {language === 'en' ? 'Deducted from Enterprise Value' : 'Dikurangkan dari Nilai Perusahaan'}
                            </p>
                          </div>
                          <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                            {fmtNum(calc.netDebtPS)}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="border-t border-border/60 mx-4" />

                {/* Intrinsic Value — highlighted */}
                <div className="flex items-center justify-between px-4 py-4 bg-primary/5 dark:bg-primary/10">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {language === 'en' ? 'Intrinsic Value' : 'Nilai Intrinsik'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {calc.kind === 'dcf'
                        ? (language === 'en' ? 'Fair value per share (EV − Net Debt / Share)' : 'Nilai wajar per saham (EV − Utang Bersih / Saham)')
                        : (language === 'en' ? 'Inflation-adjusted fair value per share' : 'Nilai wajar per saham yang disesuaikan inflasi')}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold tabular-nums text-primary shrink-0 ml-4">
                    {fmtNum(calc.intrinsic)}
                  </span>
                </div>

                {/* Upside / Downside */}
                {calc.upside !== null && (
                  <>
                    <div className="border-t border-border/60 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Upside / Downside' : 'Potensi Naik / Turun'}
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
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Margin of Safety' : 'Margin of Safety'}
                      </p>
                      <span className={cn('text-sm font-bold tabular-nums shrink-0 ml-4', signColor(calc.mos))}>
                        {fmtPct(calc.mos)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* ── How it works ── */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    {language === 'en' ? 'How it works' : 'Cara kerjanya'}
                  </p>
                </div>
                <div className="divide-y divide-border/40">
                  {(mode === 'standard' ? stdFormulas : mode === 'cyclical' ? cycFormulas : dcfFormulas).map((f, i) => (
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
              {language === 'en' ? 'Inputs' : 'Input'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVals({ ...emptyForMode })}
                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                {language === 'en' ? 'Clear' : 'Hapus'}
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                {language === 'en' ? 'Clear All' : 'Hapus Semua'}
              </button>
            </div>
          </div>

          {/* ── Sub-toggle: Standard vs Cyclical (only for EPS-Based) ── */}
          {mode !== 'dcf' && (
            <div className="flex rounded-2xl border border-border bg-muted/40 p-1 gap-1">
              <button
                onClick={() => setMode('standard')}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all',
                  mode === 'standard'
                    ? 'bg-background text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {language === 'en' ? 'Standard' : 'Standar'}
              </button>
              <button
                onClick={() => setMode('cyclical')}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all',
                  mode === 'cyclical'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {language === 'en' ? 'Cyclical' : 'Siklus'}
              </button>
            </div>
          )}

          {/* ── Mode notice ── */}
          {mode === 'cyclical' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
                {language === 'en'
                  ? 'Cyclical mode uses Normalized EPS — the average EPS over a full business cycle (5–7 years) — to avoid overvaluing at peak earnings or undervaluing at trough earnings. A two-stage CAGR models near-term recovery and long-term steady growth.'
                  : 'Mode Siklus menggunakan EPS Dinormalisasi — rata-rata EPS selama satu siklus bisnis (5–7 tahun) — untuk menghindari penilaian terlalu tinggi saat laba puncak atau terlalu rendah saat laba trough. Dua tahap CAGR memodelkan pemulihan jangka pendek dan pertumbuhan stabil jangka panjang.'}
              </p>
            </motion.div>
          )}

          {mode === 'dcf' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 px-4 py-3"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
                {language === 'en'
                  ? 'DCF mode values the company based on its Free Cash Flow — cash actually generated after capital expenditures. It projects 10 years of FCF growth, then adds a Terminal Value using the Gordon Growth model. Net Debt is optionally deducted to derive equity value per share.'
                  : 'Mode DCF menilai perusahaan berdasarkan Arus Kas Bebas — kas yang benar-benar dihasilkan setelah belanja modal. Model memproyeksikan pertumbuhan FCF selama 10 tahun, lalu menambahkan Nilai Terminal menggunakan model Gordon Growth. Utang Bersih dapat dikurangkan secara opsional untuk mendapatkan nilai ekuitas per saham.'}
              </p>
            </motion.div>
          )}

          {/* ── Input fields ── */}
          <div className="space-y-3">
            {inputs.map((inp) => {
              const label    = language === 'en' ? inp.en   : inp.id_;
              const subtitle = language === 'en' ? inp.subtitleEn : inp.subtitleId;
              return (
                <div
                  key={inp.id}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
