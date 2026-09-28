// Single place that wires which concrete provider implements each role.
// Swap a provider by changing an import + instantiation here — nothing
// else in the codebase references a provider class by name.
import { TradierQuoteProvider, TradierOptionsProvider } from './tradier.js';
import { AlphaVantageQuoteProvider } from './alphavantage.js';
import { FinnhubCatalystProvider } from './finnhub.js';
import { NasdaqTraderUniverseProvider } from './universe.js';

export const providers = {
  universe: new NasdaqTraderUniverseProvider(),
  quotesPrimary: new TradierQuoteProvider(),
  quotesFallback: new AlphaVantageQuoteProvider(),
  options: new TradierOptionsProvider(),
  catalysts: new FinnhubCatalystProvider(),
};

/** Tries the primary quote provider, falls back on failure. Never fabricates. */
export async function getQuoteWithFallback(ticker, env) {
  const primary = await providers.quotesPrimary.getQuote(ticker, env);
  if (primary.ok) return primary;
  const fallback = await providers.quotesFallback.getQuote(ticker, env);
  if (fallback.ok) return fallback;
  return { ok: false, reason: `Both quote providers failed: ${primary.reason} / ${fallback.reason}`, freshness: 'unavailable' };
}
