import { useLanguage } from '@/lib/LanguageContext';
import { useCalculatorState } from '@/lib/CalculatorStateContext';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Interp = 'good' | 'average' | 'poor' | 'neutral';

const COLOR: Record<Interp, string> = {
  good:    'text-green-600',
  average: 'text-yellow-400',
  poor:    'text-red-500',
  neutral: 'text-foreground',
};

function val(color: Interp, text: string) {
  return { color, text };
}

function dash() {
  return { color: 'text-muted-foreground/40' as string, text: '—' };
}

function fmtX(v: number)   { return `${formatNumber(v, 2)}×`; }
function fmtPct(v: number) { return `${formatNumber(v, 2)}%`; }
function fmtDays(v: number){ return `${Math.round(v)} d`; }
function fmtLarge(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${formatNumber(abs / 1e9, 2)}B`;
  if (abs >= 1e6) return `${sign}${formatNumber(abs / 1e6, 2)}M`;
  if (abs >= 1e3) return `${sign}${formatNumber(abs / 1e3, 2)}K`;
  return `${sign}${formatNumber(abs, 2)}`;
}
// ── Row: a single metric line ──────────────────────────────────────────────
interface RowDef { label: string; labelId: string; result: { color: string; text: string } }

function Section({ title, rows }: { title: string; rows: RowDef[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">
        {title}
      </p>
      <div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={cn('flex items-center justify-between py-2 gap-3', i < rows.length - 1 && 'border-b border-border/50')}
          >
            <span className="text-sm text-muted-foreground leading-tight">{r.label}</span>
            <span className={cn('text-sm font-bold tabular-nums shrink-0', r.result.color)}>
              {r.result.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function SummaryPage() {
  const { language } = useLanguage();
  const { state } = useCalculatorState();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  // helpers
  const n  = (vals: Record<string, string>, k: string) => parseFloat(vals[k]) || 0;
  const has = (vals: Record<string, string>, k: string) => vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  // ── LIQUIDITY ────────────────────────────────────────────────────────────
  const lq = state.liquidity;
  const liquidityRows: RowDef[] = [
    (() => {
      const ok = has(lq,'currentAssets') && has(lq,'currentLiabilities') && n(lq,'currentLiabilities') !== 0;
      if (!ok) return { label: L('Current Ratio','Rasio Lancar'), labelId: '', result: dash() };
      const v = n(lq,'currentAssets') / n(lq,'currentLiabilities');
      const c: Interp = v >= 1.5 && v <= 3 ? 'good' : v > 3 ? 'neutral' : v >= 1 ? 'average' : 'poor';
      return { label: L('Current Ratio','Rasio Lancar'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lq,'currentAssets') && has(lq,'inventory') && has(lq,'currentLiabilities') && n(lq,'currentLiabilities') !== 0;
      if (!ok) return { label: L('Quick Ratio','Rasio Cepat'), labelId: '', result: dash() };
      const v = (n(lq,'currentAssets') - n(lq,'inventory')) / n(lq,'currentLiabilities');
      const c: Interp = v > 1 ? 'good' : v === 1 ? 'average' : 'poor';
      return { label: L('Quick Ratio','Rasio Cepat'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lq,'cash') && has(lq,'currentLiabilities') && n(lq,'currentLiabilities') !== 0;
      if (!ok) return { label: L('Cash Ratio','Rasio Kas'), labelId: '', result: dash() };
      const v = n(lq,'cash') / n(lq,'currentLiabilities');
      const c: Interp = v >= 0.5 ? 'good' : v >= 0.1 ? 'neutral' : 'poor';
      return { label: L('Cash Ratio','Rasio Kas'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lq,'currentAssets') && has(lq,'currentLiabilities');
      if (!ok) return { label: L('Working Capital','Modal Kerja'), labelId: '', result: dash() };
      const v = n(lq,'currentAssets') - n(lq,'currentLiabilities');
      const c: Interp = v > 0 ? 'good' : v < 0 ? 'poor' : 'average';
      return { label: L('Working Capital','Modal Kerja'), labelId: '', result: val(c, fmtLarge(v)) };
    })(),
    (() => {
      const ok = has(lq,'cfFromOps') && has(lq,'currentLiabilities') && n(lq,'currentLiabilities') !== 0;
      if (!ok) return { label: L('Operating CF Ratio','Rasio Arus Kas Operasi'), labelId: '', result: dash() };
      const v = n(lq,'cfFromOps') / n(lq,'currentLiabilities');
      const c: Interp = v >= 1 ? 'good' : v >= 0.5 ? 'average' : 'poor';
      return { label: L('Operating CF Ratio','Rasio Arus Kas Operasi'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lq,'ebit') && has(lq,'interestExpense') && n(lq,'interestExpense') !== 0;
      if (!ok) return { label: L('Interest Coverage','Perlindungan Bunga'), labelId: '', result: dash() };
      const v = n(lq,'ebit') / n(lq,'interestExpense');
      const c: Interp = v > 3 ? 'good' : v >= 1.5 ? 'average' : 'poor';
      return { label: L('Interest Coverage','Perlindungan Bunga'), labelId: '', result: val(c, fmtX(v)) };
    })(),
  ];

  // ── PROFITABILITY ────────────────────────────────────────────────────────
  const pr = state.profitability;
  const profitabilityRows: RowDef[] = [
    (() => {
      const ok = has(pr,'netIncome') && has(pr,'totalRevenue') && n(pr,'totalRevenue') !== 0;
      if (!ok) return { label: L('Net Profit Margin','Margin Laba Bersih'), labelId: '', result: dash() };
      const v = (n(pr,'netIncome') / n(pr,'totalRevenue')) * 100;
      const c: Interp = v > 20 ? 'good' : v >= 5 ? 'average' : 'poor';
      return { label: L('Net Profit Margin','Margin Laba Bersih'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'grossProfit') && has(pr,'totalRevenue') && n(pr,'totalRevenue') !== 0;
      if (!ok) return { label: L('Gross Profit Margin','Margin Laba Kotor'), labelId: '', result: dash() };
      const v = (n(pr,'grossProfit') / n(pr,'totalRevenue')) * 100;
      const c: Interp = v > 40 ? 'good' : v >= 20 ? 'average' : 'poor';
      return { label: L('Gross Profit Margin','Margin Laba Kotor'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'operatingIncome') && has(pr,'totalRevenue') && n(pr,'totalRevenue') !== 0;
      if (!ok) return { label: L('Operating Profit Margin','Margin Laba Operasi'), labelId: '', result: dash() };
      const v = (n(pr,'operatingIncome') / n(pr,'totalRevenue')) * 100;
      const c: Interp = v > 15 ? 'good' : v >= 5 ? 'average' : 'poor';
      return { label: L('Operating Profit Margin','Margin Laba Operasi'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'netIncome') && has(pr,'totalAssets') && n(pr,'totalAssets') !== 0;
      if (!ok) return { label: L('ROA','ROA'), labelId: '', result: dash() };
      const v = (n(pr,'netIncome') / n(pr,'totalAssets')) * 100;
      const c: Interp = v > 5 ? 'good' : v >= 2 ? 'average' : 'poor';
      return { label: L('Return on Assets (ROA)','Imbal Hasil Aset (ROA)'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'netIncome') && has(pr,'totalEquity') && n(pr,'totalEquity') !== 0;
      if (!ok) return { label: L('ROE','ROE'), labelId: '', result: dash() };
      const v = (n(pr,'netIncome') / n(pr,'totalEquity')) * 100;
      const c: Interp = v > 15 ? 'good' : v >= 8 ? 'average' : 'poor';
      return { label: L('Return on Equity (ROE)','Imbal Hasil Ekuitas (ROE)'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'ebitda') && has(pr,'totalRevenue') && n(pr,'totalRevenue') !== 0;
      if (!ok) return { label: L('EBITDA Margin','Margin EBITDA'), labelId: '', result: dash() };
      const v = (n(pr,'ebitda') / n(pr,'totalRevenue')) * 100;
      const c: Interp = v > 30 ? 'good' : v >= 15 ? 'average' : 'poor';
      return { label: L('EBITDA Margin','Margin EBITDA'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
  ];

  // ── LEVERAGE ─────────────────────────────────────────────────────────────
  const lv = state.leverage;
  const leverageRows: RowDef[] = [
    (() => {
      const ok = has(lv,'totalLiabilities') && has(lv,'totalEquity') && n(lv,'totalEquity') !== 0;
      if (!ok) return { label: L('Debt / Equity','Utang / Ekuitas'), labelId: '', result: dash() };
      const v = n(lv,'totalLiabilities') / n(lv,'totalEquity');
      const c: Interp = v < 1 ? 'good' : v <= 2 ? 'average' : 'poor';
      return { label: L('Debt / Equity','Utang / Ekuitas'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lv,'totalLiabilities') && has(lv,'totalAssets') && n(lv,'totalAssets') !== 0;
      if (!ok) return { label: L('Debt / Assets','Utang / Aset'), labelId: '', result: dash() };
      const v = n(lv,'totalLiabilities') / n(lv,'totalAssets');
      const c: Interp = v < 0.3 ? 'good' : v <= 0.6 ? 'average' : 'poor';
      return { label: L('Debt / Assets','Utang / Aset'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(lv,'totalDebt') && has(lv,'ebitda') && n(lv,'ebitda') !== 0;
      if (!ok) return { label: L('Debt / EBITDA','Utang / EBITDA'), labelId: '', result: dash() };
      const v = n(lv,'totalDebt') / n(lv,'ebitda');
      const c: Interp = v < 2 ? 'good' : v <= 4 ? 'average' : 'poor';
      return { label: L('Debt / EBITDA','Utang / EBITDA'), labelId: '', result: val(c, fmtX(v)) };
    })(),
  ];

  // ── EFFICIENCY ───────────────────────────────────────────────────────────
  const ef = state.efficiency;
  const efficiencyRows: RowDef[] = [
    (() => {
      const ok = has(ef,'totalRevenue') && has(ef,'accountsReceivable') && n(ef,'accountsReceivable') !== 0;
      if (!ok) return { label: L('Receivables Turnover','Perputaran Piutang'), labelId: '', result: dash() };
      const v = n(ef,'totalRevenue') / n(ef,'accountsReceivable');
      const c: Interp = v > 8 ? 'good' : v >= 4 ? 'average' : 'poor';
      return { label: L('Receivables Turnover','Perputaran Piutang'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(ef,'accountsReceivable') && has(ef,'totalRevenue') && n(ef,'totalRevenue') !== 0;
      if (!ok) return { label: L('Days Sales Outstanding','Hari Penjualan Beredar'), labelId: '', result: dash() };
      const v = (n(ef,'accountsReceivable') / n(ef,'totalRevenue')) * 365;
      const c: Interp = v < 30 ? 'good' : v <= 60 ? 'average' : 'poor';
      return { label: L('Days Sales Outstanding','Hari Penjualan Beredar'), labelId: '', result: val(c, fmtDays(v)) };
    })(),
    (() => {
      const wc = n(ef,'currentAssets') - n(ef,'currentLiabilities');
      const ok = has(ef,'totalRevenue') && has(ef,'currentAssets') && has(ef,'currentLiabilities') && wc !== 0;
      if (!ok) return { label: L('Working Capital Turnover','Perputaran Modal Kerja'), labelId: '', result: dash() };
      const v = n(ef,'totalRevenue') / wc;
      const c: Interp = v > 6 ? 'good' : v >= 2 ? 'average' : 'poor';
      return { label: L('Working Capital Turnover','Perputaran Modal Kerja'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(ef,'totalRevenue') && has(ef,'netFixedAssets') && n(ef,'netFixedAssets') !== 0;
      if (!ok) return { label: L('Fixed Asset Turnover','Perputaran Aset Tetap'), labelId: '', result: dash() };
      const v = n(ef,'totalRevenue') / n(ef,'netFixedAssets');
      const c: Interp = v > 5 ? 'good' : v >= 2 ? 'average' : 'poor';
      return { label: L('Fixed Asset Turnover','Perputaran Aset Tetap'), labelId: '', result: val(c, fmtX(v)) };
    })(),
  ];

  // ── VALUATION ────────────────────────────────────────────────────────────
  const va = state.valuation;
  const mktCap = n(va,'marketPrice') * n(va,'sharesOutstanding');
  const ev = mktCap + n(va,'totalDebt') - n(va,'cashEquivalents');
  const valuationRows: RowDef[] = [
    (() => {
      const ok = has(va,'marketPrice') && has(va,'eps') && n(va,'eps') !== 0;
      if (!ok) return { label: L('P/E Ratio','Rasio P/E'), labelId: '', result: dash() };
      const v = n(va,'marketPrice') / n(va,'eps');
      const c: Interp = v < 0 ? 'poor' : v < 10 ? 'neutral' : v <= 20 ? 'good' : v <= 30 ? 'average' : 'poor';
      return { label: L('P/E Ratio','Rasio P/E'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(va,'marketPrice') && has(va,'bvps') && n(va,'bvps') !== 0;
      if (!ok) return { label: L('P/B Ratio','Rasio P/B'), labelId: '', result: dash() };
      const v = n(va,'marketPrice') / n(va,'bvps');
      const c: Interp = v < 1 ? 'neutral' : v <= 3 ? 'good' : 'poor';
      return { label: L('P/B Ratio','Rasio P/B'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(va,'marketPrice') && has(va,'sharesOutstanding') && has(va,'totalDebt') && has(va,'cashEquivalents');
      if (!ok) return { label: L('Enterprise Value','Nilai Perusahaan'), labelId: '', result: dash() };
      const c: Interp = ev > 0 ? 'neutral' : 'poor';
      return { label: L('Enterprise Value','Nilai Perusahaan'), labelId: '', result: val(c, fmtLarge(ev)) };
    })(),
    (() => {
      const ok = has(va,'marketPrice') && has(va,'sharesOutstanding') && has(va,'totalDebt') && has(va,'cashEquivalents') && has(va,'ebitda') && n(va,'ebitda') !== 0;
      if (!ok) return { label: L('EV / EBITDA','EV / EBITDA'), labelId: '', result: dash() };
      const v = ev / n(va,'ebitda');
      const c: Interp = v < 8 ? 'good' : v <= 15 ? 'average' : 'poor';
      return { label: L('EV / EBITDA','EV / EBITDA'), labelId: '', result: val(c, fmtX(v)) };
    })(),
    (() => {
      const ok = has(va,'dividendPerShare') && has(va,'marketPrice') && n(va,'marketPrice') !== 0;
      if (!ok) return { label: L('Dividend Yield','Imbal Hasil Dividen'), labelId: '', result: dash() };
      const v = (n(va,'dividendPerShare') / n(va,'marketPrice')) * 100;
      const c: Interp = v >= 4 ? 'good' : v >= 2 ? 'average' : v > 0 ? 'poor' : 'neutral';
      return { label: L('Dividend Yield','Imbal Hasil Dividen'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
  ];

  const sections = [
    { title: L('Liquidity', 'Likuiditas'), rows: liquidityRows },
    { title: L('Profitability', 'Profitabilitas'), rows: profitabilityRows },
    { title: L('Leverage', 'Leverage'), rows: leverageRows },
    { title: L('Efficiency', 'Efisiensi'), rows: efficiencyRows },
    { title: L('Valuation', 'Valuasi'), rows: valuationRows },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-6">
        {L('Summary', 'Ringkasan')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {sections.map(s => (
          <Section key={s.title} title={s.title} rows={s.rows} />
        ))}
      </div>
    </div>
  );
}
