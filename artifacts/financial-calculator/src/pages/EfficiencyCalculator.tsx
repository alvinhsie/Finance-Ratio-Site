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

function fmtDays(val: number): string {
  return `${formatNumber(val, 1)} days`;
}

const EMPTY: Record<string, string> = {
  totalRevenue: '0', accountsReceivable: '0', currentAssets: '0',
  currentLiabilities: '0', netFixedAssets: '0',
};

export function EfficiencyCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...EMPTY });
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => setOpenInfo(prev => ({ ...prev, [key]: !prev[key] }));

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('totalRevenue') && has('accountsReceivable') && n('accountsReceivable') !== 0;
      const val = hasInputs ? n('totalRevenue') / n('accountsReceivable') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 8)       { interp = 'good';    en = 'Efficient — receivables are collected quickly.'; id = 'Efisien — piutang dikumpulkan dengan cepat.'; cEn = 'Collecting receivables quickly and efficiently.'; cId = 'Mengumpulkan piutang dengan cepat dan efisien.'; }
        else if (val >= 4) { interp = 'average'; en = 'Moderate — receivable collection is adequate.'; id = 'Sedang — pengumpulan piutang memadai.'; cEn = 'Moderate collection speed — room to improve.'; cId = 'Kecepatan penagihan sedang — masih bisa ditingkatkan.'; }
        else               { interp = 'poor';    en = 'Slow — receivables are taking too long to collect.'; id = 'Lambat — piutang terlalu lama dikumpulkan.'; cEn = 'Slow collection — receivables are building up.'; cId = 'Penagihan lambat — piutang menumpuk.'; }
      }
      return {
        label: 'Receivables Turnover', labelId: 'Perputaran Piutang',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'How many times per year a company collects its average accounts receivable. Higher means faster cash collection.',
          descId: 'Berapa kali per tahun perusahaan mengumpulkan rata-rata piutangnya. Lebih tinggi berarti pengumpulan kas lebih cepat.',
          benchmarkEn: 'Fast: > 8×. Moderate: 4–8×. Slow: < 4×',
          benchmarkId: 'Cepat: > 8×. Sedang: 4–8×. Lambat: < 4×',
          direction: 'higher',
          formula: 'Revenue ÷ Accounts Receivable',
        },
      };
    })(),
    (() => {
      const hasInputs = has('accountsReceivable') && has('totalRevenue') && n('totalRevenue') !== 0;
      const val = hasInputs ? (n('accountsReceivable') / n('totalRevenue')) * 365 : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val < 30)       { interp = 'good';    en = 'Excellent — customers pay within 30 days on average.'; id = 'Sangat baik — pelanggan membayar dalam rata-rata 30 hari.'; cEn = 'Customers pay quickly — strong cash conversion.'; cId = 'Pelanggan membayar cepat — konversi kas kuat.'; }
        else if (val <= 60) { interp = 'average'; en = 'Acceptable — typical payment window for most businesses.'; id = 'Dapat diterima — jendela pembayaran umum untuk sebagian besar bisnis.'; cEn = 'Acceptable — typical payment cycle.'; cId = 'Dapat diterima — siklus pembayaran yang umum.'; }
        else                { interp = 'poor';    en = 'Slow — customers are taking too long to pay.'; id = 'Lambat — pelanggan terlalu lama membayar.'; cEn = 'Customers take too long to pay — cash is tied up.'; cId = 'Pelanggan terlalu lama membayar — kas tertahan.'; }
      }
      return {
        label: 'Days Sales Outstanding', labelId: 'Hari Penjualan Beredar',
        value: val, formatted: val !== null ? fmtDays(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'The average number of days it takes to collect payment after a sale. Lower means faster cash collection.',
          descId: 'Rata-rata hari yang dibutuhkan untuk mengumpulkan pembayaran setelah penjualan. Lebih rendah berarti pengumpulan kas lebih cepat.',
          benchmarkEn: 'Fast: < 30 days. Acceptable: 30–60 days. Slow: > 60 days',
          benchmarkId: 'Cepat: < 30 hari. Dapat diterima: 30–60 hari. Lambat: > 60 hari',
          direction: 'lower',
          formula: '(Accounts Receivable ÷ Revenue) × 365',
        },
      };
    })(),
    (() => {
      const workingCapital = n('currentAssets') - n('currentLiabilities');
      const hasInputs = has('totalRevenue') && has('currentAssets') && has('currentLiabilities') && workingCapital !== 0;
      const val = hasInputs ? n('totalRevenue') / workingCapital : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 6)       { interp = 'good';    en = 'Highly efficient — generating strong revenue per unit of working capital.'; id = 'Sangat efisien — menghasilkan pendapatan kuat per unit modal kerja.'; cEn = 'Working capital is generating strong revenue.'; cId = 'Modal kerja menghasilkan pendapatan yang kuat.'; }
        else if (val >= 2) { interp = 'average'; en = 'Adequate — working capital is being used reasonably well.'; id = 'Memadai — modal kerja digunakan dengan cukup baik.'; cEn = 'Adequate use of working capital.'; cId = 'Penggunaan modal kerja yang memadai.'; }
        else if (val > 0)  { interp = 'poor';    en = 'Low — working capital is not generating enough revenue.'; id = 'Rendah — modal kerja tidak menghasilkan pendapatan yang cukup.'; cEn = 'Low efficiency — working capital underperforming.'; cId = 'Efisiensi rendah — modal kerja berkinerja buruk.'; }
        else               { interp = 'poor';    en = 'Negative working capital — liabilities exceed current assets.'; id = 'Modal kerja negatif — liabilitas melebihi aset lancar.'; cEn = 'Negative working capital — a concerning signal.'; cId = 'Modal kerja negatif — sinyal yang perlu diwaspadai.'; }
      }
      return {
        label: 'Working Capital Turnover', labelId: 'Perputaran Modal Kerja',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures how efficiently a company uses its working capital to generate revenue. Higher means better operational efficiency.',
          descId: 'Mengukur seberapa efisien perusahaan menggunakan modal kerjanya untuk menghasilkan pendapatan.',
          benchmarkEn: 'High: > 6×. Adequate: 2–6×. Low: < 2×',
          benchmarkId: 'Tinggi: > 6×. Memadai: 2–6×. Rendah: < 2×',
          direction: 'higher',
          formula: 'Revenue ÷ (Current Assets − Current Liabilities)',
        },
      };
    })(),
    (() => {
      const hasInputs = has('totalRevenue') && has('netFixedAssets') && n('netFixedAssets') !== 0;
      const val = hasInputs ? n('totalRevenue') / n('netFixedAssets') : null;
      let interp: InterpretationType = 'average';
      let en = ''; let id = ''; let cEn = ''; let cId = '';
      if (val !== null) {
        if (val > 5)       { interp = 'good';    en = 'Excellent — fixed assets are generating strong revenue.'; id = 'Sangat baik — aset tetap menghasilkan pendapatan yang kuat.'; cEn = 'Fixed assets are highly productive.'; cId = 'Aset tetap sangat produktif.'; }
        else if (val >= 2) { interp = 'average'; en = 'Moderate — fixed assets are generating reasonable revenue.'; id = 'Sedang — aset tetap menghasilkan pendapatan yang wajar.'; cEn = 'Moderate productivity from fixed assets.'; cId = 'Produktivitas aset tetap yang sedang.'; }
        else               { interp = 'poor';    en = 'Low — fixed assets are underperforming relative to revenue.'; id = 'Rendah — aset tetap berkinerja buruk relatif terhadap pendapatan.'; cEn = 'Fixed assets are underutilized.'; cId = 'Aset tetap kurang dimanfaatkan.'; }
      }
      return {
        label: 'Fixed Asset Turnover', labelId: 'Perputaran Aset Tetap',
        value: val, formatted: val !== null ? fmtX(val) : '—',
        interpretation: interp, interpretationText: en, interpretationTextId: id,
        commentEn: cEn, commentId: cId,
        info: {
          descEn: 'Measures how efficiently a company uses its fixed assets (PP&E) to generate revenue. Higher is more productive.',
          descId: 'Mengukur seberapa efisien perusahaan menggunakan aset tetap (PP&E) untuk menghasilkan pendapatan.',
          benchmarkEn: 'High: > 5×. Moderate: 2–5×. Low: < 2×',
          benchmarkId: 'Tinggi: > 5×. Sedang: 2–5×. Rendah: < 2×',
          direction: 'higher',
          formula: 'Revenue ÷ Net Fixed Assets',
        },
      };
    })(),
  ];

  const inputs = [
    { id: 'totalRevenue',        en: 'Total Revenue',               id_: 'Total Pendapatan',          subtitleEn: 'Total income from sales and services',                           subtitleId: 'Total pendapatan dari penjualan dan layanan' },
    { id: 'accountsReceivable',  en: 'Accounts Receivable',         id_: 'Piutang Usaha',             subtitleEn: 'Money owed to the company by customers',                         subtitleId: 'Uang yang terutang pelanggan kepada perusahaan' },
    { id: 'currentAssets',       en: 'Current Assets',              id_: 'Aset Lancar',               subtitleEn: 'Assets convertible to cash within 1 year',                       subtitleId: 'Aset yang dapat dikonversi menjadi kas dalam 1 tahun' },
    { id: 'currentLiabilities',  en: 'Current Liabilities',         id_: 'Liabilitas Lancar',         subtitleEn: 'Obligations due within 1 year',                                  subtitleId: 'Kewajiban yang jatuh tempo dalam 1 tahun' },
    { id: 'netFixedAssets',      en: 'Net Fixed Assets (Net PP&E)', id_: 'Aset Tetap Bersih (PP&E)',  subtitleEn: 'Property, plant & equipment net of depreciation',                subtitleId: 'Properti, pabrik & peralatan setelah dikurangi depresiasi' },
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

  const catT = t.categories['efficiency' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Efficiency'}
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
