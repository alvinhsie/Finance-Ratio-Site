import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface HistoryRow { date: string; close: number | null; }

interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST' | string;
  time: number | null;
  currency: string | null;
  unitHint: string | null;
  history: HistoryRow[];
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
}

const METRICS: MetricDef[] = [
  { id: 'us10y',  nameEn: 'US 10Y Yield',   nameId: 'Yield US 10Y',      descEn: 'US Treasury 10-Year',        descId: 'Obligasi AS 10 Tahun'       },
  { id: 'vix',    nameEn: 'VIX',             nameId: 'VIX',               descEn: 'CBOE Volatility Index',      descId: 'Indeks Volatilitas CBOE'     },
  { id: 'dxy',    nameEn: 'DXY',             nameId: 'DXY',               descEn: 'US Dollar Index',            descId: 'Indeks Dolar AS'             },
  { id: 'coal',   nameEn: 'Coal',            nameId: 'Batu Bara',         descEn: 'Peabody Energy · Coal Proxy (BTU)',   descId: 'Peabody Energy · Proksi Batu Bara (BTU)'  },
  { id: 'nickel', nameEn: 'Nickel',          nameId: 'Nikel',             descEn: 'Sprott Nickel Miners ETF (NIKL)',     descId: 'ETF Penambang Nikel Sprott (NIKL)'        },
  { id: 'wti',    nameEn: 'Crude Oil WTI',   nameId: 'Minyak Mentah WTI', descEn: 'West Texas Intermediate',    descId: 'Minyak Mentah WTI'           },
  { id: 'nyse',   nameEn: 'NYSE',            nameId: 'NYSE',              descEn: 'NYSE Composite Index',       descId: 'Indeks Komposit NYSE'        },
  { id: 'ihsg',   nameEn: 'IHSG',            nameId: 'IHSG',              descEn: 'Indonesia Composite',        descId: 'Indeks Harga Saham'          },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtPrice(price: number | null, unitHint: string | null, id: string): string {
  if (price === null) return '–';
  if (unitHint === 'pct' || id === 'us10y') return price.toFixed(2) + '%';
  if (id === 'vix' || id === 'dxy') return price.toFixed(2);
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function fmtDate(iso: string, isEn: boolean): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(isEn ? 'en-US' : 'id-ID', { month: 'short', day: 'numeric' });
}

function marketStateBadge(state: string, isEn: boolean) {
  switch (state) {
    case 'REGULAR': return { label: isEn ? 'Open' : 'Buka',        cls: 'bg-green-100 text-green-700', dot: 'bg-green-500 animate-pulse' };
    case 'PRE':     return { label: isEn ? 'Pre-Market' : 'Pra-Pasar', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
    case 'POST':    return { label: isEn ? 'After Hours' : 'Pasca-Pasar', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
    default:        return { label: isEn ? 'Closed' : 'Tutup',      cls: 'bg-muted text-muted-foreground', dot: 'bg-gray-400' };
  }
}

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ metric, quote, isEn }: {
  metric: MetricDef;
  quote: Quote | undefined;
  isEn: boolean;
}) {
  const name = isEn ? metric.nameEn : metric.nameId;
  const desc = isEn ? metric.descEn : metric.descId;
  const price = quote?.price ?? null;
  const change = quote?.change ?? null;
  const pct = quote?.changePercent ?? null;
  const state = quote?.marketState ?? 'CLOSED';
  const badge = marketStateBadge(state, isEn);
  const positive = change !== null && change >= 0;
  const negative = change !== null && change < 0;

  const sign = change !== null ? (change >= 0 ? '+' : '') : '';
  const absStr = change !== null ? sign + change.toFixed(2) : '–';
  const pctStr = pct !== null ? sign + pct.toFixed(2) + '%' : '–';

  const history = quote?.history ?? [];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{name}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-snug">{desc}</p>
        </div>
        <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0', badge.cls)}>
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', badge.dot)} />
          {badge.label}
        </span>
      </div>

      {/* Live price + change */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{isEn ? 'Live' : 'Langsung'}</p>
          <p className={cn('text-2xl font-extrabold tracking-tight leading-none', price === null ? 'text-muted-foreground' : 'text-foreground')}>
            {fmtPrice(price, quote?.unitHint ?? null, metric.id)}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            {positive && <TrendingUp className="w-3 h-3 text-green-600" />}
            {negative && <TrendingDown className="w-3 h-3 text-red-500" />}
            <span className={cn('text-sm font-semibold', positive ? 'text-green-600' : negative ? 'text-red-500' : 'text-muted-foreground')}>
              {absStr}
            </span>
          </div>
          <span className={cn(
            'text-[11px] px-1.5 py-0.5 rounded font-semibold',
            positive ? 'bg-green-50 text-green-700' : negative ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground',
          )}>
            {pctStr}
          </span>
        </div>
      </div>

      {/* 5-day history */}
      <div className="border-t border-border/50 pt-2">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
          {isEn ? 'Last 5 Days' : '5 Hari Terakhir'}
        </p>
        {history.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/50 italic">{isEn ? 'No history available' : 'Riwayat tidak tersedia'}</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {[...history].reverse().map((row) => (
              <div key={row.date} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{fmtDate(row.date, isEn)}</span>
                <span className="text-[11px] font-semibold text-foreground tabular-nums">
                  {fmtPrice(row.close, quote?.unitHint ?? null, metric.id)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const REFRESH_INTERVAL = 30_000;

export function MacroPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const L = (en: string, id: string) => isEn ? en : id;

  const [data, setData] = useState<Record<string, Quote>>({});
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            {L('Live price · last 5 trading days · auto-refreshes every 30 s', 'Harga langsung · 5 hari terakhir · diperbarui setiap 30 dtk')}
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

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {L('Failed to fetch live data: ', 'Gagal memuat data: ')}{error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <MetricCard
            key={m.id}
            metric={m}
            quote={data[m.id]}
            isEn={isEn}
          />
        ))}
      </div>
    </div>
  );
}
