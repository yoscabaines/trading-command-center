// UNIVERSE PROVIDER
//
// Uses Nasdaq Trader's public symbol directories to build the stock/ETF
// universe. The scanner does not query option chains.
//
// Important: Nasdaq Trader's directories are a listed-equity universe,
// not a guaranteed optionable-only universe. The scanner therefore treats
// this as the broad candidate universe and recommends strikes without
// pretending to verify live option availability.

import { UniverseProvider, unavailable } from './interfaces.js';

const NASDAQ_LISTED_URL =
  'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt';

const OTHER_LISTED_URL =
  'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt';

function parsePipeDelimited(text, symbolCol, testIssueCol) {
  const lines = text.trim().split('\n');
  const out = [];

  for (let i = 1; i < lines.length - 1; i++) {
    const cols = lines[i].split('|');
    const symbol = cols[symbolCol];
    const isTest = cols[testIssueCol] === 'Y';

    if (
      symbol &&
      !isTest &&
      /^[A-Z.]{1,6}$/.test(symbol)
    ) {
      out.push(symbol.replace('.', '-'));
    }
  }

  return out;
}

export class NasdaqTraderUniverseProvider extends UniverseProvider {
  async getUniverse(_env) {
    let nasdaqText;
    let otherText;

    try {
      const [a, b] = await Promise.all([
        fetch(NASDAQ_LISTED_URL),
        fetch(OTHER_LISTED_URL),
      ]);

      if (!a.ok || !b.ok) {
        return unavailable(
          `Symbol directory fetch failed (${a.status}/${b.status})`,
        );
      }

      [nasdaqText, otherText] = await Promise.all([
        a.text(),
        b.text(),
      ]);
    } catch (err) {
      return unavailable(
        `Symbol directory network error: ${err.message}`,
      );
    }

    const nasdaq = parsePipeDelimited(
      nasdaqText,
      0,
      3,
    );

    const other = parsePipeDelimited(
      otherText,
      0,
      6,
    );

    const universe = Array.from(
      new Set([...nasdaq, ...other]),
    ).sort();

    if (universe.length === 0) {
      return unavailable(
        'Symbol directories parsed to zero symbols',
      );
    }

    return {
      ok: true,
      data: universe,
      sourceTimestamp: Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: 'delayed',
    };
  }
}
