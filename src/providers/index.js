// Central provider wiring.
// Market data comes from Alpaca.
// Catalysts come from Finnhub.
// Options chains are intentionally not required.

import { AlpacaQuoteProvider } from './alpaca.js';
import { FinnhubCatalystProvider } from './finnhub.js';
import { NasdaqTraderUniverseProvider } from './universe.js';

export const providers = {
  universe: new NasdaqTraderUniverseProvider(),
  quotesPrimary: new AlpacaQuoteProvider(),
  catalysts: new FinnhubCatalystProvider(),
};

/** Gets an underlying quote. Never fabricates data. */
export async function getQuoteWithFallback(ticker, env) {
  return providers.quotesPrimary.getQuote(ticker, env);
}
