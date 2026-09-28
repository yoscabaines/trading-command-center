// ---------------------------------------------------------------------------
// PROVIDER INTERFACES
//
// Every data source the app touches implements one of these shapes. This
// lets you swap Tradier for Schwab, or Finnhub for Benzinga, by writing a
// new file in this folder and changing one line in providers/index.js —
// nothing in engine/ or api/ needs to change.
//
// HARD RULE enforced throughout this codebase: a provider that cannot
// fetch real data for a request MUST return { ok:false, reason } rather
// than inventing a plausible-looking value. Callers are required to check
// `ok` and propagate unavailability rather than substitute a default.
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ProviderResult
 * @property {boolean} ok
 * @property {any} [data]
 * @property {string} [reason]           - populated when ok === false
 * @property {number} sourceTimestamp    - epoch ms the data reflects (from provider, not now())
 * @property {number} retrievedTimestamp - epoch ms this fetch completed
 * @property {'live'|'delayed'|'stale'|'unavailable'} freshness
 */

/**
 * UniverseProvider — the list of optionable U.S. underlyings to scan.
 * @interface
 * getUniverse(): Promise<ProviderResult>  // data: string[] tickers
 */
export class UniverseProvider {
  async getUniverse(_env) {
    throw new Error('UniverseProvider.getUniverse not implemented');
  }
}

/**
 * QuoteProvider — real-time/delayed quotes and intraday bars.
 * @interface
 * getQuote(ticker): Promise<ProviderResult>          // data: {price, prevClose, open, high, low, volume, ...}
 * getBars(ticker, interval, lookback): Promise<ProviderResult> // data: OHLCV[]
 */
export class QuoteProvider {
  async getQuote(_ticker, _env) { throw new Error('QuoteProvider.getQuote not implemented'); }
  async getBars(_ticker, _interval, _lookback, _env) { throw new Error('QuoteProvider.getBars not implemented'); }
}

/**
 * OptionsProvider — chains and per-contract Greeks/liquidity.
 * @interface
 * getChain(ticker, expiration): Promise<ProviderResult> // data: OptionContract[]
 * getExpirations(ticker): Promise<ProviderResult>        // data: string[] (YYYY-MM-DD)
 */
export class OptionsProvider {
  async getChain(_ticker, _expiration, _env) { throw new Error('OptionsProvider.getChain not implemented'); }
  async getExpirations(_ticker, _env) { throw new Error('OptionsProvider.getExpirations not implemented'); }
}

/**
 * CatalystProvider — news, earnings, analyst actions, corporate events.
 * @interface
 * getCatalysts(ticker): Promise<ProviderResult> // data: Catalyst[]
 */
export class CatalystProvider {
  async getCatalysts(_ticker, _env) { throw new Error('CatalystProvider.getCatalysts not implemented'); }
}

/**
 * @typedef {Object} OptionContract
 * @property {string} symbol
 * @property {'call'|'put'} type
 * @property {number} strike
 * @property {string} expiration
 * @property {number} bid
 * @property {number} ask
 * @property {number} last
 * @property {number} volume
 * @property {number} openInterest
 * @property {number} [delta]
 * @property {number} [iv]
 */

/**
 * @typedef {Object} Catalyst
 * @property {'earnings'|'news'|'upgrade'|'downgrade'|'price-target'|'fda'|'corporate'|'ipo'|'economic'} type
 * @property {string} headline
 * @property {number} timestamp
 * @property {string} [source]
 */

export function unavailable(reason) {
  return { ok: false, reason, sourceTimestamp: null, retrievedTimestamp: Date.now(), freshness: 'unavailable' };
}
