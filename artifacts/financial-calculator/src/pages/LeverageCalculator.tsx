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

function fmt(val: number): string {
  return `${formatNumber(val, 2)}x`;
}

const EMPTY: Record<string, string> = {
  totalLiabilities: '0', totalEquity: '0', totalAssets: '0',
  totalDebt: '0', ebitda: '0',
};

export function LeverageCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...EMPTY });
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('totalDebt') && has('totalEquity') && n('totalEquity') !== 0;
      const val = hasInputs ? n('totalDebt') / n('totalEquity') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 1)       { interp = 'good';    en = 'Low leverage — company relies more on equity than debt.'; id = 'Leverage rendah — perusahaan lebih mengandalkan ekuitas dari pada utang.'; cEn = 'Low leverage — funded more by equity than debt.'; cId = 'Leverage rendah — lebih banyak didanai ekuitas dari utang.'; }
        else if (val <= 2) { interp = 'average'; en = 'Moderate leverage — manageable debt level.'; id = 'Leverage moderat — tingkat utang yang dapat dikelola.'; cEn = 'Moderate leverage — debt is manageable.'; cId = 'Leverage moderat — utang masih dapat dikelola.'; }
        else               { interp = 'poor';    en = 'High leverage — company is heavily reliant on debt financing.'; id = 'Leverage tinggi — perusahaan sangat bergantung pada pembiayaan utang.'; cEn = 'High leverage — heavily reliant on debt.'; cId = 'Leverage tinggi — sangat bergantung pada utang.'; }
      }
      return {
        label: 'Debt to Equity Ratio', labelId: 'Rasio Utang terhadap Ekuitas',
        value: val, formatted: val !== null ? fmt(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Compares total debt to shareholder equity. Shows how much of the company is financed by debt versus owners\' money.',
          descId: 'Membandingkan total utang dengan ekuitas pemegang saham. Menunjukkan seberapa besar perusahaan dibiayai utang versus modal pemilik.',
          benchmarkEn: 'Low: < 1×. Moderate: 1×–2×. High: > 2×',
          benchmarkId: 'Rendah: < 1×. Sedang: 1×–2×. Tinggi: > 2×',
          direction: 'lower',
          formula: 'Total Debt ÷ Total Equity',
        },
      };
    })(),
    (() => {
      const hasInputs = has('totalLiabilities') && has('totalAssets') && n('totalAssets') !== 0;
      const val = hasInputs ? n('totalLiabilities') / n('totalAssets') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 0.3)      { interp = 'good';    en = 'Low — most assets are funded by equity, not creditors.'; id = 'Rendah — sebagian besar aset didanai ekuitas, bukan kreditur.'; cEn = 'Low debt load — most assets are equity-funded.'; cId = 'Beban utang rendah — sebagian besar aset didanai ekuitas.'; }
        else if (val <= 0.6){ interp = 'average'; en = 'Moderate — a reasonable share of assets financed by debt.'; id = 'Sedang — porsi wajar aset dibiayai oleh utang.'; cEn = 'Moderate — liabilities cover a reasonable share of assets.'; cId = 'Sedang — liabilitas menutup porsi wajar dari aset.'; }
        else                { interp = 'poor';    en = 'High — creditors finance most of the company\'s assets.'; id = 'Tinggi — kreditur membiayai sebagian besar aset perusahaan.'; cEn = 'High — most assets are debt-financed, increasing risk.'; cId = 'Tinggi — sebagian besar aset dibiayai utang, meningkatkan risiko.'; }
      }
      return {
        label: 'Debt to Assets Ratio', labelId: 'Rasio Utang terhadap Aset',
        value: val, formatted: val !== null ? fmt(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures what proportion of a company\'s assets are financed by liabilities. Higher values indicate greater financial risk.',
          descId: 'Mengukur proporsi aset perusahaan yang dibiayai oleh liabilitas. Nilai lebih tinggi menunjukkan risiko keuangan lebih besar.',
          benchmarkEn: 'Low: < 0.3×. Moderate: 0.3×–0.6×. High: > 0.6×',
          benchmarkId: 'Rendah: < 0,3×. Sedang: 0,3×–0,6×. Tinggi: > 0,6×',
          direction: 'lower',
          formula: 'Total Liabilities ÷ Total Assets',
        },
      };
    })(),
    (() => {
      const hasInputs = has('totalDebt') && has('ebitda') && n('ebitda') !== 0;
      const val = hasInputs ? n('totalDebt') / n('ebitda') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 2)       { interp = 'good';    en = 'Low — debt is small relative to earnings capacity.'; id = 'Rendah — utang kecil relatif terhadap kapasitas laba.'; cEn = 'Low debt — earnings can repay debt quickly.'; cId = 'Utang rendah — laba dapat melunasi utang dengan cepat.'; }
        else if (val <= 4) { interp = 'average'; en = 'Moderate — debt is manageable with current earnings.'; id = 'Sedang — utang dapat dikelola dengan laba saat ini.'; cEn = 'Moderate — debt is manageable given earnings.'; cId = 'Sedang — utang dapat dikelola dengan laba yang ada.'; }
        else               { interp = 'poor';    en = 'High — debt is large relative to earnings. Harder to service.'; id = 'Tinggi — utang besar relatif terhadap laba. Lebih sulit dilunasi.'; cEn = 'High debt load — earnings may struggle to service debt.'; cId = 'Beban utang tinggi — laba mungkin kesulitan membayar utang.'; }
      }
      return {
        label: 'Debt to EBITDA', labelId: 'Utang terhadap EBITDA',
        value: val, formatted: val !== null ? fmt(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures how many years of EBITDA it would take to repay total debt. Widely used by lenders and credit analysts.',
          descId: 'Mengukur berapa tahun EBITDA yang dibutuhkan untuk melunasi total utang. Digunakan luas oleh pemberi pinjaman dan analis kredit.',
          benchmarkEn: 'Low: < 2×. Moderate: 2×–4×. High: > 4×',
          benchmarkId: 'Rendah: < 2×. Sedang: 2×–4×. Tinggi: > 4×',
          direction: 'lower',
          formula: 'Total Debt ÷ EBITDA',
        },
      };
    })(),
  ];

  const inputs = [
    { id: 'totalLiabilities', en: 'Total Liabilities',  id_: 'Total Liabilitas',  subtitleEn: 'All financial obligations owed by the company',           subtitleId: 'Semua kewajiban keuangan yang dimiliki perusahaan' },
    { id: 'totalEquity',      en: 'Total Equity',        id_: 'Total Ekuitas',     subtitleEn: "Shareholders' total ownership stake",                     subtitleId: 'Total kepemilikan pemegang saham' },
    { id: 'totalAssets',      en: 'Total Assets',        id_: 'Total Aset',        subtitleEn: 'Everything the company owns',                             subtitleId: 'Semua yang dimiliki perusahaan' },
    { id: 'totalDebt',        en: 'Total Debt',          id_: 'Total Utang',       subtitleEn: 'Short-term and long-term interest-bearing borrowings',     subtitleId: 'Pinjaman berbunga jangka pendek dan jangka panjang' },
    { id: 'ebitda',           en: 'EBITDA',              id_: 'EBITDA',            subtitleEn: 'Earnings before interest, taxes, depreciation & amortization', subtitleId: 'Laba sebelum bunga, pajak, depresiasi & amortisasi' },
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

  const catT = t.categories['leverage' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Leverage'}
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
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
