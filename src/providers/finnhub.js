// Finnhub API — https://finnhub.io/docs/api
// Used for: company news, earnings calendar, analyst upgrades/downgrades,
// price-target changes, IPO calendar.
// Auth: `token` query param (FINNHUB_API_KEY secret). Free tier: 60 calls/min.
import { CatalystProvider, unavailable } from './interfaces.js';

const BASE = 'https://finnhub.io/api/v1';

async function finnhubFetch(env, path, params) {
  if (!env.FINNHUB_API_KEY) return unavailable('FINNHUB_API_KEY secret not configured');
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  url.searchParams.set('token', env.FINNHUB_API_KEY);
  let res;
  try {
    res = await fetch(url.toString());
  } catch (err) {
    return unavailable(`Finnhub network error: ${err.message}`);
  }
  if (!res.ok) return unavailable(`Finnhub HTTP ${res.status}`);
  return { ok: true, data: await res.json(), sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
}

export class FinnhubCatalystProvider extends CatalystProvider {
  async getCatalysts(ticker, env) {
    const catalysts = [];
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const news = await finnhubFetch(env, '/company-news', { symbol: ticker, from: weekAgo, to: today });
    if (news.ok && Array.isArray(news.data)) {
      for (const n of news.data.slice(0, 8)) {
        catalysts.push({ type: 'news', headline: n.headline, timestamp: n.datetime * 1000, source: n.source });
      }
    }

    const earnings = await finnhubFetch(env, '/calendar/earnings', { symbol: ticker, from: today, to: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) });
    if (earnings.ok && Array.isArray(earnings.data?.earningsCalendar)) {
      for (const e of earnings.data.earningsCalendar) {
        catalysts.push({ type: 'earnings', headline: `Earnings ${e.date} (${e.hour || 'time TBD'})`, timestamp: new Date(e.date).getTime() });
      }
    }

    const upgrades = await finnhubFetch(env, '/stock/upgrade-downgrade', { symbol: ticker, from: weekAgo, to: today });
    if (upgrades.ok && Array.isArray(upgrades.data)) {
      for (const u of upgrades.data.slice(0, 5)) {
        const type = u.action === 'up' ? 'upgrade' : u.action === 'down' ? 'downgrade' : 'price-target';
        catalysts.push({ type, headline: `${u.company}: ${u.fromGrade || ''}→${u.toGrade || ''}`.trim(), timestamp: Date.parse(u.gradeTime) || Date.now(), source: u.company });
      }
    }

    if (catalysts.length === 0 && !news.ok && !earnings.ok && !upgrades.ok) {
      return unavailable('Finnhub returned no usable data for this ticker');
    }
    catalysts.sort((a, b) => b.timestamp - a.timestamp);
    return { ok: true, data: catalysts, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
  }
}
