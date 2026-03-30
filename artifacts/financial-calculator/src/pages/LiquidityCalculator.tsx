import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Info } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn, formatNumber } from '@/lib/utils';
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
  formula: string;
}

const valueColor: Record<InterpretationType, string> = {
  good:    'text-green-600',
  average: 'text-yellow-600',
  poor:    'text-red-500',
  neutral: 'text-blue-600',
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

const EMPTY: Record<string, string> = {
  currentAssets: '0', currentLiabilities: '0', inventory: '0',
  cash: '0', cfFromOps: '0', ebit: '0', interestExpense: '0',
};

export function LiquidityCalculator() {
  const { language, t } = useLanguage();
  const [vals, setVals] = useState<Record<string, string>>({ ...EMPTY });
  const [savedToast, setSavedToast] = useState(false);

  const n = (k: string) => parseFloat(vals[k]) || 0;
  const has = (k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  const results: OutputResult[] = [
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('currentAssets') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Adequate liquidity.'; let id = 'Likuiditas yang memadai.';
      if (val !== null) {
        if (val >= 1.5 && val <= 3) { interp = 'good'; en = 'Strong liquidity — ratio between 1.5× and 3× is healthy.'; id = 'Likuiditas kuat — rasio 1,5× hingga 3× dianggap sehat.'; }
        else if (val > 3) { interp = 'neutral'; en = 'Very high — may indicate inefficient use of assets.'; id = 'Sangat tinggi — mungkin menunjukkan penggunaan aset yang tidak efisien.'; }
        else if (val < 1) { interp = 'poor'; en = 'Poor liquidity — may struggle with short-term obligations.'; id = 'Likuiditas buruk — mungkin kesulitan memenuhi kewajiban jangka pendek.'; }
      }
      return { label: 'Current Ratio', labelId: 'Rasio Lancar', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: 'Current Assets ÷ Current Liabilities' };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('inventory') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? (n('currentAssets') - n('inventory')) / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Acceptable quick liquidity.'; let id = 'Likuiditas cepat yang memadai.';
      if (val !== null) {
        if (val > 1) { interp = 'good'; en = 'Strong — can cover obligations without selling inventory.'; id = 'Kuat — dapat memenuhi kewajiban tanpa menjual persediaan.'; }
        else if (val < 1) { interp = 'poor'; en = 'Relies heavily on inventory to meet short-term obligations.'; id = 'Sangat bergantung pada persediaan untuk memenuhi kewajiban.'; }
      }
      return { label: 'Quick Ratio (Acid-Test)', labelId: 'Rasio Cepat (Uji Asam)', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: '(Current Assets − Inventory) ÷ Current Liabilities' };
    })(),
    (() => {
      const hasInputs = has('cash') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cash') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Below 1 is normal — companies rarely hold cash to cover all liabilities.'; let id = 'Di bawah 1 adalah normal — perusahaan jarang menyimpan kas untuk semua liabilitas.';
      if (val !== null) {
        if (val >= 0.5) { interp = 'good'; en = 'Very strong cash position.'; id = 'Posisi kas sangat kuat.'; }
        else if (val < 0.1) { interp = 'poor'; en = 'Very low cash — high reliance on receivables/inventory.'; id = 'Kas sangat rendah — ketergantungan tinggi pada piutang/persediaan.'; }
      }
      return { label: 'Cash Ratio', labelId: 'Rasio Kas', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: 'Cash & Equivalents ÷ Current Liabilities' };
    })(),
    (() => {
      const hasInputs = has('currentAssets') && has('currentLiabilities');
      const val = hasInputs ? n('currentAssets') - n('currentLiabilities') : null;
      let interp: InterpretationType = 'neutral';
      let en = 'Positive working capital means short-term assets exceed obligations.'; let id = 'Modal kerja positif berarti aset jangka pendek melebihi kewajiban.';
      if (val !== null) {
        if (val > 0) { interp = 'good'; en = `Positive working capital of ${fmtCurrency(val)} — good buffer.`; id = `Modal kerja positif sebesar ${fmtCurrency(val)} — penyangga yang baik.`; }
        else if (val < 0) { interp = 'poor'; en = `Negative working capital of ${fmtCurrency(val)} — liabilities exceed assets.`; id = `Modal kerja negatif sebesar ${fmtCurrency(val)} — liabilitas melebihi aset.`; }
        else { interp = 'average'; en = 'Zero working capital — breakeven position.'; id = 'Modal kerja nol — posisi impas.'; }
      }
      return { label: 'Working Capital', labelId: 'Modal Kerja', value: val, formatted: val !== null ? fmtCurrency(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: 'Current Assets − Current Liabilities' };
    })(),
    (() => {
      const hasInputs = has('cfFromOps') && has('currentLiabilities') && n('currentLiabilities') !== 0;
      const val = hasInputs ? n('cfFromOps') / n('currentLiabilities') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures ability to cover current liabilities with operating cash flow.'; let id = 'Mengukur kemampuan menutup liabilitas lancar dengan arus kas operasi.';
      if (val !== null) {
        if (val >= 1) { interp = 'good'; en = 'Strong — operating cash flow fully covers current liabilities.'; id = 'Kuat — arus kas operasi sepenuhnya menutup liabilitas lancar.'; }
        else if (val >= 0.5) { interp = 'average'; en = 'Moderate — covers a portion of current liabilities.'; id = 'Sedang — menutup sebagian liabilitas lancar.'; }
        else { interp = 'poor'; en = 'Weak — operating cash flow insufficient.'; id = 'Lemah — arus kas operasi tidak mencukupi.'; }
      }
      return { label: 'Operating Cash Flow Ratio', labelId: 'Rasio Arus Kas Operasi', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: 'Cash Flow from Operations ÷ Current Liabilities' };
    })(),
    (() => {
      const hasInputs = has('ebit') && has('interestExpense') && n('interestExpense') !== 0;
      const val = hasInputs ? n('ebit') / n('interestExpense') : null;
      let interp: InterpretationType = 'average';
      let en = 'Measures how easily a company can pay interest on its debt.'; let id = 'Mengukur seberapa mudah perusahaan membayar bunga utangnya.';
      if (val !== null) {
        if (val > 3) { interp = 'good'; en = 'Strong — earnings easily cover interest expense.'; id = 'Kuat — laba dengan mudah menutup beban bunga.'; }
        else if (val >= 1.5) { interp = 'average'; en = 'Adequate — covers interest with limited buffer.'; id = 'Memadai — menutup bunga dengan penyangga terbatas.'; }
        else { interp = 'poor'; en = 'Risky — earnings barely cover interest. Risk of default.'; id = 'Berisiko — laba hampir tidak menutup bunga. Risiko gagal bayar.'; }
      }
      return { label: 'Interest Coverage Ratio', labelId: 'Rasio Perlindungan Bunga', value: val, formatted: val !== null ? fmt(val) : '—', interpretation: interp, interpretationText: en, interpretationTextId: id, formula: 'EBIT ÷ Interest Expense' };
    })(),
  ];

  const inputs = [
    { id: 'currentAssets',      en: 'Current Assets',            id_: 'Aset Lancar',            subtitleEn: 'Assets convertible to cash within 1 year',       subtitleId: 'Aset yang dapat dikonversi menjadi kas dalam 1 tahun' },
    { id: 'currentLiabilities', en: 'Current Liabilities',       id_: 'Liabilitas Lancar',       subtitleEn: 'Obligations due within 1 year',                  subtitleId: 'Kewajiban yang jatuh tempo dalam 1 tahun' },
    { id: 'inventory',          en: 'Inventory',                  id_: 'Persediaan',              subtitleEn: 'Goods held for sale or production',               subtitleId: 'Barang yang dimiliki untuk dijual atau produksi' },
    { id: 'cash',               en: 'Cash & Equivalents',         id_: 'Kas & Setara Kas',        subtitleEn: 'Cash on hand and short-term liquid deposits',     subtitleId: 'Kas di tangan dan deposito cair jangka pendek' },
    { id: 'cfFromOps',          en: 'Cash Flow from Operations',  id_: 'Arus Kas dari Operasi',   subtitleEn: 'Net cash generated from core business activities', subtitleId: 'Kas bersih dari aktivitas bisnis utama' },
    { id: 'ebit',               en: 'Operating Income (EBIT)',    id_: 'Laba Operasi (EBIT)',     subtitleEn: 'Earnings before interest and taxes',              subtitleId: 'Laba sebelum bunga dan pajak' },
    { id: 'interestExpense',    en: 'Interest Expense',           id_: 'Beban Bunga',             subtitleEn: 'Total interest charges on outstanding debt',      subtitleId: 'Total beban bunga atas utang yang beredar' },
  ];

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

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
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-1">
          {catT?.name ?? 'Liquidity'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {catT?.description ?? "Measure a company's ability to pay off its short-term debt obligations."}
        </p>
      </motion.div>

      {/* RESULTS */}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
        {language === 'en' ? 'Results' : 'Hasil'}
      </p>
      <div className="space-y-2 mb-5">
        {results.map((result, i) => {
          const label = language === 'en' ? result.label : result.labelId;
          const isCalculated = result.value !== null;
          const color = isCalculated ? valueColor[result.interpretation] : 'text-muted-foreground/40';

          return (
            <motion.div
              key={result.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-sm text-foreground leading-tight">{label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-base font-bold tabular-nums', color)}>
                    {result.formatted}
                  </span>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{result.formula}</p>
            </motion.div>
          );
        })}
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all mb-6",
          savedToast
            ? "bg-green-500 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Bookmark className="w-4 h-4" />
        {savedToast
          ? (language === 'en' ? 'Saved!' : 'Tersimpan!')
          : (language === 'en' ? 'Save to History' : 'Simpan ke Riwayat')}
      </button>

      {/* INPUTS */}
      <div className="flex items-center justify-between mb-3">
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
              <div className="flex items-center rounded-xl overflow-hidden border border-border bg-muted/40">
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
  );
}
