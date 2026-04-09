import { Router } from "express";
import YahooFinance from "yahoo-finance2";

const router = Router();
const yahooFinance = new YahooFinance();

// Yahoo Finance symbols for each metric
const METRICS = [
  { id: "us10y",  symbol: "^TNX",     unitHint: "pct"  as const },
  { id: "vix",    symbol: "^VIX",     unitHint: null },
  { id: "dxy",    symbol: "DX-Y.NYB", unitHint: null },
  { id: "coal",   symbol: "MTF=F",    unitHint: null },
  { id: "nickel", symbol: "NI=F",     unitHint: null },
  { id: "wti",    symbol: "CL=F",     unitHint: null },
  { id: "nyse",   symbol: "^NYA",     unitHint: null },
  { id: "ihsg",   symbol: "^JKSE",    unitHint: null },
];

const SYM_TO_METRIC = Object.fromEntries(METRICS.map((m) => [m.symbol, m]));

router.get("/macro", async (_req, res) => {
  try {
    const symbols = METRICS.map((m) => m.symbol);

    const results = await yahooFinance.quote(symbols, {}, { validateResult: false });
    const quotes = Array.isArray(results) ? results : [results];

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

      data[metric.id] = {
        symbol: q.symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        prevClose: q.regularMarketPreviousClose ?? null,
        marketState: normalizedState,
        time: q.regularMarketTime
          ? (q.regularMarketTime instanceof Date
              ? q.regularMarketTime.getTime()
              : Number(q.regularMarketTime) * 1000)
          : null,
        currency: q.currency ?? null,
        shortName: q.shortName ?? null,
        unitHint: metric.unitHint,
      };
    }

    res.json({ ok: true, data, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
