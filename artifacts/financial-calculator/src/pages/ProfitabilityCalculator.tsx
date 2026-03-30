import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronUp, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn, formatNumber } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';

type InterpretationType = 'good' | 'average' | 'poor' | 'neutral';
type Direction = 'higher' | 'lower' | 'range';

interface RatioInfo {
  descEn: string;
  descId: string;
  benchmarkEn: string;
  benchmarkId: string;
  direction: Direction;
  formula: string;
}

interface OutputResult {
  label: string;
  labelId: string;
  value: number | null;
  formatted: string;
  interpretation: InterpretationType;
  interpretationText: string;
  interpretationTextId: string;
  commentEn: string;
  commentId: string;
  info: RatioInfo;
}

const valueColor: Record<InterpretationType, string> = {
  good:    'text-green-600',
  average: 'text-yellow-600',
  poor:    'text-red-500',
  neutral: 'text-blue-600',
};

const directionConfig: Record<Direction, { labelEn: string; labelId: string; icon: React.ReactNode }> = {
  higher: { labelEn: 'Higher is better', labelId: 'Lebih tinggi lebih baik', icon: <ArrowUp className="w-3 h-3 text-green-500" /> },
  lower:  { labelEn: 'Lower is better',  labelId: 'Lebih rendah lebih baik', icon: <ArrowDown className="w-3 h-3 text-blue-500" /> },
  range:  { labelEn: 'In range is better', labelId: 'Dalam rentang terbaik',  icon: <Target className="w-3 h-3 text-yellow-500" /> },
};

function fmtPct(val: number): string {
  return `${formatNumber(val, 2)}%`;
}

const EMPTY: Record<string, string> = {
  netIncome: '0', totalRevenue: '0', grossProfit: '0',
  operatingIncome: '0', totalAssets: '0', totalEquity: '0', ebitda: '0',
};

export function ProfitabilityCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...EMPTY });
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('netIncome') && has('totalRevenue') && n('totalRevenue') !== 0;
      const val = hasInputs ? (n('netIncome') / n('totalRevenue')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 20)      { interp = 'good';    en = 'Strong profitability — high earnings relative to revenue.'; id = 'Profitabilitas kuat — laba tinggi relatif terhadap pendapatan.'; cEn = 'Strong — retains a large share of each dollar earned.'; cId = 'Kuat — mempertahankan porsi besar dari setiap rupiah pendapatan.'; }
        else if (val >= 5) { interp = 'average'; en = 'Moderate net margin — room for improvement.'; id = 'Margin bersih moderat — masih ada ruang untuk perbaikan.'; cEn = 'Moderate — earning a reasonable portion of revenue.'; cId = 'Sedang — menghasilkan porsi pendapatan yang wajar.'; }
        else if (val >= 0) { interp = 'poor';    en = 'Thin margin — most revenue is consumed by costs.'; id = 'Margin tipis — sebagian besar pendapatan habis untuk biaya.'; cEn = 'Very thin margin — costs are eating most of revenue.'; cId = 'Margin sangat tipis — biaya menghabiskan sebagian besar pendapatan.'; }
        else               { interp = 'poor';    en = 'Negative margin — company is operating at a loss.'; id = 'Margin negatif — perusahaan beroperasi dalam kerugian.'; cEn = 'Operating at a loss — expenses exceed revenue.'; cId = 'Merugi — pengeluaran melebihi pendapatan.'; }
      }
      return {
        label: 'Net Profit Margin', labelId: 'Margin Laba Bersih',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: "Shows what percentage of revenue remains as profit after all expenses, taxes, and interest.",
          descId: 'Menunjukkan persentase pendapatan yang tersisa sebagai laba setelah semua biaya, pajak, dan bunga.',
          benchmarkEn: 'Strong: > 20%. Moderate: 5–20%. Thin: < 5%',
          benchmarkId: 'Kuat: > 20%. Sedang: 5–20%. Tipis: < 5%',
          direction: 'higher',
          formula: 'Net Income ÷ Revenue × 100',
        },
      };
    })(),
    (() => {
      const hasInputs = has('grossProfit') && has('totalRevenue') && n('totalRevenue') !== 0;
      const val = hasInputs ? (n('grossProfit') / n('totalRevenue')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 40)       { interp = 'good';    en = 'High gross margin — strong pricing power or low production cost.'; id = 'Margin kotor tinggi — daya penetapan harga kuat atau biaya produksi rendah.'; cEn = 'High margin — strong pricing power over cost of goods.'; cId = 'Margin tinggi — daya harga kuat terhadap harga pokok.'; }
        else if (val >= 20) { interp = 'average'; en = 'Adequate gross margin for most industries.'; id = 'Margin kotor yang memadai untuk kebanyakan industri.'; cEn = 'Decent margin — covers operating costs with buffer.'; cId = 'Margin wajar — menutupi biaya operasi dengan penyangga.'; }
        else                { interp = 'poor';    en = 'Low gross margin — high cost of goods relative to revenue.'; id = 'Margin kotor rendah — harga pokok tinggi relatif terhadap pendapatan.'; cEn = 'Low margin — high cost of goods sold squeezing profits.'; cId = 'Margin rendah — harga pokok barang menekan laba.'; }
      }
      return {
        label: 'Gross Profit Margin', labelId: 'Margin Laba Kotor',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'The percentage of revenue remaining after deducting the cost of goods sold. Reflects production efficiency.',
          descId: 'Persentase pendapatan yang tersisa setelah dikurangi harga pokok penjualan. Mencerminkan efisiensi produksi.',
          benchmarkEn: 'Strong: > 40%. Adequate: 20–40%. Low: < 20%',
          benchmarkId: 'Kuat: > 40%. Memadai: 20–40%. Rendah: < 20%',
          direction: 'higher',
          formula: 'Gross Profit ÷ Revenue × 100',
        },
      };
    })(),
    (() => {
      const hasInputs = has('operatingIncome') && has('totalRevenue') && n('totalRevenue') !== 0;
      const val = hasInputs ? (n('operatingIncome') / n('totalRevenue')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 15)      { interp = 'good';    en = 'Strong operating efficiency — high profit from core operations.'; id = 'Efisiensi operasi kuat — laba tinggi dari operasi inti.'; cEn = 'Core operations are highly profitable.'; cId = 'Operasi inti sangat menguntungkan.'; }
        else if (val >= 5) { interp = 'average'; en = 'Moderate operating margin — efficient but not exceptional.'; id = 'Margin operasi moderat — efisien tapi belum luar biasa.'; cEn = 'Operations are moderately efficient.'; cId = 'Operasi cukup efisien.'; }
        else if (val >= 0) { interp = 'poor';    en = 'Thin operating margin — high operating costs relative to revenue.'; id = 'Margin operasi tipis — biaya operasi tinggi relatif terhadap pendapatan.'; cEn = 'Slim operating profit — costs are high relative to revenue.'; cId = 'Laba operasi tipis — biaya tinggi relatif terhadap pendapatan.'; }
        else               { interp = 'poor';    en = 'Negative — operating costs exceed revenue from core business.'; id = 'Negatif — biaya operasi melebihi pendapatan dari bisnis inti.'; cEn = 'Core operations are running at a loss.'; cId = 'Operasi inti sedang merugi.'; }
      }
      return {
        label: 'Operating Profit Margin', labelId: 'Margin Laba Operasi',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Profit from core business operations as a percentage of revenue, before interest and taxes.',
          descId: 'Laba dari operasi bisnis inti sebagai persentase pendapatan, sebelum bunga dan pajak.',
          benchmarkEn: 'Strong: > 15%. Moderate: 5–15%. Weak: < 5%',
          benchmarkId: 'Kuat: > 15%. Sedang: 5–15%. Lemah: < 5%',
          direction: 'higher',
          formula: 'Operating Income ÷ Revenue × 100',
        },
      };
    })(),
    (() => {
      const hasInputs = has('netIncome') && has('totalAssets') && n('totalAssets') !== 0;
      const val = hasInputs ? (n('netIncome') / n('totalAssets')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 5)       { interp = 'good';    en = 'Strong asset utilization — generating solid returns from assets.'; id = 'Penggunaan aset kuat — menghasilkan imbal hasil yang baik dari aset.'; cEn = 'Assets are generating strong returns for the company.'; cId = 'Aset menghasilkan imbal hasil kuat bagi perusahaan.'; }
        else if (val >= 2) { interp = 'average'; en = 'Moderate — assets are being used reasonably well.'; id = 'Moderat — aset digunakan dengan cukup baik.'; cEn = 'Moderate return — assets are used reasonably well.'; cId = 'Imbal hasil sedang — aset digunakan dengan cukup baik.'; }
        else if (val >= 0) { interp = 'poor';    en = 'Low — assets are not generating enough profit.'; id = 'Rendah — aset tidak menghasilkan laba yang cukup.'; cEn = 'Low return — assets are not working efficiently enough.'; cId = 'Imbal hasil rendah — aset belum bekerja cukup efisien.'; }
        else               { interp = 'poor';    en = 'Negative — company is losing money relative to its assets.'; id = 'Negatif — perusahaan merugi relatif terhadap asetnya.'; cEn = 'Assets are generating losses — company is in the red.'; cId = 'Aset menghasilkan kerugian — perusahaan sedang merugi.'; }
      }
      return {
        label: 'Return on Assets (ROA)', labelId: 'Imbal Hasil Aset (ROA)',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures how efficiently a company uses its assets to generate profit. Higher means better asset productivity.',
          descId: 'Mengukur seberapa efisien perusahaan menggunakan asetnya untuk menghasilkan laba.',
          benchmarkEn: 'Strong: > 5%. Moderate: 2–5%. Weak: < 2%',
          benchmarkId: 'Kuat: > 5%. Sedang: 2–5%. Lemah: < 2%',
          direction: 'higher',
          formula: 'Net Income ÷ Total Assets × 100',
        },
      };
    })(),
    (() => {
      const hasInputs = has('netIncome') && has('totalEquity') && n('totalEquity') !== 0;
      const val = hasInputs ? (n('netIncome') / n('totalEquity')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 15)      { interp = 'good';    en = 'Excellent — generating strong returns for shareholders.'; id = 'Sangat baik — menghasilkan imbal hasil kuat bagi pemegang saham.'; cEn = 'Excellent — shareholders are getting strong returns.'; cId = 'Sangat baik — pemegang saham mendapatkan imbal hasil kuat.'; }
        else if (val >= 8) { interp = 'average'; en = 'Acceptable return on equity for most industries.'; id = 'Imbal hasil ekuitas yang dapat diterima untuk kebanyakan industri.'; cEn = 'Decent return on equity — acceptable for most sectors.'; cId = 'Imbal hasil ekuitas yang wajar — dapat diterima untuk sebagian besar sektor.'; }
        else if (val >= 0) { interp = 'poor';    en = 'Low — shareholders are not being rewarded sufficiently.'; id = 'Rendah — pemegang saham tidak mendapatkan imbalan yang cukup.'; cEn = 'Low — shareholders getting below-average returns.'; cId = 'Rendah — pemegang saham mendapat imbal hasil di bawah rata-rata.'; }
        else               { interp = 'poor';    en = 'Negative — equity is being eroded by losses.'; id = 'Negatif — ekuitas tergerus oleh kerugian.'; cEn = 'Losses are eroding shareholder equity.'; cId = 'Kerugian menggerus ekuitas pemegang saham.'; }
      }
      return {
        label: 'Return on Equity (ROE)', labelId: 'Imbal Hasil Ekuitas (ROE)',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures how much profit a company generates with the money shareholders have invested.',
          descId: 'Mengukur seberapa besar laba yang dihasilkan perusahaan dari modal yang diinvestasikan pemegang saham.',
          benchmarkEn: 'Excellent: > 15%. Acceptable: 8–15%. Low: < 8%',
          benchmarkId: 'Sangat baik: > 15%. Dapat diterima: 8–15%. Rendah: < 8%',
          direction: 'higher',
          formula: 'Net Income ÷ Total Equity × 100',
        },
      };
    })(),
    (() => {
      const hasInputs = has('ebitda') && has('totalRevenue') && n('totalRevenue') !== 0;
      const val = hasInputs ? (n('ebitda') / n('totalRevenue')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 30)       { interp = 'good';    en = 'Strong EBITDA margin — highly profitable operations.'; id = 'Margin EBITDA kuat — operasi sangat menguntungkan.'; cEn = 'Highly profitable core operations before financing costs.'; cId = 'Operasi inti sangat menguntungkan sebelum biaya keuangan.'; }
        else if (val >= 15) { interp = 'average'; en = 'Healthy EBITDA margin — solid operational performance.'; id = 'Margin EBITDA sehat — kinerja operasional yang solid.'; cEn = 'Solid operational profitability.'; cId = 'Profitabilitas operasional yang solid.'; }
        else if (val >= 0)  { interp = 'poor';    en = 'Thin EBITDA margin — high operating costs.'; id = 'Margin EBITDA tipis — biaya operasi tinggi.'; cEn = 'Slim margin — high costs limiting operational profit.'; cId = 'Margin tipis — biaya tinggi membatasi laba operasi.'; }
        else                { interp = 'poor';    en = 'Negative — operating costs exceed earnings before financing.'; id = 'Negatif — biaya operasi melebihi laba sebelum pembiayaan.'; cEn = 'Negative — operating cash generation is below breakeven.'; cId = 'Negatif — arus kas operasi di bawah titik impas.'; }
      }
      return {
        label: 'EBITDA Margin', labelId: 'Margin EBITDA',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Earnings before interest, taxes, depreciation, and amortization as a % of revenue. Reflects pure operational efficiency.',
          descId: 'Laba sebelum bunga, pajak, depresiasi, dan amortisasi sebagai % pendapatan. Mencerminkan efisiensi operasional murni.',
          benchmarkEn: 'Strong: > 30%. Healthy: 15–30%. Thin: < 15%',
          benchmarkId: 'Kuat: > 30%. Sehat: 15–30%. Tipis: < 15%',
          direction: 'higher',
          formula: 'EBITDA ÷ Revenue × 100',
        },
      };
    })(),
  ];

  const inputs = [
    { id: 'netIncome',       en: 'Net Income',              id_: 'Laba Bersih',            subtitleEn: 'Profit after all expenses, interest, and taxes',      subtitleId: 'Laba setelah semua biaya, bunga, dan pajak' },
    { id: 'totalRevenue',    en: 'Total Revenue',           id_: 'Total Pendapatan',        subtitleEn: 'Total income from sales and services',                subtitleId: 'Total pendapatan dari penjualan dan layanan' },
    { id: 'grossProfit',     en: 'Gross Profit',            id_: 'Laba Kotor',              subtitleEn: 'Revenue minus cost of goods sold',                    subtitleId: 'Pendapatan dikurangi harga pokok penjualan' },
    { id: 'operatingIncome', en: 'Operating Income (EBIT)', id_: 'Laba Operasi (EBIT)',     subtitleEn: 'Earnings before interest and taxes',                  subtitleId: 'Laba sebelum bunga dan pajak' },
    { id: 'totalAssets',     en: 'Total Assets',            id_: 'Total Aset',              subtitleEn: 'Everything the company owns',                         subtitleId: 'Semua yang dimiliki perusahaan' },
    { id: 'totalEquity',     en: 'Total Equity',            id_: 'Total Ekuitas',           subtitleEn: "Shareholders' total ownership stake",                 subtitleId: 'Total kepemilikan pemegang saham' },
    { id: 'ebitda',          en: 'EBITDA',                  id_: 'EBITDA',                  subtitleEn: 'Earnings before interest, taxes, depreciation & amortization', subtitleId: 'Laba sebelum bunga, pajak, depresiasi & amortisasi' },
  ];

  const toggleSign = (id: string) => {
    setVals(prev => {
      const cur = prev[id];
      if (cur === '' || cur === '0') return prev;
      const num = parseFloat(cur);
      if (isNaN(num)) return prev;
      return { ...prev, [id]: String(-num) };
    });
  };

  const catT = t.categories['profitability' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Profitability'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {catT?.description ?? "Measure how efficiently a company generates profit relative to revenue, assets, and equity."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── RESULTS column — top on mobile, right on desktop ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {language === 'en' ? 'Results' : 'Hasil'}
          </p>

          <div className="space-y-2">
            {results.map((result, i) => {
              const label = language === 'en' ? result.label : result.labelId;
              const isCalculated = result.value !== null;
              const color = isCalculated ? valueColor[result.interpretation] : 'text-muted-foreground/40';
              const infoKey = result.label;
              const isInfoOpen = !!openInfo[infoKey];
              const dir = directionConfig[result.info.direction];
              const desc = language === 'en' ? result.info.descEn : result.info.descId;
              const benchmark = language === 'en' ? result.info.benchmarkEn : result.info.benchmarkId;

              return (
                <motion.div
                  key={result.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {/* Header row */}
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-foreground leading-tight">{label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('text-base font-bold tabular-nums', color)}>
                          {result.formatted}
                        </span>
                        <button
                          onClick={() => toggleInfo(infoKey)}
                          className={cn(
                            'transition-colors rounded-full p-0.5',
                            isInfoOpen ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'
                          )}
                        >
                          {isInfoOpen ? <ChevronUp className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {isCalculated && (
                      <p className={cn('text-xs mt-0.5', valueColor[result.interpretation])}>
                        {language === 'id' ? result.commentId : result.commentEn}
                      </p>
                    )}
                  </div>

                  {/* Glossary-style dropdown */}
                  <AnimatePresence initial={false}>
                    {isInfoOpen && (
                      <motion.div
                        key="info"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50">
                          <span className="inline-flex text-xs font-mono px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                            {result.info.formula}
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">{desc}</p>
                          <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-2.5">
                            <Target className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-sky-700 dark:text-sky-400 font-medium leading-relaxed">
                              {language === 'en' ? 'Benchmark: ' : 'Tolok ukur: '}{benchmark}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {dir.icon}
                            <span className="text-xs text-muted-foreground">
                              {language === 'id' ? dir.labelId : dir.labelEn}
                            </span>
                          </div>
                          {isCalculated && (
                            <p className={cn('text-xs font-medium leading-relaxed', color)}>
                              {language === 'en' ? result.interpretationText : result.interpretationTextId}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── INPUTS column — bottom on mobile, left on desktop ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {language === 'en' ? 'Inputs' : 'Input'}
            </p>
            <button
              onClick={() => setVals({ ...EMPTY })}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              {language === 'en' ? 'Clear' : 'Hapus'}
            </button>
          </div>

          <div className="space-y-3">
            {inputs.map((inp, i) => {
              const label = language === 'en' ? inp.en : inp.id_;
              const subtitle = language === 'en' ? inp.subtitleEn : inp.subtitleId;
              return (
                <motion.div
                  key={inp.id}
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
                      value={vals[inp.id]}
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
