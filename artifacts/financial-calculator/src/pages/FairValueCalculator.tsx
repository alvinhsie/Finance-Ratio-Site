import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronUp, Target, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn, formatNumber } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';

type InterpretationType = 'good' | 'average' | 'poor' | 'neutral';

interface ResultCard {
  label: string;
  labelId: string;
  value: number;
  formatted: string;
  interpretation: InterpretationType;
  commentEn: string;
  commentId: string;
  formula: string;
  descEn: string;
  descId: string;
  benchmarkEn: string;
  benchmarkId: string;
  optional?: boolean;
}

const valueColor: Record<InterpretationType, string> = {
  good:    'text-emerald-600 dark:text-emerald-400',
  average: 'text-amber-500 dark:text-amber-400',
  poor:    'text-rose-500 dark:text-rose-400',
  neutral: 'text-teal-600 dark:text-teal-400',
};

const INITIAL: Record<string, string> = {
  currentEps:        '',
  totalEquity:       '',
  sharesOutstanding: '',
  growthRate:        '',
  inflationRate:     '',
  currentPrice:      '',
};

export function FairValueCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...INITIAL });
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});

  const n = (k: string) => parseFloat(vals[k] || '0') || 0;
  const isFilled = (k: string) => vals[k].trim() !== '';

  const requiredFilled =
    isFilled('currentEps') &&
    isFilled('totalEquity') &&
    isFilled('sharesOutstanding') &&
    isFilled('growthRate') &&
    isFilled('inflationRate') &&
    n('inflationRate') > 0;

  const hasPriceInput = isFilled('currentPrice') && n('currentPrice') > 0;

  // ── DCF Computation ─────────────────────────────────────────────
  const computeResults = (): ResultCard[] => {
    const eps = n('currentEps');
    const equity = n('totalEquity');
    const shares = n('sharesOutstanding');
    const g = n('growthRate') / 100;
    const r = n('inflationRate') / 100;
    const price = n('currentPrice');

    const bvps = shares > 0 ? equity / shares : 0;

    // 10-year projected EPS, discounted back
    let pvStream = 0;
    let epsYear = eps;
    for (let yr = 1; yr <= 10; yr++) {
      epsYear = eps * Math.pow(1 + g, yr);
      pvStream += epsYear / Math.pow(1 + r, yr);
    }
    const eps10 = epsYear;

    // Terminal value: perpetuity at 0% terminal growth discounted back
    const terminalValue = r > 0 ? eps10 / r : 0;
    const pvTerminal = terminalValue / Math.pow(1 + r, 10);

    const intrinsic = pvStream + pvTerminal;

    const fmtCcy = (v: number) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
      if (abs >= 1_000_000)     return `${(v / 1_000_000).toFixed(2)}M`;
      return formatNumber(v, 2);
    };

    const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${formatNumber(v, 1)}%`;

    const results: ResultCard[] = [];

    // 1. Intrinsic Value Per Share
    {
      let interp: InterpretationType = 'neutral';
      let cEn = ''; let cId = '';
      if (intrinsic > 0) {
        interp = 'neutral';
        cEn = `DCF value over 10 yrs at ${formatNumber(n('inflationRate'), 1)}% discount rate.`;
        cId = `Nilai DCF selama 10 tahun pada tingkat diskonto ${formatNumber(n('inflationRate'), 1)}%.`;
      } else {
        interp = 'poor';
        cEn = 'Negative intrinsic value — check inputs.';
        cId = 'Nilai intrinsik negatif — periksa input.';
      }
      results.push({
        label:      'Intrinsic Value Per Share',
        labelId:    'Nilai Intrinsik Per Saham',
        value:      intrinsic,
        formatted:  fmtCcy(intrinsic),
        interpretation: interp,
        commentEn: cEn,
        commentId: cId,
        formula:   'Σ [EPS × (1+g)ⁿ ÷ (1+r)ⁿ] + Terminal Value',
        descEn:    'Estimated intrinsic value using EPS-based DCF. Projects EPS for 10 years using the growth rate, then discounts all future earnings back to the present using the inflation rate as the discount rate. A terminal value is added assuming zero growth after year 10.',
        descId:    'Estimasi nilai intrinsik menggunakan DCF berbasis EPS. Memproyeksikan EPS selama 10 tahun menggunakan tingkat pertumbuhan, lalu mendiskontokan semua laba masa depan ke masa kini menggunakan tingkat inflasi sebagai tingkat diskonto. Nilai terminal ditambahkan dengan asumsi pertumbuhan nol setelah tahun ke-10.',
        benchmarkEn: 'Compare against current stock price for a margin of safety.',
        benchmarkId: 'Bandingkan dengan harga saham saat ini untuk mengetahui margin of safety.',
      });
    }

    // 2. Book Value Per Share
    {
      let interp: InterpretationType = 'neutral';
      let cEn = ''; let cId = '';
      if (bvps > 0) {
        cEn = 'Net assets attributable to each share.';
        cId = 'Aset bersih yang dapat diatribusikan ke setiap saham.';
        interp = 'neutral';
      }
      results.push({
        label:      'Book Value Per Share (BVPS)',
        labelId:    'Nilai Buku Per Saham (BVPS)',
        value:      bvps,
        formatted:  fmtCcy(bvps),
        interpretation: interp,
        commentEn: cEn,
        commentId: cId,
        formula:   'Total Equity ÷ Shares Outstanding',
        descEn:    'The net asset value per share — total equity divided by outstanding shares. Represents the accounting value of the company on a per-share basis.',
        descId:    'Nilai aset bersih per saham — total ekuitas dibagi jumlah saham beredar. Mencerminkan nilai akuntansi perusahaan per saham.',
        benchmarkEn: 'A P/B ratio below 1× means the stock trades below book value.',
        benchmarkId: 'Rasio P/B di bawah 1× berarti saham diperdagangkan di bawah nilai buku.',
      });
    }

    // 3. Margin of Safety (optional – only if currentPrice given)
    if (hasPriceInput && intrinsic !== 0) {
      const mos = ((intrinsic - price) / intrinsic) * 100;
      let interp: InterpretationType = 'neutral';
      let cEn = ''; let cId = '';
      if (mos >= 20) {
        interp = 'good';
        cEn = `~${formatNumber(mos, 1)}% discount to intrinsic value — strong margin of safety.`;
        cId = `~${formatNumber(mos, 1)}% diskon terhadap nilai intrinsik — margin of safety kuat.`;
      } else if (mos >= 5) {
        interp = 'average';
        cEn = `Modest discount of ~${formatNumber(mos, 1)}% — limited safety cushion.`;
        cId = `Diskon moderat ~${formatNumber(mos, 1)}% — bantalan keamanan terbatas.`;
      } else if (mos >= -5) {
        interp = 'average';
        cEn = 'Trading near intrinsic value — fairly valued.';
        cId = 'Diperdagangkan mendekati nilai intrinsik — nilai wajar.';
      } else {
        interp = 'poor';
        cEn = `Trading ~${formatNumber(Math.abs(mos), 1)}% above intrinsic value.`;
        cId = `Diperdagangkan ~${formatNumber(Math.abs(mos), 1)}% di atas nilai intrinsik.`;
      }
      results.push({
        label:     'Margin of Safety',
        labelId:   'Margin of Safety',
        value:     mos,
        formatted: fmtPct(mos),
        interpretation: interp,
        commentEn: cEn,
        commentId: cId,
        formula:   '(Intrinsic Value − Current Price) ÷ Intrinsic Value × 100',
        descEn:    'The percentage discount between the estimated intrinsic value and the current stock price. A positive margin of safety means the stock trades below its estimated intrinsic value, providing a buffer against estimation errors.',
        descId:    'Persentase diskon antara nilai intrinsik yang diestimasi dan harga saham saat ini. Margin of safety yang positif berarti saham diperdagangkan di bawah nilai intrinsiknya, memberikan penyangga terhadap kesalahan estimasi.',
        benchmarkEn: 'Excellent: ≥ 20%. Modest: 5–20%. Fairly valued: ±5%. Overvalued: < −5%.',
        benchmarkId: 'Sangat baik: ≥ 20%. Moderat: 5–20%. Wajar: ±5%. Overvalued: < −5%.',
        optional: true,
      });
    }

    // 4. Verdict (optional – only if currentPrice given)
    if (hasPriceInput && intrinsic !== 0) {
      const ratio = price / intrinsic;
      let interp: InterpretationType = 'neutral';
      let label = ''; let labelId = ''; let cEn = ''; let cId = '';
      if (ratio < 0.8) {
        interp = 'good'; label = 'Undervalued'; labelId = 'Undervalued';
        cEn = `Stock price is ${formatNumber((1 - ratio) * 100, 1)}% below intrinsic value.`;
        cId = `Harga saham ${formatNumber((1 - ratio) * 100, 1)}% di bawah nilai intrinsik.`;
      } else if (ratio <= 1.05) {
        interp = 'average'; label = 'Fairly Valued'; labelId = 'Nilai Wajar';
        cEn = 'Stock is trading close to its estimated intrinsic value.';
        cId = 'Saham diperdagangkan mendekati nilai intrinsik yang diestimasi.';
      } else {
        interp = 'poor'; label = 'Overvalued'; labelId = 'Overvalued';
        cEn = `Stock price is ${formatNumber((ratio - 1) * 100, 1)}% above intrinsic value.`;
        cId = `Harga saham ${formatNumber((ratio - 1) * 100, 1)}% di atas nilai intrinsik.`;
      }
      results.push({
        label:     label,
        labelId:   labelId,
        value:     ratio,
        formatted: language === 'en' ? label : labelId,
        interpretation: interp,
        commentEn: cEn,
        commentId: cId,
        formula:   'Current Price ÷ Intrinsic Value',
        descEn:    'A summary verdict comparing the current stock price against the DCF-derived intrinsic value. Undervalued means the market price is below estimated intrinsic value, Fairly Valued means it trades near intrinsic value, and Overvalued means the price exceeds intrinsic value.',
        descId:    'Kesimpulan yang membandingkan harga saham saat ini dengan nilai intrinsik dari DCF. Undervalued berarti harga pasar di bawah nilai intrinsik, Nilai Wajar berarti diperdagangkan mendekati nilai intrinsik, dan Overvalued berarti harga melebihi nilai intrinsik.',
        benchmarkEn: 'Based on price-to-intrinsic-value ratio: < 0.80× Undervalued, 0.80–1.05× Fair, > 1.05× Overvalued.',
        benchmarkId: 'Berdasarkan rasio harga terhadap nilai intrinsik: < 0,80× Undervalued, 0,80–1,05× Wajar, > 1,05× Overvalued.',
        optional: true,
      });
    }

    return results;
  };

  const results = requiredFilled ? computeResults() : [];

  const toggleInfo = (key: string) =>
    setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

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

  const inputs = [
    { id: 'currentEps',        en: 'Current EPS (Annualized)',  id_: 'EPS Saat Ini (Tahunan)',  subtitleEn: 'Earnings per share for the trailing 12 months',   subtitleId: 'Laba per saham untuk 12 bulan terakhir', required: true  },
    { id: 'totalEquity',       en: 'Total Equity',              id_: 'Total Ekuitas',           subtitleEn: "Total shareholders' equity from the balance sheet", subtitleId: 'Total ekuitas pemegang saham dari neraca',  required: true  },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',        id_: 'Jumlah Saham Beredar',    subtitleEn: 'Total issued shares currently held by investors',   subtitleId: 'Total saham yang beredar saat ini',        required: true  },
    { id: 'growthRate',        en: 'EPS Growth Rate — CAGR (%)',id_: 'Pertumbuhan EPS — CAGR (%)', subtitleEn: 'Expected annual EPS growth rate over 10 years',  subtitleId: 'Proyeksi pertumbuhan EPS tahunan selama 10 tahun', required: true },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)', id_: 'Tingkat Diskonto / Inflasi (%)', subtitleEn: 'Required return rate used to discount future earnings', subtitleId: 'Tingkat imbal hasil yang dibutuhkan untuk mendiskontokan laba masa depan', required: true },
    { id: 'currentPrice',      en: 'Current Stock Price',       id_: 'Harga Saham Saat Ini',    subtitleEn: 'Optional — enables Margin of Safety and Verdict',  subtitleId: 'Opsional — mengaktifkan Margin of Safety dan Verdict', required: false },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Fair Value'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {catT?.description ?? 'Estimate the intrinsic value of a stock using fundamental valuation models.'}
        </p>
      </motion.div>

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
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-semibold text-foreground/60">
                  {language === 'en' ? 'Fill in all required inputs' : 'Isi semua input yang diperlukan'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Results will appear once EPS, Equity, Shares, Growth Rate, and Discount Rate are entered.'
                    : 'Hasil akan muncul setelah EPS, Ekuitas, Saham, Pertumbuhan, dan Tingkat Diskonto diisi.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {results.map((result, i) => {
                const label = language === 'en' ? result.label : result.labelId;
                const color = valueColor[result.interpretation];
                const infoKey = result.label;
                const isInfoOpen = !!openInfo[infoKey];

                return (
                  <motion.div
                    key={result.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground leading-tight">{label}</span>
                          {result.optional && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                              {language === 'en' ? 'optional' : 'opsional'}
                            </span>
                          )}
                        </div>
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
                      <p className={cn('text-xs mt-0.5', color)}>
                        {language === 'id' ? result.commentId : result.commentEn}
                      </p>
                    </div>

                    <AnimatePresence initial={false}>
                      {isInfoOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50">
                            <span className="inline-flex text-xs font-mono px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
                              {result.formula}
                            </span>
                            <p className="text-sm text-foreground leading-relaxed">
                              {language === 'en' ? result.descEn : result.descId}
                            </p>
                            <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-2.5">
                              <Target className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-sky-700 dark:text-sky-400 font-medium leading-relaxed">
                                {language === 'en' ? result.benchmarkEn : result.benchmarkId}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── INPUTS column ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {language === 'en' ? 'Inputs' : 'Input'}
            </p>
            <button
              onClick={() => setVals({ ...INITIAL })}
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
