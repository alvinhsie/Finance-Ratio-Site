import { useEffect, useRef, useState, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  prevClose: number | null;
  marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST' | string;
  time: number | null;
  currency: string | null;
  shortName: string | null;
  unitHint: string | null;
}

interface ApiResponse {
  ok: boolean;
  data: Record<string, Quote>;
  fetchedAt: number;
  error?: string;
}

interface MetricDef {
  id: string;
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  tvSymbol?: string;
}

const METRICS: MetricDef[] = [
  { id: 'us10y',        nameEn: 'US 10Y Yield',    nameId: 'Yield US 10Y',       descEn: 'US Treasury 10-Year',    descId: 'Obligasi AS 10 Tahun',  tvSymbol: 'TVC:US10Y' },
  { id: 'vix',          nameEn: 'VIX',              nameId: 'VIX',                descEn: 'CBOE Volatility Index',  descId: 'Indeks Volatilitas',    tvSymbol: 'CBOE:VIX' },
  { id: 'dxy',          nameEn: 'DXY',              nameId: 'DXY',                descEn: 'US Dollar Index',        descId: 'Indeks Dolar AS',       tvSymbol: 'TVC:DXY' },
  { id: 'coal',         nameEn: 'Coal',             nameId: 'Batu Bara',          descEn: 'Newcastle Coal Futures', descId: 'Futures Batu Bara',     tvSymbol: 'TVC:COAL' },
  { id: 'nickel',       nameEn: 'Nickel',           nameId: 'Nikel',              descEn: 'Bloomberg Nickel ETN (JJN)', descId: 'ETN Nikel Bloomberg (JJN)', tvSymbol: 'TVC:NICKEL' },
  { id: 'wti',          nameEn: 'Crude Oil WTI',    nameId: 'Minyak Mentah WTI',  descEn: 'West Texas Intermediate',descId: 'Minyak Mentah WTI',     tvSymbol: 'TVC:USOIL' },
  { id: 'nyse',         nameEn: 'NYSE',             nameId: 'NYSE',               descEn: 'NYSE Composite Index',   descId: 'Indeks Komposit NYSE',  tvSymbol: 'NYSE:NYA' },
  { id: 'ihsg',         nameEn: 'IHSG',             nameId: 'IHSG',               descEn: 'Indonesia Composite',    descId: 'Indeks Harga Saham',    tvSymbol: 'IDX:COMPOSITE' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(price: number | null, unitHint: string | null, id: string): string {
  if (price === null) return 'N/A';
  if (unitHint === 'pct' || id === 'us10y') return price.toFixed(2) + '%';
  if (id === 'vix' || id === 'dxy') return price.toFixed(2);
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function fmtChange(change: number | null, pct: number | null): { abs: string; pct: string } {
  if (change === null || pct === null) return { abs: '–', pct: '–' };
  const sign = change >= 0 ? '+' : '';
  return {
    abs: sign + change.toFixed(2),
    pct: sign + pct.toFixed(2) + '%',
  };
}

function marketStateBadge(state: string, isEn: boolean) {
  switch (state) {
    case 'REGULAR': return { label: isEn ? 'Open' : 'Buka', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
    case 'PRE':     return { label: isEn ? 'Pre-Market' : 'Pra-Pasar', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
    case 'POST':    return { label: isEn ? 'After Hours' : 'Pasca-Pasar', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
    default:        return { label: isEn ? 'Closed' : 'Tutup', cls: 'bg-muted text-muted-foreground', dot: 'bg-gray-400' };
  }
}

// ── TradingView Chart Modal ────────────────────────────────────────────────
function TradingViewChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'height:100%;width:100%;';
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = 'height:100%;width:100%;';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true, symbol, interval: 'D', timezone: 'Asia/Jakarta',
      theme: 'light', style: '1', locale: 'en',
      withdateranges: true, allow_symbol_change: false, calendar: false,
      hide_side_toolbar: false,
    });
    wrapper.appendChild(inner);
    wrapper.appendChild(script);
    el.appendChild(wrapper);
    return () => { el.innerHTML = ''; };
  }, [symbol]);
  return <div ref={ref} className="w-full h-full" />;
}

function ChartModal({ metric, isEn, onClose }: { metric: MetricDef; isEn: boolean; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ margin: '24px auto', width: 'calc(100% - 48px)', height: 'calc(100% - 48px)', maxWidth: '1100px' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <p className="font-bold text-foreground">{isEn ? metric.nameEn : metric.nameId}</p>
            <p className="text-xs text-muted-foreground">{isEn ? 'Historical chart via TradingView' : 'Grafik historis via TradingView'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          {metric.tvSymbol && <TradingViewChart symbol={metric.tvSymbol} />}
        </div>
      </div>
    </div>
  );
}

// ── Quote Card ─────────────────────────────────────────────────────────────
function QuoteCard({ metric, quote, isEn, onClick }: {
  metric: MetricDef;
  quote: Quote | undefined;
  isEn: boolean;
  onClick: () => void;
}) {
  const name = isEn ? metric.nameEn : metric.nameId;
  const desc = isEn ? metric.descEn : metric.descId;
  const price = quote?.price ?? null;
  const change = quote?.change ?? null;
  const pct = quote?.changePercent ?? null;
  const state = quote?.marketState ?? 'CLOSED';
  const badge = marketStateBadge(state, isEn);
  const { abs, pct: pctStr } = fmtChange(change, pct);
  const positive = change !== null && change >= 0;
  const negative = change !== null && change < 0;

  return (
    <button
      onClick={onClick}
      className="group bg-card border border-border rounded-2xl p-5 text-left w-full hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{desc}</p>
        </div>
        <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', badge.cls)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', badge.dot, state === 'REGULAR' && 'animate-pulse')} />
          {badge.label}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className={cn(
          'text-3xl font-extrabold tracking-tight leading-none',
          price === null ? 'text-muted-foreground' : 'text-foreground',
        )}>
          {price === null ? 'N/A' : fmt(price, quote?.unitHint ?? null, metric.id)}
        </p>
        {quote?.currency && price !== null && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{quote.currency}</p>
        )}
      </div>

      {/* Change */}
      <div className="flex items-center gap-2">
        {positive && <TrendingUp className="w-3.5 h-3.5 text-green-600 shrink-0" />}
        {negative && <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />}
        <span className={cn(
          'text-sm font-semibold',
          positive ? 'text-green-600' : negative ? 'text-red-500' : 'text-muted-foreground',
        )}>
          {abs}
        </span>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-md font-semibold',
          positive ? 'bg-green-50 text-green-700' : negative ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground',
        )}>
          {pctStr}
        </span>
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 group-hover:text-primary/60 transition-colors mt-auto pt-1 border-t border-border/40">
        <BarChart2 className="w-3 h-3" />
        {isEn ? 'Click for historical chart' : 'Klik untuk grafik historis'}
      </div>
    </button>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────
const REFRESH_INTERVAL = 30_000; // 30 s

export function MacroPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  const [data, setData] = useState<Record<string, Quote>>({});
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MetricDef | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/macro');
      const json: ApiResponse = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'API error');
      setData(json.data);
      setFetchedAt(json.fetchedAt);
      setError(null);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  const updatedStr = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
            {L('Macro Dashboard', 'Dasbor Makro')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {L('Live data · auto-refreshes every 30 s · click any card for history', 'Data langsung · diperbarui setiap 30 dtk · klik kartu untuk historis')}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          {updatedStr ? L(`Updated ${updatedStr}`, `Diperbarui ${updatedStr}`) : L('Refreshing…', 'Memuat…')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {L('Failed to fetch live data: ', 'Gagal memuat data: ')}{error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <QuoteCard
            key={m.id}
            metric={m}
            quote={data[m.id]}
            isEn={isEn}
            onClick={() => setSelected(m)}
          />
        ))}
      </div>

      {/* Chart Modal */}
      {selected && (
        <ChartModal metric={selected} isEn={isEn} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
