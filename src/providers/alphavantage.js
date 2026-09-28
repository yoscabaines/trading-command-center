// Alpha Vantage — https://www.alphavantage.co/documentation/
// Used only as a fallback QuoteProvider when Tradier is unavailable.
// Free tier is heavily rate-limited (25 req/day as of this writing) — treat
// this as an emergency fallback, not a primary source for a broad scan.
import { QuoteProvider, unavailable } from './interfaces.js';

const BASE = 'https://www.alphavantage.co/query';

export class AlphaVantageQuoteProvider extends QuoteProvider {
  async getQuote(ticker, env) {
    if (!env.ALPHAVANTAGE_KEY) return unavailable('ALPHAVANTAGE_KEY secret not configured');
    const url = new URL(BASE);
    url.searchParams.set('function', 'GLOBAL_QUOTE');
    url.searchParams.set('symbol', ticker);
    url.searchParams.set('apikey', env.ALPHAVANTAGE_KEY);
    let res;
    try {
      res = await fetch(url.toString());
    } catch (err) {
      return unavailable(`Alpha Vantage network error: ${err.message}`);
    }
    if (!res.ok) return unavailable(`Alpha Vantage HTTP ${res.status}`);
    const json = await res.json();
    const q = json['Global Quote'];
    if (!q || !q['05. price']) return unavailable(`No quote for ${ticker} (rate limited or invalid symbol)`);
    return {
      ok: true,
      data: {
        price: Number(q['05. price']), prevClose: Number(q['08. previous close']),
        open: Number(q['02. open']), high: Number(q['03. high']), low: Number(q['04. low']),
        volume: Number(q['06. volume']),
      },
      sourceTimestamp: Date.parse(q['07. latest trading day']) || Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'delayed',
    };
  }

  async getBars() {
    return unavailable('AlphaVantageQuoteProvider does not implement getBars — use TradierQuoteProvider');
  }
}
