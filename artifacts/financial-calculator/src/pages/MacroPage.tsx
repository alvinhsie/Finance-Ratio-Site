import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

interface MetricDef {
  id: string;
  nameEn: string;
  nameId: string;
  symbol?: string;
  descEn: string;
  descId: string;
  isForeignFlow?: boolean;
}

const METRICS: MetricDef[] = [
  { id: 'us10y',        nameEn: 'US 10Y Yield',    nameId: 'Yield US 10Y',       symbol: 'TVC:US10Y',       descEn: 'US Treasury 10-Year Yield',       descId: 'Yield Obligasi Negara AS 10 Tahun' },
  { id: 'vix',          nameEn: 'VIX',              nameId: 'VIX',                symbol: 'CBOE:VIX',        descEn: 'CBOE Volatility Index',           descId: 'Indeks Volatilitas CBOE' },
  { id: 'dxy',          nameEn: 'DXY',              nameId: 'DXY',                symbol: 'TVC:DXY',         descEn: 'US Dollar Index',                 descId: 'Indeks Dolar AS' },
  { id: 'coal',         nameEn: 'Coal',             nameId: 'Batu Bara',          symbol: 'TVC:COAL',        descEn: 'Newcastle Coal Futures',          descId: 'Futures Batu Bara Newcastle' },
  { id: 'nickel',       nameEn: 'Nickel',           nameId: 'Nikel',              symbol: 'TVC:NICKEL',      descEn: 'LME Nickel Price',                descId: 'Harga Nikel LME' },
  { id: 'wti',          nameEn: 'Crude Oil WTI',    nameId: 'Minyak Mentah WTI',  symbol: 'TVC:USOIL',       descEn: 'West Texas Intermediate Crude',   descId: 'Minyak Mentah West Texas Intermediate' },
  { id: 'nyse',         nameEn: 'NYSE',             nameId: 'NYSE',               symbol: 'NYSE:NYA',        descEn: 'NYSE Composite Index',            descId: 'Indeks Komposit NYSE' },
  { id: 'ihsg',         nameEn: 'IHSG',             nameId: 'IHSG',               symbol: 'IDX:COMPOSITE',   descEn: 'Indonesia Composite Index',       descId: 'Indeks Harga Saham Gabungan' },
  { id: 'foreign-flow', nameEn: 'Foreign Flow',     nameId: 'Aliran Asing',       isForeignFlow: true,       descEn: 'Net foreign buy/sell on IDX',     descId: 'Net beli/jual asing di IDX' },
];

// ── TradingView Mini Chart ─────────────────────────────────────────────────
function TradingViewMini({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrapper.appendChild(inner);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 200,
      locale: 'en',
      dateRange: '1M',
      colorTheme: 'light',
      trendLineColor: '#2962ff',
      underLineColor: 'rgba(41,98,255,0.1)',
      underLineBottomColor: 'rgba(41,98,255,0)',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      noTimeScale: false,
    });
    wrapper.appendChild(script);
    el.appendChild(wrapper);

    return () => { el.innerHTML = ''; };
  }, [symbol]);

  return <div ref={ref} className="w-full h-[200px]" />;
}

// ── TradingView Advanced Chart (modal) ─────────────────────────────────────
function TradingViewChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.height = '100%';
    inner.style.width = '100%';
    wrapper.appendChild(inner);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'light',
      style: '1',
      locale: 'en',
      withdateranges: true,
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: false,
      support_host: 'https://www.tradingview.com',
    });
    wrapper.appendChild(script);
    el.appendChild(wrapper);

    return () => { el.innerHTML = ''; };
  }, [symbol]);

  return <div ref={ref} className="w-full h-full" />;
}

// ── Chart Modal ────────────────────────────────────────────────────────────
function ChartModal({
  metric,
  isEn,
  onClose,
}: {
  metric: MetricDef;
  isEn: boolean;
  onClose: () => void;
}) {
  const name = isEn ? metric.nameEn : metric.nameId;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full h-full max-w-6xl mx-auto my-6 mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" style={{ margin: '24px auto', width: 'calc(100% - 48px)', height: 'calc(100% - 48px)' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <p className="font-bold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{isEn ? metric.descEn : metric.descId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          {metric.symbol && <TradingViewChart symbol={metric.symbol} />}
        </div>
      </div>
    </div>
  );
}

// ── Foreign Flow Card ──────────────────────────────────────────────────────
function ForeignFlowCard({ isEn }: { isEn: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {isEn ? 'Foreign Flow' : 'Aliran Asing'}
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">
          {isEn ? 'Net Foreign Buy / Sell — IDX' : 'Net Beli / Jual Asing — IDX'}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {isEn
            ? 'Daily net foreign investor activity on the Indonesia Stock Exchange. Data is published by IDX after market close.'
            : 'Aktivitas bersih investor asing harian di Bursa Efek Indonesia. Data dipublikasikan oleh IDX setelah pasar tutup.'}
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-6">
        <BarChart2 className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
          {isEn
            ? 'View the latest foreign flow data on the official IDX website.'
            : 'Lihat data aliran asing terbaru di situs resmi IDX.'}
        </p>
        <a
          href="https://www.idx.co.id/id/data-pasar/perdagangan-saham/foreign-activities/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {isEn ? 'Open IDX Data' : 'Buka Data IDX'}
        </a>
        <a
          href="https://www.idx.co.id/id/data-pasar/perdagangan-saham/foreign-activities/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/60 underline underline-offset-2"
        >
          idx.co.id
        </a>
      </div>
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({
  metric,
  isEn,
  onClick,
}: {
  metric: MetricDef;
  isEn: boolean;
  onClick: () => void;
}) {
  const name = isEn ? metric.nameEn : metric.nameId;
  const desc = isEn ? metric.descEn : metric.descId;

  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-2xl overflow-hidden text-left w-full hover:border-primary/40 hover:shadow-md transition-all group"
    >
      <div className="px-4 pt-4 pb-1 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug">{desc}</p>
        </div>
        <BarChart2 className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0 mt-0.5" />
      </div>
      {metric.symbol && <TradingViewMini symbol={metric.symbol} />}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export function MacroPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  const [selected, setSelected] = useState<MetricDef | null>(null);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
          {L('Macro Dashboard', 'Dasbor Makro')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {L(
            'Live market data updated continuously. Click any card to view the full historical chart.',
            'Data pasar langsung diperbarui secara berkelanjutan. Klik kartu mana saja untuk melihat grafik historis lengkap.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map(m =>
          m.isForeignFlow ? (
            <ForeignFlowCard key={m.id} isEn={isEn} />
          ) : (
            <MetricCard
              key={m.id}
              metric={m}
              isEn={isEn}
              onClick={() => setSelected(m)}
            />
          )
        )}
      </div>

      {selected && !selected.isForeignFlow && (
        <ChartModal
          metric={selected}
          isEn={isEn}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
