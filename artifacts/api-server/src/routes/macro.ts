import { Router } from "express";
import YahooFinance from "yahoo-finance2";

const router = Router();
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

const METRICS = [
  { id: "us10y",  symbol: "^TNX",     unitHint: "pct" as const },
  { id: "vix",    symbol: "^VIX",     unitHint: null },
  { id: "dxy",    symbol: "DX-Y.NYB", unitHint: null },
  { id: "coal",   symbol: "BTU",      unitHint: null },
  { id: "nickel", symbol: "NIKL",     unitHint: null },
  { id: "wti",    symbol: "CL=F",     unitHint: null },
  { id: "nyse",   symbol: "^NYA",     unitHint: null },
  { id: "ihsg",   symbol: "^JKSE",    unitHint: null },
];

const SYM_TO_METRIC = Object.fromEntries(METRICS.map((m) => [m.symbol, m]));

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Fetch last 5 trading-day closes using the chart() API */
async function fetchHistory(
  symbol: string,
): Promise<{ date: string; close: number }[]> {
  try {
    const result = await yahooFinance.chart(
      symbol,
      { period1: daysAgo(14), period2: new Date(), interval: "1d" },
      { validateResult: false },
    );

    const quotes: any[] = result?.quotes ?? [];
    return quotes
      .filter((q) => q.close != null)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .slice(-5)
      .map((q) => ({
        date: (q.date instanceof Date ? q.date : new Date(q.date))
          .toISOString()
          .slice(0, 10),
        close: q.close as number,
      }));
  } catch {
    return [];
  }
}

router.get("/macro", async (_req, res) => {
  try {
    const symbols = METRICS.map((m) => m.symbol);

    // Fetch quotes + all history in parallel
    const [quotesRaw, ...histResults] = await Promise.all([
      yahooFinance.quote(symbols, {}, { validateResult: false }),
      ...METRICS.map((m) => fetchHistory(m.symbol)),
    ]);

    const quotes = Array.isArray(quotesRaw) ? quotesRaw : [quotesRaw];
    const data: Record<string, unknown> = {};

    for (const q of quotes) {
      const metric = SYM_TO_METRIC[q.symbol];
      if (!metric) continue;

      const rawState = (q.marketState ?? "CLOSED") as string;
      const normalizedState = rawState.startsWith("REGULAR")
        ? "REGULAR"
        : rawState.startsWith("PRE")
          ? "PRE"
          : rawState.startsWith("POST")
            ? "POST"
            : "CLOSED";

      const metricIdx = METRICS.findIndex((m) => m.symbol === q.symbol);

      data[metric.id] = {
        symbol: q.symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        marketState: normalizedState,
        time: q.regularMarketTime
          ? q.regularMarketTime instanceof Date
            ? q.regularMarketTime.getTime()
            : Number(q.regularMarketTime) * 1000
          : null,
        currency: q.currency ?? null,
        unitHint: metric.unitHint,
        history: histResults[metricIdx] ?? [],
      };
    }

    res.json({ ok: true, data, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
