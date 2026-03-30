import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BookOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import { NumericInput } from '@/components/ui/NumericInput';

const INITIAL: Record<string, string> = {
  currentEps:        '',
  totalEquity:       '',
  sharesOutstanding: '',
  growthRate:        '',
  inflationRate:     '',
  currentPrice:      '',
};

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
  const [vals, setVals] = useState<Record<string, string>>({ ...INITIAL });

  const n = (k: string) => parseFloat(vals[k] || '0') || 0;
  const isFilled = (k: string) => vals[k].trim() !== '';

  const requiredFilled =
    isFilled('currentEps') &&
    isFilled('totalEquity') &&
    isFilled('sharesOutstanding') &&
    isFilled('growthRate') &&
    isFilled('inflationRate') &&
    n('inflationRate') > 0 &&
    n('sharesOutstanding') > 0;

  const hasPriceInput = isFilled('currentPrice') && n('currentPrice') > 0;

  // ── DCF Computation ─────────────────────────────────────────────────
  // Formula: Intrinsic Value = (Total EPS + BV@Yr10) ÷ (1+Inflation)¹⁰
  // Total EPS = Σ EPS × (1+CAGR)ⁱ for i=1→10
  // BV@Yr10   = current BVPS (simplified)
  const compute = () => {
    const eps   = n('currentEps');
    const g     = n('growthRate') / 100;
    const r     = n('inflationRate') / 100;
    const bvps  = n('totalEquity') / n('sharesOutstanding');
    const price = n('currentPrice');

    // Cumulative projected EPS (undiscounted)
    let totalEps = 0;
    for (let i = 1; i <= 10; i++) totalEps += eps * Math.pow(1 + g, i);

    const discountFactor  = Math.pow(1 + r, 10);
    const discountedEps   = totalEps / discountFactor;
    const intrinsic       = (totalEps + bvps) / discountFactor;

    const upside = hasPriceInput && price > 0
      ? ((intrinsic - price) / price) * 100
      : null;

    const mos = hasPriceInput && intrinsic !== 0
      ? ((intrinsic - price) / intrinsic) * 100
      : null;

    return { bvps, totalEps, discountedEps, intrinsic, upside, mos };
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

  const inputs = [
    { id: 'currentEps',        en: 'Current EPS (Annualized)',       id_: 'EPS Saat Ini (Tahunan)',           subtitleEn: 'Earnings per share for the trailing 12 months',              subtitleId: 'Laba per saham untuk 12 bulan terakhir' },
    { id: 'totalEquity',       en: 'Total Equity',                   id_: 'Total Ekuitas',                   subtitleEn: "Total shareholders' equity from the balance sheet",           subtitleId: 'Total ekuitas pemegang saham dari neraca' },
    { id: 'sharesOutstanding', en: 'Shares Outstanding',             id_: 'Jumlah Saham Beredar',             subtitleEn: 'Total issued shares currently held by investors',             subtitleId: 'Total saham yang beredar saat ini' },
    { id: 'growthRate',        en: 'EPS Growth Rate — CAGR (%)',     id_: 'Pertumbuhan EPS — CAGR (%)',       subtitleEn: 'Expected annual EPS growth rate over 10 years',               subtitleId: 'Proyeksi pertumbuhan EPS tahunan selama 10 tahun' },
    { id: 'inflationRate',     en: 'Discount Rate / Inflation (%)',  id_: 'Tingkat Diskonto / Inflasi (%)',   subtitleEn: 'Required return rate used to discount future earnings',       subtitleId: 'Tingkat imbal hasil yang dibutuhkan untuk mendiskontokan laba masa depan' },
    { id: 'currentPrice',      en: 'Current Stock Price',            id_: 'Harga Saham Saat Ini',             subtitleEn: 'Optional — enables Upside/Downside and Margin of Safety',   subtitleId: 'Opsional — mengaktifkan Upside/Downside dan Margin of Safety' },
  ];

  // Color helpers
  const signColor = (v: number | null) => {
    if (v === null) return '';
    return v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Fair Value'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {language === 'en'
            ? 'EPS-based Discounted Cash Flow — estimates intrinsic value from projected earnings.'
            : 'DCF Berbasis EPS — estimasi nilai intrinsik dari proyeksi laba.'}
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
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-semibold text-foreground/60">
                  {language === 'en' ? 'Fill in all required inputs' : 'Isi semua input yang diperlukan'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Results appear once EPS, Equity, Shares, Growth Rate, and Discount Rate are entered.'
                    : 'Hasil muncul setelah EPS, Ekuitas, Saham, Pertumbuhan, dan Tingkat Diskonto diisi.'}
                </p>
              </div>
            </motion.div>
          ) : calc && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              {/* ── Main results card ── */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">

                {/* Row: Book Value / Share */}
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

                {/* Row: Total EPS (10 Years) */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {language === 'en' ? 'Total EPS (10 Years)' : 'Total EPS (10 Tahun)'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'en' ? 'Cumulative earnings per share over 10 years' : 'Akumulasi laba per saham selama 10 tahun'}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                    {fmtNum(calc.totalEps)}
                  </span>
                </div>

                <div className="border-t border-border/60 mx-4" />

                {/* Row: Discounted Total EPS */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {language === 'en' ? 'Discounted Total EPS' : 'Total EPS Terdiskonto'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'en'
                        ? `Total EPS discounted by ${fmtNum(n('inflationRate'), 1)}% inflation`
                        : `Total EPS didiskontokan oleh inflasi ${fmtNum(n('inflationRate'), 1)}%`}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground shrink-0 ml-4">
                    {fmtNum(calc.discountedEps)}
                  </span>
                </div>

                <div className="border-t border-border/60 mx-4" />

                {/* Row: Intrinsic Value — highlighted */}
                <div className="flex items-center justify-between px-4 py-4 bg-primary/5 dark:bg-primary/10">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {language === 'en' ? 'Intrinsic Value' : 'Nilai Intrinsik'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'en' ? 'Inflation-adjusted fair value per share' : 'Nilai wajar per saham yang disesuaikan inflasi'}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold tabular-nums text-primary shrink-0 ml-4">
                    {fmtNum(calc.intrinsic)}
                  </span>
                </div>

                {/* Row: Upside / Downside — only if price given */}
                {calc.upside !== null && (
                  <>
                    <div className="border-t border-border/60 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Upside / Downside' : 'Potensi Naik / Turun'}
                      </p>
                      <div className={cn('flex items-center gap-1 shrink-0 ml-4', signColor(calc.upside))}>
                        {calc.upside >= 0
                          ? <TrendingUp className="w-4 h-4" />
                          : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-bold tabular-nums">
                          {fmtPct(calc.upside)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Row: Margin of Safety — only if price given */}
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

              {/* ── How it works card ── */}
              <div className="bg-muted/50 border border-border rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground">
                    {language === 'en' ? 'How it works' : 'Cara kerjanya'}
                  </p>
                </div>
                <div className="space-y-1">
                  {[
                    'Book Value/Share = Total Equity ÷ Shares',
                    'Total EPS = Σ EPS × (1+CAGR)ⁱ  for i=1→10',
                    'Intrinsic Value = (Total EPS + BV/Share) ÷ (1+Inflation)¹⁰',
                    ...(calc.upside !== null ? ['Upside/Downside = (Intrinsic − Price) ÷ Price × 100'] : []),
                    ...(calc.mos !== null    ? ['Margin of Safety = (Intrinsic − Price) ÷ Intrinsic × 100'] : []),
                  ].map(line => (
                    <p key={line} className="text-xs text-muted-foreground font-mono leading-relaxed">{line}</p>
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
            <button
              onClick={() => setVals({ ...INITIAL })}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              {language === 'en' ? 'Clear' : 'Hapus'}
            </button>
          </div>

          <div className="space-y-3">
            {inputs.map((inp, i) => {
              const label    = language === 'en' ? inp.en   : inp.id_;
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
