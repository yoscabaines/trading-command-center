// Alpaca Market Data API
// Used for underlying stock/ETF quotes and historical intraday/daily bars.
// Options chains are intentionally NOT used by this scanner.

import { QuoteProvider, unavailable } from './interfaces.js';

const BASE = 'https://data.alpaca.markets/v2';

function headers(env) {
  return {
    'APCA-API-KEY-ID': env.ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': env.ALPACA_API_SECRET,
    Accept: 'application/json',
  };
}

async function alpacaFetch(env, path, params = {}) {
  if (!env.ALPACA_API_KEY || !env.ALPACA_API_SECRET) {
    return unavailable('Alpaca API credentials are not configured');
  }

  const url = new URL(`${BASE}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, value);
  }

  let res;

  try {
    res = await fetch(url.toString(), {
      headers: headers(env),
    });
  } catch (err) {
    return unavailable(`Alpaca network error: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return unavailable(`Alpaca HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }

  try {
    const json = await res.json();

    return {
      ok: true,
      data: json,
      sourceTimestamp: Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'live',
    };
  } catch (err) {
    return unavailable(`Alpaca invalid JSON response: ${err.message}`);
  }
}

function normalizeBars(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map((b) => ({
    time: b.t,
    open: Number(b.o),
    high: Number(b.h),
    low: Number(b.l),
    close: Number(b.c),
    volume: Number(b.v),
  }));
}

export class AlpacaQuoteProvider extends QuoteProvider {
  async getQuote(ticker, env) {
    const latest = await alpacaFetch(
      env,
      `/stocks/${encodeURIComponent(ticker)}/trades/latest`,
      { feed: 'iex' },
    );

    if (!latest.ok) return latest;

    const trade = latest.data?.trade;

    if (!trade?.p) {
      return unavailable(`No latest trade returned for ${ticker}`);
    }

    // Pull today's 1-minute bars so we can derive today's
    // open/high/low/volume and the most recent bar.
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);

    const bars = await alpacaFetch(
      env,
      `/stocks/${encodeURIComponent(ticker)}/bars`,
      {
        timeframe: '1Min',
        start: start.toISOString(),
        feed: 'iex',
        limit: 10000,
      },
    );

    const todayBars = bars.ok
      ? normalizeBars(bars.data?.bars)
      : [];

    const first = todayBars[0];

    return {
      ok: true,
      data: {
        price: Number(trade.p),
        prevClose: null,
        open: first?.open ?? Number(trade.p),
        high: todayBars.length
          ? Math.max(...todayBars.map((b) => b.high))
          : Number(trade.p),
        low: todayBars.length
          ? Math.min(...todayBars.map((b) => b.low))
          : Number(trade.p),
        volume: todayBars.length
          ? todayBars.reduce((sum, b) => sum + b.volume, 0)
          : 0,
        change: null,
        changePct: null,
      },
      sourceTimestamp: trade.t ? Date.parse(trade.t) : Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'live',
    };
  }

  async getBars(ticker, interval, lookback, env) {
    const timeframe = {
      '1min': '1Min',
      '5min': '5Min',
      '15min': '15Min',
      daily: '1Day',
    }[interval];

    if (!timeframe) {
      return unavailable(`Unsupported Alpaca interval: ${interval}`);
    }

    const end = new Date();
    const start = new Date(end.getTime() - lookback);

    const r = await alpacaFetch(
      env,
      `/stocks/${encodeURIComponent(ticker)}/bars`,
      {
        timeframe,
        start: start.toISOString(),
        end: end.toISOString(),
        feed: 'iex',
        limit: 10000,
      },
    );

    if (!r.ok) return r;

    const bars = normalizeBars(r.data?.bars);

    if (bars.length === 0) {
      return unavailable(`No ${interval} bars returned for ${ticker}`);
    }

    return {
      ok: true,
      data: bars,
      sourceTimestamp: bars.at(-1)?.time
        ? Date.parse(bars.at(-1).time)
        : Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'live',
    };
  }
}
