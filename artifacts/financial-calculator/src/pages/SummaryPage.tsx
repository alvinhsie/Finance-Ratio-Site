import { useState } from 'react';
import { Info, Download, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCalculatorState } from '@/lib/CalculatorStateContext';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

type Interp = 'good' | 'average' | 'poor' | 'neutral';

const COLOR: Record<Interp, string> = {
  good:    'text-green-600',
  average: 'text-yellow-400',
  poor:    'text-red-500',
  neutral: 'text-foreground',
};

const PDF_COLOR: Record<string, [number, number, number]> = {
  'text-green-600':          [22,  163,  74],
  'text-yellow-400':         [202, 138,   4],
  'text-red-500':            [239,  68,  68],
  'text-foreground':         [ 15,  23,  42],
  'text-muted-foreground/40':[ 180, 180, 180],
};

function val(color: Interp, text: string) {
  return { color: COLOR[color], text };
}

function dash() {
  return { color: 'text-muted-foreground/40' as string, text: '—' };
}

function fmtX(v: number)    { return `${formatNumber(v, 2)}\u00d7`; }
function fmtPct(v: number)  { return `${formatNumber(v, 2)}%`; }
function fmtDays(v: number) { return `${Math.round(v)} d`; }
function fmtLarge(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${formatNumber(abs / 1e9, 2)}B`;
  if (abs >= 1e6) return `${sign}${formatNumber(abs / 1e6, 2)}M`;
  if (abs >= 1e3) return `${sign}${formatNumber(abs / 1e3, 2)}K`;
  return `${sign}${formatNumber(abs, 2)}`;
}

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

type Period = 'Q1' | 'Q2' | 'Q3' | 'FY';

type ReportType = 'TTM' | 'Quarterly';
interface PdfMeta { ticker: string; period: Period; reportType: ReportType | null; year: string }

function PdfModal({
  onClose,
  onDownload,
  isEn,
}: {
  onClose: () => void;
  onDownload: (meta: PdfMeta) => void;
  isEn: boolean;
}) {
  const [ticker, setTicker]         = useState('');
  const [period, setPeriod]         = useState<Period>('FY');
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [year, setYear]             = useState(String(new Date().getFullYear()));

  const L = (en: string, id: string) => isEn ? en : id;

  const handle = () => {
    if (!ticker.trim() || !year.trim()) return;
    onDownload({ ticker: ticker.trim().toUpperCase(), period, reportType, year: year.trim() });
    onClose();
  };

  const periods: Period[] = ['Q1', 'Q2', 'Q3', 'FY'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {L('Download PDF Report', 'Unduh Laporan PDF')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {L('Ticker Symbol', 'Kode Saham')}
            </label>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder={L('e.g. AAPL', 'mis. BBRI')}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              maxLength={10}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {L('Period', 'Periode')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'py-2 rounded-xl text-sm font-bold border transition-all',
                    period === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {L('Report Type', 'Jenis Laporan')}
              </label>
              <span className="text-[10px] text-muted-foreground/60 italic">
                {L('(optional)', '(opsional)')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['TTM', 'Quarterly'] as ReportType[]).map(rt => (
                <button
                  key={rt}
                  onClick={() => setReportType(prev => prev === rt ? null : rt)}
                  className={cn(
                    'py-2 rounded-xl text-sm font-bold border transition-all',
                    reportType === rt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {L('Year', 'Tahun')}
            </label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder="2024"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              min="1900"
              max="2099"
            />
          </div>
        </div>

        <button
          onClick={handle}
          disabled={!ticker.trim() || !year.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          {L('Download PDF', 'Unduh PDF')}
        </button>
      </div>
    </div>
  );
}

function buildPdf(
  sections: { title: string; rows: RowDef[] }[],
  meta: PdfMeta,
  isEn: boolean,
  overview: { p1: string; p2: string } | null,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 48;
  const col = (W - margin * 2) / 2;

  let y = margin;

  const setColor  = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
  const setSize   = (s: number) => doc.setFontSize(s);

  const dark: [number, number, number]   = [15,  23,  42];
  const muted: [number, number, number]  = [107, 114, 128];
  const border: [number, number, number] = [226, 232, 240];

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, W - margin * 2, 54, 8, 8, 'F');

  doc.setTextColor(255, 255, 255);
  setSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FinRatio', margin + 18, y + 22);

  setSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('by SlitherStocks', margin + 18, y + 35);

  const rtPart = meta.reportType ? ` ${meta.reportType}` : '';
  const label  = `${meta.ticker}  •  ${meta.period}${rtPart} ${meta.year}`;
  setSize(10);
  doc.setFont('helvetica', 'bold');
  const lw = doc.getTextWidth(label);
  doc.text(label, W - margin - 18 - lw, y + 26);

  y += 74;

  // ── Generated date ─────────────────────────────────────────────────────────
  setSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(...muted);
  const genLabel = isEn
    ? `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : `Dibuat pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  doc.text(genLabel, margin, y);
  y += 20;

  // ── Separator ─────────────────────────────────────────────────────────────
  doc.setDrawColor(...border);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 16;

  // ── Sections in 2-column layout (left: 0-2, right: 3-4) ──────────────────
  const ROW_H    = 18;
  const SEC_PAD  = 12;
  const HEADER_H = 28;
  const secW     = col - 8;
  const colGap   = 16;
  const leftX    = margin;
  const rightX   = margin + col + colGap;

  const drawSection = (sec: { title: string; rows: RowDef[] }, startX: number, startY: number) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(startX, startY, secW, HEADER_H, 4, 4, 'F');
    setSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(...muted);
    doc.text(sec.title.toUpperCase(), startX + 10, startY + 17);
    const rowsStart = startY + HEADER_H + 4;
    for (let i = 0; i < sec.rows.length; i++) {
      const r = sec.rows[i];
      const rowY = rowsStart + i * ROW_H;
      if (i > 0) {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.3);
        doc.line(startX + 4, rowY, startX + secW - 4, rowY);
      }
      setSize(8.5);
      doc.setFont('helvetica', 'normal');
      setColor(...muted);
      doc.text(r.label, startX + 8, rowY + 12);
      const rgb = PDF_COLOR[r.result.color] ?? dark;
      setColor(...rgb);
      doc.setFont('helvetica', 'bold');
      const vw = doc.getTextWidth(r.result.text);
      doc.text(r.result.text, startX + secW - 8 - vw, rowY + 12);
    }
    return rowsStart + sec.rows.length * ROW_H + SEC_PAD;
  };

  // Left column: Liquidity, Profitability, Leverage
  const leftSecs  = sections.slice(0, 3);
  // Right column: Efficiency, Valuation
  const rightSecs = sections.slice(3);

  let leftY  = y;
  let rightY = y;

  for (const sec of leftSecs)  { leftY  = drawSection(sec, leftX,  leftY);  }
  for (const sec of rightSecs) { rightY = drawSection(sec, rightX, rightY); }

  const sectionsBottom = Math.max(leftY, rightY);

  // ── Overview text (only when all outputs are filled) ───────────────────────
  if (overview) {
    const overviewY = sectionsBottom + 12;
    const overviewLabel = isEn ? 'OVERVIEW' : 'GAMBARAN UMUM';
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, overviewY, W - margin * 2, 14, 3, 3, 'F');
    setSize(7.5);
    doc.setFont('helvetica', 'bold');
    setColor(...muted);
    doc.text(overviewLabel, margin + 8, overviewY + 10);

    const overviewTextY = overviewY + 22;
    setSize(8.5);
    doc.setFont('helvetica', 'normal');
    setColor(...dark);
    const textWidth = W - margin * 2;
    const p1Lines = doc.splitTextToSize(overview.p1, textWidth);
    const p2Lines = doc.splitTextToSize(overview.p2, textWidth);
    doc.text(p1Lines, margin, overviewTextY);
    doc.text(p2Lines, margin, overviewTextY + p1Lines.length * 12 + 6);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = H - margin + 12;
  doc.setDrawColor(...border);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, W - margin, footerY - 8);
  setSize(7.5);
  doc.setFont('helvetica', 'normal');
  setColor(...muted);
  const disclaimer = isEn
    ? 'This report is for informational purposes only and does not constitute financial advice.'
    : 'Laporan ini hanya untuk tujuan informasi dan bukan merupakan saran keuangan.';
  doc.text(disclaimer, margin, footerY);
  const page = isEn ? 'Page 1 of 1' : 'Halaman 1 dari 1';
  const pw = doc.getTextWidth(page);
  doc.text(page, W - margin - pw, footerY);

  const rtSlug = meta.reportType ? `_${meta.reportType}` : '';
  doc.save(`FinRatio_${meta.ticker}_${meta.period}${rtSlug}_${meta.year}.pdf`);
}

// ── Big-picture narrative ───────────────────────────────────────────────────
type SectionProfile = 'strong' | 'mixed' | 'weak' | 'neutral';

function profileSection(rows: RowDef[]): SectionProfile {
  let good = 0, poor = 0, avg = 0, total = 0;
  for (const r of rows) {
    if (r.result.color === 'text-muted-foreground/40') continue;
    total++;
    if (r.result.color === 'text-green-600') good++;
    else if (r.result.color === 'text-red-500') poor++;
    else if (r.result.color === 'text-yellow-400') avg++;
  }
  if (total === 0) return 'neutral';
  if (good / total > 0.5) return 'strong';
  if (poor / total > 0.5) return 'weak';
  return 'mixed';
}

function generateBigPicture(
  sections: { title: string; rows: RowDef[] }[],
  isEn: boolean,
): { p1: string; p2: string } {
  const [liq, pro, lev, eff, val] = sections.map(s => profileSection(s.rows));

  const profiles = [liq, pro, lev, eff, val];
  const strongCount  = profiles.filter(p => p === 'strong').length;
  const weakCount    = profiles.filter(p => p === 'weak').length;

  // ── Section-level descriptors ────────────────────────────────────────────
  const DESC: Record<string, Record<SectionProfile, { en: string; id: string }>> = {
    liquidity: {
      strong:  { en: 'Liquidity is solid, with short-term assets comfortably covering near-term obligations.',            id: 'Likuiditas terbilang solid, dengan aset lancar yang cukup untuk menutupi kewajiban jangka pendek.' },
      mixed:   { en: 'Liquidity is adequate, though some short-term coverage metrics show room for improvement.',         id: 'Likuiditas cukup memadai, meski beberapa rasio perlindungan jangka pendek masih perlu ditingkatkan.' },
      weak:    { en: 'Liquidity appears strained, with short-term assets falling short relative to near-term obligations.', id: 'Likuiditas terlihat tertekan, dengan aset lancar yang belum cukup menutupi kewajiban jangka pendek.' },
      neutral: { en: 'Liquidity data provides a neutral picture of short-term coverage.',                                 id: 'Data likuiditas memberikan gambaran netral terhadap kemampuan pemenuhan kewajiban jangka pendek.' },
    },
    profitability: {
      strong:  { en: 'Profitability margins are healthy, reflecting effective cost management and earnings generation.',   id: 'Margin profitabilitas terlihat sehat, mencerminkan manajemen biaya yang efektif dan kemampuan menghasilkan laba.' },
      mixed:   { en: 'Profitability shows a mixed picture, with some margins at acceptable levels and others under pressure.', id: 'Profitabilitas menunjukkan gambaran campuran, dengan sebagian margin yang cukup dan sebagian lain masih tertekan.' },
      weak:    { en: 'Profitability is under pressure, with margins reflecting difficulty in converting revenue into earnings.', id: 'Profitabilitas berada di bawah tekanan, dengan margin yang mencerminkan kesulitan dalam menghasilkan laba dari pendapatan.' },
      neutral: { en: 'Profitability metrics reflect a neutral earnings picture relative to revenue and assets.',           id: 'Metrik profitabilitas mencerminkan gambaran laba yang netral relatif terhadap pendapatan dan aset.' },
    },
    leverage: {
      strong:  { en: 'Leverage is conservative, with manageable debt levels relative to equity and earnings capacity.',   id: 'Leverage terbilang konservatif, dengan tingkat utang yang terkendali relatif terhadap ekuitas dan kapasitas laba.' },
      mixed:   { en: 'Leverage sits at a moderate level, indicating meaningful but not excessive use of debt financing.',  id: 'Leverage berada di tingkat moderat, mencerminkan penggunaan utang yang berarti namun tidak berlebihan.' },
      weak:    { en: 'Leverage is elevated, with debt levels running high relative to equity, assets, and earnings capacity.', id: 'Leverage tergolong tinggi, dengan tingkat utang yang cukup besar relatif terhadap ekuitas, aset, dan kapasitas laba.' },
      neutral: { en: 'Leverage metrics reflect a balanced use of debt relative to the company\'s capital structure.',     id: 'Metrik leverage mencerminkan penggunaan utang yang seimbang dalam struktur modal perusahaan.' },
    },
    efficiency: {
      strong:  { en: 'Operational efficiency is high, with strong asset utilization and receivables collection.',          id: 'Efisiensi operasional tinggi, dengan pemanfaatan aset dan pengumpulan piutang yang baik.' },
      mixed:   { en: 'Operational efficiency is moderate, with turnover metrics operating within an acceptable range.',    id: 'Efisiensi operasional tergolong moderat, dengan rasio perputaran yang berada dalam kisaran yang dapat diterima.' },
      weak:    { en: 'Operational efficiency appears sluggish, with slower asset turnover and extended collection cycles.', id: 'Efisiensi operasional terlihat lambat, dengan perputaran aset yang rendah dan siklus penagihan yang panjang.' },
      neutral: { en: 'Efficiency metrics paint a neutral picture of how the company manages its operational resources.',   id: 'Metrik efisiensi menggambarkan gambaran netral tentang bagaimana perusahaan mengelola sumber daya operasionalnya.' },
    },
    valuation: {
      strong:  { en: 'Valuation metrics suggest the stock is reasonably priced relative to earnings and book value.',      id: 'Metrik valuasi menunjukkan saham diperdagangkan pada harga yang wajar relatif terhadap laba dan nilai buku.' },
      mixed:   { en: 'Valuation metrics reflect a mixed pricing picture, with some multiples elevated and others moderate.', id: 'Metrik valuasi mencerminkan gambaran harga yang beragam, dengan sebagian kelipatan tinggi dan sebagian lain moderat.' },
      weak:    { en: 'Valuation metrics indicate a premium market price, trading at a high multiple relative to fundamentals.', id: 'Metrik valuasi mengindikasikan harga pasar yang premium, diperdagangkan pada kelipatan tinggi relatif terhadap fundamental.' },
      neutral: { en: 'Valuation data reflects current market pricing, with metrics that vary across different measures.',   id: 'Data valuasi mencerminkan harga pasar saat ini, dengan metrik yang bervariasi di berbagai ukuran.' },
    },
  };

  const keys = ['liquidity', 'profitability', 'leverage', 'efficiency', 'valuation'];

  // ── Overall tone ─────────────────────────────────────────────────────────
  let overallEn: string, overallId: string;
  if (strongCount >= 4)      { overallEn = 'The ratios collectively point to a robust financial profile across most dimensions analyzed.'; overallId = 'Secara keseluruhan, rasio-rasio ini menunjukkan profil keuangan yang kuat di sebagian besar dimensi yang dianalisis.'; }
  else if (strongCount >= 3) { overallEn = 'The ratios collectively suggest a broadly solid financial profile, with a few areas showing moderate signals.'; overallId = 'Secara keseluruhan, rasio-rasio ini mencerminkan profil keuangan yang cukup solid, dengan beberapa area yang menunjukkan sinyal moderat.'; }
  else if (weakCount >= 3)   { overallEn = 'The ratios collectively indicate a challenging financial profile, with several areas reflecting notable pressure.'; overallId = 'Secara keseluruhan, rasio-rasio ini mengindikasikan profil keuangan yang menantang, dengan beberapa area yang mencerminkan tekanan yang signifikan.'; }
  else                        { overallEn = 'The ratios collectively present a mixed financial profile, with varying signals across the categories analyzed.'; overallId = 'Secara keseluruhan, rasio-rasio ini menunjukkan profil keuangan yang beragam, dengan sinyal yang bervariasi di seluruh kategori yang dianalisis.'; }

  // ── Category sentences ────────────────────────────────────────────────────
  const sentences = keys.map((k, i) => {
    const prof = profiles[i];
    const d = DESC[k][prof];
    return isEn ? d.en : d.id;
  });

  const [liqS, proS, levS, effS, valS] = sentences;

  const p1 = isEn
    ? `${overallEn} ${liqS} ${proS}`
    : `${overallId} ${liqS} ${proS}`;

  const p2 = isEn
    ? `${levS} ${effS} ${valS}`
    : `${levS} ${effS} ${valS}`;

  return { p1, p2 };
}

export function SummaryPage() {
  const { language } = useLanguage();
  const { state }   = useCalculatorState();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  const [showModal, setShowModal] = useState(false);

  const n   = (vals: Record<string, string>, k: string) => parseFloat(vals[k]) || 0;
  const has = (vals: Record<string, string>, k: string) =>
    vals[k] !== '' && !isNaN(parseFloat(vals[k]));

  // ── LIQUIDITY ─────────────────────────────────────────────────────────────
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

  // ── PROFITABILITY ─────────────────────────────────────────────────────────
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
      if (!ok) return { label: L('Return on Assets (ROA)','Imbal Hasil Aset (ROA)'), labelId: '', result: dash() };
      const v = (n(pr,'netIncome') / n(pr,'totalAssets')) * 100;
      const c: Interp = v > 5 ? 'good' : v >= 2 ? 'average' : 'poor';
      return { label: L('Return on Assets (ROA)','Imbal Hasil Aset (ROA)'), labelId: '', result: val(c, fmtPct(v)) };
    })(),
    (() => {
      const ok = has(pr,'netIncome') && has(pr,'totalEquity') && n(pr,'totalEquity') !== 0;
      if (!ok) return { label: L('Return on Equity (ROE)','Imbal Hasil Ekuitas (ROE)'), labelId: '', result: dash() };
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

  // ── LEVERAGE ──────────────────────────────────────────────────────────────
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

  // ── EFFICIENCY ────────────────────────────────────────────────────────────
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

  // ── VALUATION ─────────────────────────────────────────────────────────────
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
    { title: L('Liquidity',     'Likuiditas'),     rows: liquidityRows     },
    { title: L('Profitability', 'Profitabilitas'), rows: profitabilityRows },
    { title: L('Leverage',      'Leverage'),       rows: leverageRows      },
    { title: L('Efficiency',    'Efisiensi'),      rows: efficiencyRows    },
    { title: L('Valuation',     'Valuasi'),        rows: valuationRows     },
  ];

  // ── Readiness gate ─────────────────────────────────────────────────────────
  const ready = {
    liquidity:     has(lq,'currentAssets')   && has(lq,'currentLiabilities') && n(lq,'currentLiabilities') !== 0,
    profitability: has(pr,'netIncome')        && has(pr,'totalRevenue')       && n(pr,'totalRevenue') !== 0,
    leverage:      has(lv,'totalLiabilities') && has(lv,'totalEquity')        && n(lv,'totalEquity') !== 0,
    efficiency:    has(ef,'totalRevenue')     && has(ef,'accountsReceivable') && n(ef,'accountsReceivable') !== 0,
    valuation:     has(va,'marketPrice')      && has(va,'eps')                && n(va,'eps') !== 0,
  };
  const allReady = Object.values(ready).every(Boolean);

  const allOutputsFilled = sections.every(s =>
    s.rows.every(r => r.result.color !== 'text-muted-foreground/40')
  );

  const categoryNames: Record<keyof typeof ready, string> = {
    liquidity:     L('Liquidity',     'Likuiditas'),
    profitability: L('Profitability', 'Profitabilitas'),
    leverage:      L('Leverage',      'Leverage'),
    efficiency:    L('Efficiency',    'Efisiensi'),
    valuation:     L('Valuation',     'Valuasi'),
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
          {L('Summary', 'Ringkasan')}
        </h1>

        {allReady && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            {L('Download PDF', 'Unduh PDF')}
          </button>
        )}
      </div>

      {!allReady ? (
        <div className="border border-border rounded-2xl p-5 flex gap-3 items-start max-w-lg">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {L('Fill in all 5 tabs to view the summary.', 'Isi semua 5 tab untuk melihat ringkasan.')}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {L(
                'The summary is available once Liquidity, Profitability, Leverage, Efficiency, and Valuation each have at least one calculable ratio.',
                'Ringkasan tersedia setelah Likuiditas, Profitabilitas, Leverage, Efisiensi, dan Valuasi masing-masing memiliki setidaknya satu rasio yang dapat dihitung.'
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(Object.keys(ready) as (keyof typeof ready)[]).map(k => (
                <span
                  key={k}
                  className={cn(
                    'text-[11px] font-medium px-2 py-0.5 rounded-full border',
                    ready[k]
                      ? 'text-green-700 border-green-200'
                      : 'text-muted-foreground border-border'
                  )}
                >
                  {ready[k] ? '✓ ' : ''}{categoryNames[k]}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sections.map(s => (
              <Section key={s.title} title={s.title} rows={s.rows} />
            ))}
          </div>

          {/* ── Big-picture narrative (only when every ratio is filled) ── */}
          {allOutputsFilled && (() => {
            const { p1, p2 } = generateBigPicture(sections, isEn);
            return (
              <div className="mt-8 pt-6 border-t border-border space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  {L('Overview', 'Gambaran Umum')}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p1}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p2}</p>
              </div>
            );
          })()}
        </>
      )}

      {showModal && (
        <PdfModal
          isEn={isEn}
          onClose={() => setShowModal(false)}
          onDownload={(meta) => buildPdf(sections, meta, isEn, allOutputsFilled ? generateBigPicture(sections, isEn) : null)}
        />
      )}
    </div>
  );
}
