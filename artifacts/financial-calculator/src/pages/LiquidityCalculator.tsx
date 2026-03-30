import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn, formatNumber } from '@/lib/utils';
import { categoryColors } from '@/lib/categoryColors';
import { NumericInput } from '@/components/ui/NumericInput';

type InterpretationType = 'good' | 'average' | 'poor' | 'neutral';

interface OutputResult {
  label: string;
  labelId: string;
  value: number | null;
  formatted: string;
  interpretation: InterpretationType;
  interpretationText: string;
  interpretationTextId: string;
}

const interpColors: Record<InterpretationType, { badge: string; bar: string }> = {
  good:    { badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500' },
  average: { badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
  poor:    { badge: 'bg-red-100 text-red-700',       bar: 'bg-red-500' },
  neutral: { badge: 'bg-blue-100 text-blue-700',     bar: 'bg-blue-400' },
};

const interpLabel: Record<string, Record<InterpretationType, string>> = {
  en: { good: 'Good', average: 'Average', poor: 'Poor', neutral: 'Note' },
  id: { good: 'Baik', average: 'Rata-rata', poor: 'Buruk', neutral: 'Catatan' },
};

function fmt(val: number): string {
  return `${formatNumber(val, 2)}x`;
}

function fmtCurrency(val: number): string {
  if (Math.abs(val) >= 1_000_000_000) return `${formatNumber(val / 1_000_000_000, 2)}B`;
  if (Math.abs(val) >= 1_000_000) return `${formatNumber(val / 1_000_000, 2)}M`;
  if (Math.abs(val) >= 1_000) return `${formatNumber(val / 1_000, 2)}K`;
  return `${formatNumber(val, 2)}`;
}

export function LiquidityCalculator() {
  const { language, t } = useLanguage();

  const [vals, setVals] = useState<Record<string, string>>({
    currentAssets: '',
    currentLiabilities: '',
    inventory: '',
    cash: '',
    cfFromOps: '',
    ebit: '',
    interestExpense: '',
  });

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('currentAssets') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Adequate liquidity.';
      let id = 'Likuiditas yang memadai.';
      if (val !== null) {
        if (val >= 1.5 && val <= 3) { interp = 'good'; en = 'Strong liquidity — ratio between 1.5× and 3× is healthy.'; id = 'Likuiditas kuat — rasio 1,5× hingga 3× dianggap sehat.'; }
        else if (val > 3) { interp = 'neutral'; en = 'Very high liquidity — may indicate inefficient use of assets.'; id = 'Likuiditas sangat tinggi — mungkin menunjukkan penggunaan aset yang tidak efisien.'; }
        else if (val < 1) { interp = 'poor'; en = 'Poor liquidity — company may struggle to meet short-term obligations.'; id = 'Likuiditas buruk — perusahaan mungkin kesulitan memenuhi kewajiban jangka pendek.'; }
      }
      return { label: 'Current Ratio', labelId: 'Rasio Lancar', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('inventory') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? (n('currentAssets') - n('inventory')) / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Acceptable quick liquidity.'; let id = 'Likuiditas cepat yang memadai.';
      if (val !== null) {
        if (val > 1) { interp = 'good'; en = 'Strong — company can cover short-term obligations without selling inventory.'; id = 'Kuat — perusahaan dapat memenuhi kewajiban tanpa menjual persediaan.'; }
        else if (val < 1) { interp = 'poor'; en = 'Relies too heavily on inventory to meet short-term obligations.'; id = 'Terlalu bergantung pada persediaan untuk memenuhi kewajiban jangka pendek.'; }
      }
      return { label: 'Quick Ratio', labelId: 'Rasio Cepat', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
    (() => {
      const hasInputs = has('cash') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cash') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Below 1 is normal — companies rarely hold cash to cover all liabilities.'; let id = 'Di bawah 1 adalah normal — perusahaan jarang menyimpan kas untuk menutup semua liabilitas.';
      if (val !== null) {
        if (val >= 0.5) { interp = 'good'; en = 'Very strong cash position.'; id = 'Posisi kas sangat kuat.'; }
        else if (val < 0.1) { interp = 'poor'; en = 'Very low cash reserves — high reliance on receivables/inventory.'; id = 'Cadangan kas sangat rendah — ketergantungan tinggi pada piutang/persediaan.'; }
      }
      return { label: 'Cash Ratio', labelId: 'Rasio Kas', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities');
      const val = hasInputs ? n('currentAssets') - n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Positive working capital means short-term assets exceed short-term obligations.'; let id = 'Modal kerja positif berarti aset jangka pendek melebihi kewajiban jangka pendek.';
      if (val !== null) {
        if (val > 0) { interp = 'good'; en = `Positive working capital of ${fmtCurrency(val)} — good operational buffer.`; id = `Modal kerja positif sebesar ${fmtCurrency(val)} — penyangga operasional yang baik.`; }
        else if (val < 0) { interp = 'poor'; en = `Negative working capital of ${fmtCurrency(val)} — current liabilities exceed current assets.`; id = `Modal kerja negatif sebesar ${fmtCurrency(val)} — liabilitas lancar melebihi aset lancar.`; }
        else { interp = 'average'; en = 'Working capital is zero — tight but breakeven position.'; id = 'Modal kerja nol — posisi ketat tapi impas.'; }
      }
      return { label: 'Working Capital', labelId: 'Modal Kerja', value: val, formatted: val !== null ? fmtCurrency(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
    (() => {
      const hasInputs = has('cfFromOps') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cfFromOps') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures ability to cover current liabilities with operating cash flow.'; let id = 'Mengukur kemampuan menutup liabilitas lancar dengan arus kas operasi.';
      if (val !== null) {
        if (val >= 1) { interp = 'good'; en = 'Strong — operating cash flow fully covers current liabilities.'; id = 'Kuat — arus kas operasi sepenuhnya menutup liabilitas lancar.'; }
        else if (val >= 0.5) { interp = 'average'; en = 'Moderate — operating cash flow covers a portion of current liabilities.'; id = 'Sedang — arus kas operasi menutup sebagian liabilitas lancar.'; }
        else { interp = 'poor'; en = 'Weak — operating cash flow insufficient to cover current liabilities.'; id = 'Lemah — arus kas operasi tidak mencukupi untuk menutup liabilitas lancar.'; }
      }
      return { label: 'Operating Cash Flow Ratio', labelId: 'Rasio Arus Kas Operasi', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
    (() => {
      const hasInputs = has('ebit') && has('interestExpense') && n('interestExpense') !== 0;
      const val = hasInputs ? n('ebit') / n('interestExpense') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures how easily a company can pay interest on its debt.'; let id = 'Mengukur seberapa mudah perusahaan membayar bunga utangnya.';
      if (val !== null) {
        if (val > 3) { interp = 'good'; en = 'Strong — earnings easily cover interest expense.'; id = 'Kuat — laba dengan mudah menutup beban bunga.'; }
        else if (val >= 1.5) { interp = 'average'; en = 'Adequate — earnings cover interest but with limited buffer.'; id = 'Memadai — laba menutup bunga tetapi dengan penyangga terbatas.'; }
        else { interp = 'poor'; en = 'Risky — earnings barely cover interest. Risk of default.'; id = 'Berisiko — laba hampir tidak menutup bunga. Risiko gagal bayar.'; }
      }
      return { label: 'Interest Coverage Ratio', labelId: 'Rasio Perlindungan Bunga', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id };
    })(),
  ];

  const filledCount = Object.values(vals).filter(v => v !== '').length;
  const calculatedCount = results.filter(r => r.value !== null).length;

  const inputs = [
    { id: 'currentAssets',     en: 'Current Assets',              id_: 'Aset Lancar' },
    { id: 'currentLiabilities',en: 'Current Liabilities',         id_: 'Liabilitas Lancar' },
    { id: 'inventory',         en: 'Inventory',                   id_: 'Persediaan' },
    { id: 'cash',              en: 'Cash & Cash Equivalents',     id_: 'Kas & Setara Kas' },
    { id: 'cfFromOps',         en: 'Cash Flow from Operations',   id_: 'Arus Kas dari Operasi' },
    { id: 'ebit',              en: 'Operating Income – EBIT',     id_: 'Laba Operasi – EBIT' },
    { id: 'interestExpense',   en: 'Interest Expense',            id_: 'Beban Bunga' },
  ];

  const catT = t.categories['liquidity' as keyof typeof t.categories] as any;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${categoryColors.liquidity.bg} ${categoryColors.liquidity.text} mb-4`}>
          <Droplets className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-2">
          {catT?.name ?? 'Liquidity'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {catT?.description ?? 'Measure a company\'s ability to pay off its short-term debt obligations.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 h-fit"
        >
          <h2 className="font-semibold text-foreground text-base mb-1">
            {language === 'en' ? 'Input Values' : 'Masukkan Nilai'}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {language === 'en'
              ? `${calculatedCount} of ${results.length} ratios calculated`
              : `${calculatedCount} dari ${results.length} rasio dihitung`}
          </p>
          <div className="space-y-4">
            {inputs.map(inp => (
              <div key={inp.id}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {language === 'en' ? inp.en : inp.id_}
                </label>
                <NumericInput
                  value={vals[inp.id]}
                  onChange={raw => setVals(prev => ({ ...prev, [inp.id]: raw }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
          {filledCount > 0 && (
            <button
              onClick={() => setVals({ currentAssets: '', currentLiabilities: '', inventory: '', cash: '', cfFromOps: '', ebit: '', interestExpense: '' })}
              className="mt-5 w-full text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl py-2 transition-colors"
            >
              {language === 'en' ? 'Clear all' : 'Hapus semua'}
            </button>
          )}
        </motion.div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {results.map((result, i) => {
            const colors = interpColors[result.interpretation];
            const label = language === 'en' ? result.label : result.labelId;
            const interpText = language === 'en' ? result.interpretationText : result.interpretationTextId;
            const interpTag = interpLabel[language][result.interpretation];
            const isCalculated = result.value !== null;

            return (
              <motion.div
                key={result.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={cn(
                  "bg-card border rounded-2xl p-5 transition-all",
                  isCalculated ? "border-border" : "border-dashed border-border/60 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  {isCalculated && (
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", colors.badge)}>
                      {interpTag}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "text-2xl font-bold tracking-tight mb-2",
                  isCalculated ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  {result.formatted}
                </div>
                {isCalculated && (
                  <>
                    <div className="w-full bg-muted rounded-full h-1 mb-2">
                      <div className={cn("h-1 rounded-full transition-all", colors.bar)} style={{ width: '100%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{interpText}</p>
                  </>
                )}
                {!isCalculated && (
                  <p className="text-xs text-muted-foreground/50">
                    {language === 'en' ? 'Enter required fields to calculate' : 'Masukkan nilai yang diperlukan untuk menghitung'}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
