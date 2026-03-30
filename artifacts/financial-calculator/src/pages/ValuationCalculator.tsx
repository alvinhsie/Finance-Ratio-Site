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

function fmtX(val: number): string {
  return `${formatNumber(val, 2)}x`;
}

function fmtPct(val: number): string {
  return `${formatNumber(val, 2)}%`;
}

function fmtLargeNumber(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000_000) return `${sign}${formatNumber(abs / 1_000_000_000_000, 2)}T`;
  if (abs >= 1_000_000_000)     return `${sign}${formatNumber(abs / 1_000_000_000, 2)}B`;
  if (abs >= 1_000_000)         return `${sign}${formatNumber(abs / 1_000_000, 2)}M`;
  if (abs >= 1_000)             return `${sign}${formatNumber(abs / 1_000, 2)}K`;
  return `${sign}${formatNumber(abs, 2)}`;
}

const EMPTY: Record<string, string> = {
  marketPrice: '0', eps: '0', bvps: '0', sharesOutstanding: '0',
  totalDebt: '0', cashEquivalents: '0', ebitda: '0', dividendPerShare: '0',
};

export function ValuationCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...EMPTY });
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const marketCap = n('marketPrice') * n('sharesOutstanding');
  const ev = marketCap + n('totalDebt') - n('cashEquivalents');

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('marketPrice') && has('eps') && n('eps') !== 0;
      const val = hasInputs ? n('marketPrice') / n('eps') : null;
      let interp: InterpretationType = 'neutral';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 0)        { interp = 'poor';    en = 'Negative P/E — company is reporting a loss.'; id = 'P/E negatif — perusahaan melaporkan kerugian.'; cEn = 'Negative — company has no earnings.'; cId = 'Negatif — perusahaan tidak menghasilkan laba.'; }
        else if (val < 10)  { interp = 'neutral'; en = 'Low P/E — may be undervalued or facing headwinds.'; id = 'P/E rendah — mungkin undervalued atau menghadapi tantangan.'; cEn = 'Low — could be undervalued or a value trap.'; cId = 'Rendah — mungkin undervalued atau perangkap nilai.'; }
        else if (val <= 20) { interp = 'good';    en = 'Reasonable valuation — typical for most profitable companies.'; id = 'Valuasi wajar — umum untuk kebanyakan perusahaan profitable.'; cEn = 'Reasonable valuation relative to earnings.'; cId = 'Valuasi wajar relatif terhadap laba.'; }
        else if (val <= 30) { interp = 'average'; en = 'Above average — market expects strong future growth.'; id = 'Di atas rata-rata — pasar mengharapkan pertumbuhan masa depan yang kuat.'; cEn = 'Elevated — market pricing in strong growth.'; cId = 'Tinggi — pasar memperhitungkan pertumbuhan kuat.'; }
        else                { interp = 'poor';    en = 'High P/E — stock may be expensive relative to earnings.'; id = 'P/E tinggi — saham mungkin mahal relatif terhadap laba.'; cEn = 'Expensive relative to current earnings.'; cId = 'Mahal relatif terhadap laba saat ini.'; }
      }
      return {
        label: 'P/E Ratio (PER)', labelId: 'Rasio P/E (PER)',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: "Price-to-Earnings compares the stock price to the company's earnings per share. A lower P/E may indicate better value.",
          descId: 'Price-to-Earnings membandingkan harga saham dengan laba per saham. P/E lebih rendah mungkin menunjukkan nilai yang lebih baik.',
          benchmarkEn: 'Low: < 10×. Reasonable: 10–20×. Above avg: 20–30×. Expensive: > 30×',
          benchmarkId: 'Rendah: < 10×. Wajar: 10–20×. Di atas rata-rata: 20–30×. Mahal: > 30×',
          direction: 'range',
          formula: 'Market Price ÷ EPS',
        },
      };
    })(),
    (() => {
      const hasInputs = has('marketPrice') && has('bvps') && n('bvps') !== 0;
      const val = hasInputs ? n('marketPrice') / n('bvps') : null;
      let interp: InterpretationType = 'neutral';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 1)        { interp = 'neutral'; en = 'Below book value — potentially undervalued or facing losses.'; id = 'Di bawah nilai buku — mungkin undervalued atau menghadapi kerugian.'; cEn = 'Trading below book value — check fundamentals.'; cId = 'Diperdagangkan di bawah nilai buku — periksa fundamental.'; }
        else if (val <= 3)  { interp = 'good';    en = 'Fair value range — market reasonably values the company.'; id = 'Rentang nilai wajar — pasar menilai perusahaan secara wajar.'; cEn = 'Fair value — reasonably priced relative to book.'; cId = 'Nilai wajar — harga wajar relatif terhadap nilai buku.'; }
        else                { interp = 'poor';    en = 'High P/B — stock trades at a large premium to book value.'; id = 'P/B tinggi — saham diperdagangkan jauh di atas nilai buku.'; cEn = 'Premium valuation — trading well above book value.'; cId = 'Valuasi premium — diperdagangkan jauh di atas nilai buku.'; }
      }
      return {
        label: 'P/B Ratio (PBV)', labelId: 'Rasio P/B (PBV)',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: "Price-to-Book compares market price to book value per share. A ratio below 1 suggests the stock may be undervalued.",
          descId: 'Price-to-Book membandingkan harga pasar dengan nilai buku per saham. Rasio di bawah 1 menunjukkan saham mungkin undervalued.',
          benchmarkEn: 'Below book: < 1×. Fair value: 1–3×. Premium: > 3×',
          benchmarkId: 'Di bawah buku: < 1×. Nilai wajar: 1–3×. Premium: > 3×',
          direction: 'range',
          formula: 'Market Price ÷ BVPS',
        },
      };
    })(),
    (() => {
      const hasInputs = has('marketPrice') && has('sharesOutstanding') && has('totalDebt') && has('cashEquivalents');
      const val = hasInputs ? ev : null;
      let interp: InterpretationType = 'neutral';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 0) { interp = 'neutral'; en = `Total enterprise value of ${fmtLargeNumber(val)} — includes debt net of cash.`; id = `Total nilai perusahaan sebesar ${fmtLargeNumber(val)} — termasuk utang bersih dari kas.`; cEn = `Total acquisition value of the business.`; cId = 'Total nilai akuisisi bisnis.'; }
        else         { interp = 'poor'; en = 'Negative EV — cash exceeds market cap plus debt.'; id = 'EV negatif — kas melebihi kapitalisasi pasar ditambah utang.'; cEn = 'Negative EV — cash-rich relative to market cap.'; cId = 'EV negatif — kaya kas relatif terhadap kapitalisasi pasar.'; }
      }
      return {
        label: 'Enterprise Value (EV)', labelId: 'Nilai Perusahaan (EV)',
        value: val, formatted: val !== null ? fmtLargeNumber(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'The total value of a company including equity and debt, minus cash. Represents what it would cost to acquire the entire business.',
          descId: 'Total nilai perusahaan termasuk ekuitas dan utang, dikurangi kas. Mewakili biaya untuk mengakuisisi seluruh bisnis.',
          benchmarkEn: 'EV = Market Cap + Total Debt − Cash & Equivalents',
          benchmarkId: 'EV = Kapitalisasi Pasar + Total Utang − Kas & Setara Kas',
          direction: 'lower',
          formula: 'Market Cap + Total Debt − Cash & Equivalents',
        },
      };
    })(),
    (() => {
      const hasInputs = has('marketPrice') && has('sharesOutstanding') && has('totalDebt') && has('cashEquivalents') && has('ebitda') && n('ebitda') !== 0;
      const val = hasInputs ? ev / n('ebitda') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 8)        { interp = 'good';    en = 'Low EV/EBITDA — may indicate an undervalued company.'; id = 'EV/EBITDA rendah — mungkin menunjukkan perusahaan undervalued.'; cEn = 'Attractively valued relative to earnings capacity.'; cId = 'Valuasi menarik relatif terhadap kapasitas laba.'; }
        else if (val <= 15) { interp = 'average'; en = 'Fair multiple — typical for most sectors.'; id = 'Kelipatan wajar — umum untuk kebanyakan sektor.'; cEn = 'Fair valuation for most industries.'; cId = 'Valuasi wajar untuk sebagian besar industri.'; }
        else                { interp = 'poor';    en = 'High EV/EBITDA — company may be expensive relative to earnings.'; id = 'EV/EBITDA tinggi — perusahaan mungkin mahal relatif terhadap laba.'; cEn = 'Expensive — high valuation relative to earnings.'; cId = 'Mahal — valuasi tinggi relatif terhadap laba.'; }
      }
      return {
        label: 'EV/EBITDA', labelId: 'EV/EBITDA',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Compares Enterprise Value to EBITDA. A lower multiple suggests better value. Useful for comparing companies across capital structures.',
          descId: 'Membandingkan Nilai Perusahaan dengan EBITDA. Kelipatan lebih rendah menunjukkan nilai lebih baik.',
          benchmarkEn: 'Cheap: < 8×. Fair: 8–15×. Expensive: > 15×',
          benchmarkId: 'Murah: < 8×. Wajar: 8–15×. Mahal: > 15×',
          direction: 'lower',
          formula: 'Enterprise Value ÷ EBITDA',
        },
      };
    })(),
    (() => {
      const hasInputs = has('dividendPerShare') && has('marketPrice') && n('marketPrice') !== 0;
      const val = hasInputs ? (n('dividendPerShare') / n('marketPrice')) * 100 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val >= 4)       { interp = 'good';    en = 'High yield — strong income return from dividends.'; id = 'Yield tinggi — imbal hasil pendapatan kuat dari dividen.'; cEn = 'High dividend income relative to share price.'; cId = 'Pendapatan dividen tinggi relatif terhadap harga saham.'; }
        else if (val >= 2)  { interp = 'average'; en = 'Moderate yield — decent income for income-focused investors.'; id = 'Yield sedang — pendapatan yang layak untuk investor yang fokus pada pendapatan.'; cEn = 'Moderate dividend — decent income for investors.'; cId = 'Dividen sedang — pendapatan yang layak bagi investor.'; }
        else if (val > 0)   { interp = 'poor';    en = 'Low yield — minimal income return from dividends.'; id = 'Yield rendah — imbal hasil pendapatan minimal dari dividen.'; cEn = 'Low dividend income relative to share price.'; cId = 'Pendapatan dividen rendah relatif terhadap harga saham.'; }
        else                { interp = 'neutral'; en = 'No dividend — company does not pay a dividend.'; id = 'Tidak ada dividen — perusahaan tidak membayar dividen.'; cEn = 'No dividend paid.'; cId = 'Tidak ada dividen yang dibayarkan.'; }
      }
      return {
        label: 'Dividend Yield', labelId: 'Imbal Hasil Dividen',
        value: val, formatted: val !== null ? fmtPct(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Annual dividend per share as a percentage of the current share price. Reflects the income return on a stock investment.',
          descId: 'Dividen tahunan per saham sebagai persentase harga saham saat ini. Mencerminkan imbal hasil pendapatan dari investasi saham.',
          benchmarkEn: 'High: ≥ 4%. Moderate: 2–4%. Low: < 2%',
          benchmarkId: 'Tinggi: ≥ 4%. Sedang: 2–4%. Rendah: < 2%',
          direction: 'higher',
          formula: '(Dividend Per Share ÷ Market Price) × 100',
        },
      };
    })(),
  ];

  const inputs = [
    { id: 'marketPrice',      en: 'Market Price Per Share',    id_: 'Harga Pasar Per Saham',    subtitleEn: 'Current trading price of one share',                           subtitleId: 'Harga perdagangan satu saham saat ini' },
    { id: 'eps',              en: 'Earnings Per Share (EPS)',   id_: 'Laba Per Saham (EPS)',     subtitleEn: 'Net income divided by shares outstanding',                     subtitleId: 'Laba bersih dibagi jumlah saham beredar' },
    { id: 'bvps',             en: 'Book Value Per Share (BVPS)',id_: 'Nilai Buku Per Saham',     subtitleEn: 'Equity attributable to each share',                            subtitleId: 'Ekuitas yang dapat diatribusikan ke setiap saham' },
    { id: 'sharesOutstanding',en: 'Shares Outstanding',        id_: 'Saham Beredar',            subtitleEn: 'Total number of shares issued by the company',                 subtitleId: 'Jumlah total saham yang diterbitkan perusahaan' },
    { id: 'totalDebt',        en: 'Total Debt',                id_: 'Total Utang',              subtitleEn: 'Short-term and long-term interest-bearing borrowings',          subtitleId: 'Pinjaman berbunga jangka pendek dan jangka panjang' },
    { id: 'cashEquivalents',  en: 'Cash & Cash Equivalents',   id_: 'Kas & Setara Kas',         subtitleEn: 'Cash on hand and short-term liquid deposits',                  subtitleId: 'Kas di tangan dan deposito cair jangka pendek' },
    { id: 'ebitda',           en: 'EBITDA',                    id_: 'EBITDA',                   subtitleEn: 'Earnings before interest, taxes, depreciation & amortization', subtitleId: 'Laba sebelum bunga, pajak, depresiasi & amortisasi' },
    { id: 'dividendPerShare', en: 'Dividend Per Share',        id_: 'Dividen Per Saham',        subtitleEn: 'Annual dividend paid per share',                               subtitleId: 'Dividen tahunan yang dibayarkan per saham' },
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

  const catT = t.categories['valuation' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Valuation'}
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
