import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronUp, ArrowUp, ArrowDown, Target, ShieldCheck, Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn, formatNumber } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';
import { useCalculatorState } from '@/lib/CalculatorStateContext';
import { LIQUIDITY_EMPTY } from '@/lib/calculatorDefaults';

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
  average: 'text-yellow-400',
  poor:    'text-red-500',
  neutral: 'text-foreground',
};

const directionConfig: Record<Direction, { labelEn: string; labelId: string; icon: React.ReactNode }> = {
  higher: { labelEn: 'Higher is better', labelId: 'Lebih tinggi lebih baik', icon: <ArrowUp className="w-3 h-3 text-green-500" /> },
  lower:  { labelEn: 'Lower is better',  labelId: 'Lebih rendah lebih baik', icon: <ArrowDown className="w-3 h-3 text-blue-500" /> },
  range:  { labelEn: 'In range is better', labelId: 'Dalam rentang terbaik', icon: <Target className="w-3 h-3 text-yellow-500" /> },
};

function fmt(val: number): string {
  return `${formatNumber(val, 2)}x`;
}

function fmtCurrency(val: number): string {
  if (Math.abs(val) >= 1_000_000_000) return `${formatNumber(val / 1_000_000_000, 2)}B`;
  if (Math.abs(val) >= 1_000_000) return `${formatNumber(val / 1_000_000, 2)}M`;
  if (Math.abs(val) >= 1_000) return `${formatNumber(val / 1_000, 2)}K`;
  return formatNumber(val, 2);
}

export function LiquidityCalculator() {
  const { language, t } = useLanguage();
  const { state, setCalc, clearAll } = useCalculatorState();
  const vals = state.liquidity;
  const setVals = (v: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) =>
    setCalc('liquidity', typeof v === 'function' ? v(state.liquidity) : v);
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('currentAssets') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Strong liquidity — ratio between 1.5× and 3× is healthy.'; let id = 'Likuiditas kuat — rasio 1,5× hingga 3× dianggap sehat.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val >= 1.5 && val <= 3) { interp = 'good'; en = 'Strong liquidity — ratio between 1.5× and 3× is healthy.'; id = 'Likuiditas kuat — rasio 1,5× hingga 3× dianggap sehat.'; cEn = 'Healthy — can comfortably pay short-term debts.'; cId = 'Sehat — mampu membayar utang jangka pendek.'; }
        else if (val > 3) { interp = 'neutral'; en = 'Very high — may indicate inefficient use of assets.'; id = 'Sangat tinggi — mungkin menunjukkan penggunaan aset yang tidak efisien.'; cEn = 'Too high — may be holding excess idle assets.'; cId = 'Terlalu tinggi — mungkin menyimpan aset berlebih.'; }
        else if (val >= 1 && val < 1.5) { interp = 'average'; en = 'Adequate liquidity.'; id = 'Likuiditas yang memadai.'; cEn = 'Adequate, but limited buffer for unexpected costs.'; cId = 'Memadai, namun penyangga biaya tak terduga terbatas.'; }
        else { interp = 'poor'; en = 'Poor liquidity — may struggle with short-term obligations.'; id = 'Likuiditas buruk — mungkin kesulitan memenuhi kewajiban jangka pendek.'; cEn = 'At risk — may struggle to pay short-term debts.'; cId = 'Berisiko — mungkin kesulitan membayar utang jangka pendek.'; }
      }
      return {
        label: 'Current Ratio', labelId: 'Rasio Lancar', value: val,
        formatted: val !== null ? fmt(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: "Measures a company's ability to pay short-term obligations with short-term assets.",
          descId: 'Mengukur kemampuan perusahaan membayar kewajiban jangka pendek menggunakan aset lancar.',
          benchmarkEn: '1.5–3× is generally healthy',
          benchmarkId: '1,5–3× umumnya dianggap sehat',
          direction: 'range',
          formula: 'Current Assets ÷ Current Liabilities',
        },
      };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('inventory') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? (n('currentAssets') - n('inventory')) / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Acceptable quick liquidity.'; let id = 'Likuiditas cepat yang memadai.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 1) { interp = 'good'; en = 'Strong — can cover obligations without selling inventory.'; id = 'Kuat — dapat memenuhi kewajiban tanpa menjual persediaan.'; cEn = 'Can pay debts without relying on inventory.'; cId = 'Dapat membayar utang tanpa bergantung pada persediaan.'; }
        else if (val === 1) { interp = 'average'; cEn = 'Just meets obligations — no extra buffer.'; cId = 'Tepat memenuhi kewajiban — tanpa penyangga ekstra.'; }
        else { interp = 'poor'; en = 'Relies heavily on inventory to meet short-term obligations.'; id = 'Sangat bergantung pada persediaan untuk memenuhi kewajiban.'; cEn = 'Relies on inventory to cover short-term debts.'; cId = 'Bergantung pada persediaan untuk menutup utang jangka pendek.'; }
      }
      return {
        label: 'Quick Ratio (Acid-Test)', labelId: 'Rasio Cepat (Uji Asam)', value: val,
        formatted: val !== null ? fmt(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'A more conservative liquidity measure excluding less-liquid assets like inventory.',
          descId: 'Ukuran likuiditas lebih konservatif, mengecualikan aset kurang likuid seperti persediaan.',
          benchmarkEn: '≥ 1.0× is generally considered healthy',
          benchmarkId: '≥ 1,0× umumnya dianggap sehat',
          direction: 'higher',
          formula: '(Current Assets − Inventory) ÷ Current Liabilities',
        },
      };
    })(),
    (() => {
      const hasInputs = has('cash') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cash') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Below 1 is normal — companies rarely hold cash to cover all liabilities.'; let id = 'Di bawah 1 adalah normal — perusahaan jarang menyimpan kas untuk semua liabilitas.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val >= 0.5) { interp = 'good'; en = 'Very strong cash position.'; id = 'Posisi kas sangat kuat.'; cEn = 'Very strong — cash alone can cover liabilities.'; cId = 'Sangat kuat — kas saja cukup untuk menutup liabilitas.'; }
        else if (val >= 0.1) { interp = 'neutral'; cEn = 'Normal range — typical for most companies.'; cId = 'Rentang normal — umum bagi kebanyakan perusahaan.'; }
        else { interp = 'poor'; en = 'Very low cash — high reliance on receivables/inventory.'; id = 'Kas sangat rendah — ketergantungan tinggi pada piutang/persediaan.'; cEn = 'Very low cash on hand.'; cId = 'Kas di tangan sangat rendah.'; }
      }
      return {
        label: 'Cash Ratio', labelId: 'Rasio Kas', value: val,
        formatted: val !== null ? fmt(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'The most conservative liquidity measure — only cash and equivalents, no receivables or inventory.',
          descId: 'Ukuran likuiditas paling konservatif — hanya kas dan setara kas, tanpa piutang atau persediaan.',
          benchmarkEn: 'Very strong: ≥ 0.5×. Most companies operate between 0.1× – 0.5×',
          benchmarkId: 'Sangat kuat: ≥ 0,5×. Kebanyakan perusahaan beroperasi antara 0,1× – 0,5×',
          direction: 'higher',
          formula: 'Cash & Equivalents ÷ Current Liabilities',
        },
      };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities');
      const val = hasInputs ? n('currentAssets') - n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Positive working capital means short-term assets exceed obligations.'; let id = 'Modal kerja positif berarti aset jangka pendek melebihi kewajiban.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 0) { interp = 'good'; en = `Positive working capital of ${fmtCurrency(val)} — good buffer.`; id = `Modal kerja positif sebesar ${fmtCurrency(val)} — penyangga yang baik.`; cEn = 'Positive — can fund daily operations comfortably.'; cId = 'Positif — mampu mendanai operasi harian.'; }
        else if (val < 0) { interp = 'poor'; en = `Negative working capital of ${fmtCurrency(val)} — liabilities exceed assets.`; id = `Modal kerja negatif sebesar ${fmtCurrency(val)} — liabilitas melebihi aset.`; cEn = 'Negative — liabilities exceed current assets.'; cId = 'Negatif — liabilitas melebihi aset lancar.'; }
        else { interp = 'average'; en = 'Zero working capital — breakeven position.'; id = 'Modal kerja nol — posisi impas.'; cEn = 'Breakeven — no surplus to absorb shocks.'; cId = 'Impas — tidak ada surplus untuk penyangga.'; }
      }
      return {
        label: 'Working Capital', labelId: 'Modal Kerja', value: val,
        formatted: val !== null ? fmtCurrency(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Net liquid assets available for day-to-day operations. Positive means the company can fund short-term needs.',
          descId: 'Aset likuid bersih untuk operasional harian. Positif berarti perusahaan dapat mendanai kebutuhan jangka pendek.',
          benchmarkEn: 'Positive: healthy buffer. Negative: may struggle to meet current obligations',
          benchmarkId: 'Positif: penyangga sehat. Negatif: mungkin kesulitan memenuhi kewajiban saat ini',
          direction: 'higher',
          formula: 'Current Assets − Current Liabilities',
        },
      };
    })(),
    (() => {
      const hasInputs = has('cfFromOps') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cfFromOps') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures ability to cover current liabilities with operating cash flow.'; let id = 'Mengukur kemampuan menutup liabilitas lancar dengan arus kas operasi.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val >= 1) { interp = 'good'; en = 'Strong — operating cash flow fully covers current liabilities.'; id = 'Kuat — arus kas operasi sepenuhnya menutup liabilitas lancar.'; cEn = 'Cash flow fully covers short-term obligations.'; cId = 'Arus kas sepenuhnya menutup kewajiban jangka pendek.'; }
        else if (val >= 0.5) { interp = 'average'; en = 'Moderate — covers a portion of current liabilities.'; id = 'Sedang — menutup sebagian liabilitas lancar.'; cEn = 'Partially covers obligations — monitor cash flow.'; cId = 'Menutup sebagian kewajiban — pantau arus kas.'; }
        else { interp = 'poor'; en = 'Weak — operating cash flow insufficient.'; id = 'Lemah — arus kas operasi tidak mencukupi.'; cEn = 'Insufficient cash flow to cover current debts.'; cId = 'Arus kas tidak cukup untuk menutup utang lancar.'; }
      }
      return {
        label: 'Operating Cash Flow Ratio', labelId: 'Rasio Arus Kas Operasi', value: val,
        formatted: val !== null ? fmt(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Shows how well operating cash flow covers current liabilities. Preferred over Current Ratio by analysts.',
          descId: 'Menunjukkan seberapa baik arus kas operasi menutup liabilitas lancar. Lebih disukai analis daripada Rasio Lancar.',
          benchmarkEn: 'Strong: ≥ 1×. Moderate: 0.5× – 1×. Weak: < 0.5×',
          benchmarkId: 'Kuat: ≥ 1×. Sedang: 0,5× – 1×. Lemah: < 0,5×',
          direction: 'higher',
          formula: 'Operating Cash Flow ÷ Current Liabilities',
        },
      };
    })(),
    (() => {
      const hasInputs = has('ebit') && has('interestExpense') && n('interestExpense') !== 0;
      const val = hasInputs ? n('ebit') / n('interestExpense') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures how easily a company can pay interest on its debt.'; let id = 'Mengukur seberapa mudah perusahaan membayar bunga utangnya.';
      let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 3) { interp = 'good'; en = 'Strong — earnings easily cover interest expense.'; id = 'Kuat — laba dengan mudah menutup beban bunga.'; cEn = 'Earnings easily cover interest payments.'; cId = 'Laba dengan mudah menutup pembayaran bunga.'; }
        else if (val >= 1.5) { interp = 'average'; en = 'Adequate — covers interest with limited buffer.'; id = 'Memadai — menutup bunga dengan penyangga terbatas.'; cEn = 'Covers interest, but with limited margin.'; cId = 'Menutup bunga, namun dengan margin terbatas.'; }
        else { interp = 'poor'; en = 'Risky — earnings barely cover interest. Risk of default.'; id = 'Berisiko — laba hampir tidak menutup bunga. Risiko gagal bayar.'; cEn = 'Risk of default — earnings barely cover interest.'; cId = 'Berisiko gagal bayar — laba hampir tidak menutup bunga.'; }
      }
      return {
        label: 'Interest Coverage Ratio', labelId: 'Rasio Perlindungan Bunga', value: val,
        formatted: val !== null ? fmt(val) : '—', interpretation: interp,
        interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Indicates how easily a company can pay interest on outstanding debt from operating earnings.',
          descId: 'Menunjukkan seberapa mudah perusahaan membayar bunga utang dari laba operasi.',
          benchmarkEn: 'Safe: > 3×. Adequate: 1.5× – 3×. Risky: < 1.5×',
          benchmarkId: 'Aman: > 3×. Memadai: 1,5× – 3×. Berisiko: < 1,5×',
          direction: 'higher',
          formula: 'EBIT ÷ Interest Expense',
        },
      };
    })(),
  ];

  const inputs = [
    { id: 'currentAssets',      en: 'Current Assets',            id_: 'Aset Lancar',            subtitleEn: 'Assets convertible to cash within 1 year',        subtitleId: 'Aset yang dapat dikonversi menjadi kas dalam 1 tahun' },
    { id: 'currentLiabilities', en: 'Current Liabilities',       id_: 'Liabilitas Lancar',       subtitleEn: 'Obligations due within 1 year',                   subtitleId: 'Kewajiban yang jatuh tempo dalam 1 tahun' },
    { id: 'inventory',          en: 'Inventory',                  id_: 'Persediaan',              subtitleEn: 'Goods held for sale or production',                subtitleId: 'Barang yang dimiliki untuk dijual atau produksi' },
    { id: 'cash',               en: 'Cash & Equivalents',         id_: 'Kas & Setara Kas',        subtitleEn: 'Cash on hand and short-term liquid deposits',      subtitleId: 'Kas di tangan dan deposito cair jangka pendek' },
    { id: 'cfFromOps',          en: 'Cash Flow from Operations',  id_: 'Arus Kas dari Operasi',   subtitleEn: 'Net cash generated from core business activities', subtitleId: 'Kas bersih dari aktivitas bisnis utama' },
    { id: 'ebit',               en: 'Operating Income (EBIT)',    id_: 'Laba Operasi (EBIT)',     subtitleEn: 'Earnings before interest and taxes',               subtitleId: 'Laba sebelum bunga dan pajak' },
    { id: 'interestExpense',    en: 'Interest Expense',           id_: 'Beban Bunga',             subtitleEn: 'Total interest charges on outstanding debt',       subtitleId: 'Total beban bunga atas utang yang beredar' },
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

  const catT = t.categories['liquidity' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Liquidity'}
        </h1>
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
                          {/* Category badge */}
                          <span className="text-xs font-mono text-muted-foreground">
                            {result.info.formula}
                          </span>

                          {/* Description */}
                          <p className="text-sm text-foreground leading-relaxed">{desc}</p>

                          {/* Benchmark box */}
                          <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-2.5">
                            <Target className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-sky-700 dark:text-sky-400 font-medium leading-relaxed">
                              {language === 'en' ? 'Benchmark: ' : 'Tolok ukur: '}{benchmark}
                            </p>
                          </div>

                          {/* Direction */}
                          <div className="flex items-center gap-1.5">
                            {dir.icon}
                            <span className="text-xs text-muted-foreground">
                              {language === 'id' ? dir.labelId : dir.labelEn}
                            </span>
                          </div>

                          {/* Current interpretation (if calculated) */}
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

          {/* ── Combined Liquidity Health ── */}
          <AnimatePresence>
            {results[3].value !== null && results[4].value !== null && (() => {
              const wc  = results[3].value as number;
              const cfo = n('cfFromOps');
              const wcPos  = wc  > 0;
              const cfoPos = cfo > 0;

              const variants = {
                safe:   { label: 'Safe',                 labelId: 'Aman',               icon: <ShieldCheck  className="w-5 h-5 text-green-600"  />, card: 'bg-green-50  border-green-200',  text: 'text-green-700',  sub: 'text-green-600/70'  },
                burn:   { label: 'Potential Cash Burner', labelId: 'Potensi Pembakar Kas', icon: <Flame       className="w-5 h-5 text-yellow-500" />, card: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', sub: 'text-yellow-600/70' },
                recov:  { label: 'Recovery',              labelId: 'Pemulihan',           icon: <TrendingUp   className="w-5 h-5 text-blue-600"   />, card: 'bg-blue-50   border-blue-200',   text: 'text-blue-700',   sub: 'text-blue-600/70'   },
                danger: { label: 'Danger',                labelId: 'Bahaya',              icon: <AlertTriangle className="w-5 h-5 text-red-600"  />, card: 'bg-red-50    border-red-200',    text: 'text-red-700',    sub: 'text-red-600/70'    },
              };

              const v = wcPos && cfoPos ? variants.safe
                      : wcPos && !cfoPos ? variants.burn
                      : !wcPos && cfoPos ? variants.recov
                      : variants.danger;

              const subEn = wcPos && cfoPos
                ? 'Positive working capital and positive operating cash flow. The company is liquid and generating cash from operations.'
                : wcPos && !cfoPos
                ? 'Positive working capital but negative operating cash flow. The company has short-term buffer, but is burning cash from operations.'
                : !wcPos && cfoPos
                ? 'Negative working capital but positive operating cash flow. The company is generating cash, which may help recover its short-term position.'
                : 'Negative working capital and negative operating cash flow. The company faces serious short-term liquidity risk.';
              const subId = wcPos && cfoPos
                ? 'Modal kerja positif dan arus kas operasi positif. Perusahaan likuid dan menghasilkan kas dari operasional.'
                : wcPos && !cfoPos
                ? 'Modal kerja positif namun arus kas operasi negatif. Perusahaan memiliki penyangga jangka pendek, tetapi membakar kas dari operasional.'
                : !wcPos && cfoPos
                ? 'Modal kerja negatif namun arus kas operasi positif. Perusahaan menghasilkan kas yang dapat membantu memulihkan posisi jangka pendeknya.'
                : 'Modal kerja negatif dan arus kas operasi negatif. Perusahaan menghadapi risiko likuiditas jangka pendek yang serius.';

              return (
                <motion.div
                  key="health"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className={cn('border rounded-2xl px-4 py-3.5 flex items-center gap-3.5', v.card)}
                >
                  <div className="shrink-0">{v.icon}</div>
                  <div className="flex flex-col min-w-0">
                    <p className={cn('text-base font-extrabold leading-tight mb-1', v.text)}>
                      {language === 'en' ? v.label : v.labelId}
                    </p>
                    <p className={cn('text-[11px] leading-relaxed', v.sub)}>
                      {language === 'en' ? subEn : subId}
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* ── INPUTS column — bottom on mobile, left on desktop ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {language === 'en' ? 'Inputs' : 'Input'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCalc('liquidity', { ...LIQUIDITY_EMPTY })}
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

          <div className="space-y-3">
            {inputs.map((inp, i) => {
              const label = language === 'en' ? inp.en : inp.id_;
              const subtitle = language === 'en' ? inp.subtitleEn : inp.subtitleId;
              return (
                <motion.div
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
