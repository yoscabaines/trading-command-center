// ---------------------------------------------------------------------------
// UNIVERSE PROVIDER
//
// HONEST LIMITATION: there is no free, no-key API that returns "the full
// list of U.S. underlyings with listed options" directly. What's freely
// available (and used here) is Nasdaq Trader's public symbol directory,
// which lists all NASDAQ/NYSE/AMEX-listed common stocks and ETFs:
//   https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt
//   https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt
// That is a listed-equity universe, not an optionable-only universe —
// it includes plenty of tickers with no listed options.
//
// To narrow to truly optionable names you need either (a) a paid
// reference-data feed (e.g. OPRA-backed providers, Tradier's full
// instrument dump, Polygon's options reference endpoint), or (b) to
// cross-check each candidate against an options-expirations lookup,
// which is expensive to do for thousands of symbols on every scan.
//
// This module does both, honestly:
//   1. getRawListedUniverse() — real, free, no key: every listed equity/ETF.
//   2. filterToOptionable() — cross-checks candidates against the configured
//      OptionsProvider's getExpirations() and caches the optionable/not
//      verdict in KV for OPTIONABLE_CACHE_TTL_MS so repeat scans don't
//      re-verify the same ticker every cycle.
//
// If you get access to a provider that returns the optionable universe
// directly (Polygon `/v3/reference/options/contracts` grouped by underlying,
// or a paid OPRA feed), swap step 2 for a single call to that endpoint —
// the UniverseProvider interface doesn't change.
// ---------------------------------------------------------------------------
import { UniverseProvider, unavailable } from './interfaces.js';

const NASDAQ_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt';
const OTHER_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt';
const OPTIONABLE_CACHE_TTL_MS = 24 * 3600 * 1000;

function parsePipeDelimited(text, symbolCol, testIssueCol) {
  const lines = text.trim().split('\n');
  const out = [];
  for (let i = 1; i < lines.length - 1; i++) { // skip header + footer "File Creation Time" line
    const cols = lines[i].split('|');
    const symbol = cols[symbolCol];
    const isTest = cols[testIssueCol] === 'Y';
    if (symbol && !isTest && /^[A-Z.]{1,6}$/.test(symbol)) out.push(symbol.replace('.', '-'));
  }
  return out;
}

export class NasdaqTraderUniverseProvider extends UniverseProvider {
  async getUniverse(env) {
    let nasdaqText, otherText;
    try {
      const [a, b] = await Promise.all([fetch(NASDAQ_LISTED_URL), fetch(OTHER_LISTED_URL)]);
      if (!a.ok || !b.ok) return unavailable(`Symbol directory fetch failed (${a.status}/${b.status})`);
      [nasdaqText, otherText] = await Promise.all([a.text(), b.text()]);
    } catch (err) {
      return unavailable(`Symbol directory network error: ${err.message}`);
    }
    // nasdaqlisted.txt columns: Symbol|Security Name|Market Category|Test Issue|...
    // otherlisted.txt columns:  ACT Symbol|Security Name|Exchange|...|Test Issue|...
    const nasdaq = parsePipeDelimited(nasdaqText, 0, 3);
    const other = parsePipeDelimited(otherText, 0, 6);
    const universe = Array.from(new Set([...nasdaq, ...other])).sort();
    if (universe.length === 0) return unavailable('Symbol directories parsed to zero symbols');
    return { ok: true, data: universe, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: 'delayed' };
  }
}

/**
 * Filters a raw listed-equity universe down to names verified optionable,
 * using KV as a rolling cache so the (expensive) per-symbol verification
 * doesn't repeat every scan cycle.
 *
 * @param {string[]} candidates
 * @param {import('./interfaces.js').OptionsProvider} optionsProvider
 * @param {KVNamespace} cacheKv
 * @param {any} env
 * @param {number} maxNewChecksPerRun - caps how many *uncached* symbols get
 *   verified in one invocation, to protect rate limits. Previously-verified
 *   symbols are returned regardless of this cap.
 */
export async function filterToOptionable(candidates, optionsProvider, cacheKv, env, maxNewChecksPerRun = 150) {
  const optionable = [];
  let newChecks = 0;
  for (const ticker of candidates) {
    const cacheKey = `optionable:${ticker}`;
    const cached = cacheKv ? await cacheKv.get(cacheKey, 'json') : null;
    if (cached && Date.now() - cached.checkedAt < OPTIONABLE_CACHE_TTL_MS) {
      if (cached.optionable) optionable.push(ticker);
      continue;
    }
    if (newChecks >= maxNewChecksPerRun) continue; // leave unverified; next cycle picks it up
    newChecks++;
    const r = await optionsProvider.getExpirations(ticker, env);
    const isOptionable = r.ok && Array.isArray(r.data) && r.data.length > 0;
    if (cacheKv) {
      await cacheKv.put(cacheKey, JSON.stringify({ optionable: isOptionable, checkedAt: Date.now() }), {
        expirationTtl: Math.floor(OPTIONABLE_CACHE_TTL_MS / 1000),
      });
    }
    if (isOptionable) optionable.push(ticker);
  }
  return optionable;
}
