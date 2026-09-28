// Tradier Brokerage API — https://documentation.tradier.com/brokerage-api
// Used for: quotes, intraday bars, option chains, option expirations.
// Auth: Bearer token in Authorization header (TRADIER_TOKEN secret).
// Sandbox base: https://sandbox.tradier.com/v1
// Production base: https://api.tradier.com/v1
import { QuoteProvider, OptionsProvider, unavailable } from './interfaces.js';

function baseUrl(env) {
  return env.APP_ENV === 'production'
    ? 'https://api.tradier.com/v1'
    : 'https://sandbox.tradier.com/v1';
}

async function tradierFetch(env, path, params) {
  if (!env.TRADIER_TOKEN) return unavailable('TRADIER_TOKEN secret not configured');
  const url = new URL(baseUrl(env) + path);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  let res;
  try {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${env.TRADIER_TOKEN}`, Accept: 'application/json' },
    });
  } catch (err) {
    return unavailable(`Tradier network error: ${err.message}`);
  }
  if (!res.ok) return unavailable(`Tradier HTTP ${res.status}`);
  const json = await res.json();
  return { ok: true, data: json, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
}

export class TradierQuoteProvider extends QuoteProvider {
  async getQuote(ticker, env) {
    const r = await tradierFetch(env, '/markets/quotes', { symbols: ticker, greeks: 'false' });
    if (!r.ok) return r;
    const q = r.data?.quotes?.quote;
    if (!q) return unavailable(`No quote returned for ${ticker}`);
    return {
      ok: true,
      data: {
        price: q.last, prevClose: q.prevclose, open: q.open, high: q.high, low: q.low,
        volume: q.volume, bid: q.bid, ask: q.ask, change: q.change, changePct: q.change_percentage,
      },
      sourceTimestamp: q.trade_date ? Number(q.trade_date) : Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'delayed', // Tradier sandbox/basic quotes are delayed unless a live market-data plan is active
    };
  }

  async getBars(ticker, interval, lookback, env) {
    // interval: '1min' | '5min' | '15min' | 'daily'
    const end = new Date();
    const start = new Date(end.getTime() - lookback);
    const path = interval === 'daily' ? '/markets/history' : '/markets/timesales';
    const params = interval === 'daily'
      ? { symbol: ticker, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
      : { symbol: ticker, interval, start: start.toISOString(), end: end.toISOString() };
    const r = await tradierFetch(env, path, params);
    if (!r.ok) return r;
    const raw = interval === 'daily' ? r.data?.history?.day : r.data?.series?.data;
    if (!raw) return unavailable(`No bar data for ${ticker}`);
    const bars = (Array.isArray(raw) ? raw : [raw]).map((b) => ({
      time: b.time || b.date,
      open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
    }));
    return { ok: true, data: bars, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
  }
}

export class TradierOptionsProvider extends OptionsProvider {
  async getExpirations(ticker, env) {
    const r = await tradierFetch(env, '/markets/options/expirations', { symbol: ticker, includeAllRoots: 'true' });
    if (!r.ok) return r;
    const dates = r.data?.expirations?.date;
    if (!dates) return unavailable(`No expirations for ${ticker}`);
    return { ok: true, data: Array.isArray(dates) ? dates : [dates], sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
  }

  async getChain(ticker, expiration, env) {
    const r = await tradierFetch(env, '/markets/options/chains', { symbol: ticker, expiration, greeks: 'true' });
    if (!r.ok) return r;
    const options = r.data?.options?.option;
    if (!options) return unavailable(`No chain for ${ticker} ${expiration}`);
    const list = Array.isArray(options) ? options : [options];
    const contracts = list.map((o) => ({
      symbol: o.symbol, type: o.option_type, strike: o.strike, expiration: o.expiration_date,
      bid: o.bid, ask: o.ask, last: o.last, volume: o.volume, openInterest: o.open_interest,
      delta: o.greeks?.delta, iv: o.greeks?.mid_iv,
    }));
    return { ok: true, data: contracts, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
  }
}
