// UNIVERSE PROVIDER
//
// Scanner universe:
//   - Broad NASDAQ/NYSE listed U.S. equities
//   - Russell 2000 constituents through IWM holdings
//   - IWM is always explicitly included
//
// S&P 500 stocks are already included in the broad listed universe.
// Index membership does not give a ticker any priority or ranking.
//
// Options chains are not queried here. The scanner recommends strikes
// from the underlying price and requires the user to verify the actual
// contract in their broker.

import { UniverseProvider, unavailable } from './interfaces.js';

const NASDAQ_LISTED_URL =
  'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt';

const OTHER_LISTED_URL =
  'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt';

const IWM_HOLDINGS_URL =
  'https://www.ishares.com/us/products/239710/ishares-russell-2000-etf/1467271812596.ajax?fileType=csv&fileName=IWM_holdings&dataType=fund';

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

function parseIwmHoldings(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\r?\n/);

  const out = [];

  for (const line of lines) {
    const cols = line.split(',');

    if (!cols.length) continue;

    const symbol = cols[0]
      ?.replace(/^"|"$/g, '')
      .trim()
      .toUpperCase();

    if (
      symbol &&
      symbol !== 'TICKER' &&
      /^[A-Z.]{1,6}$/.test(symbol)
    ) {
      out.push(symbol.replace('.', '-'));
    }
  }

  return out;
}

async function fetchListedUniverse() {
  try {
    const [nasdaqResponse, otherResponse] = await Promise.all([
      fetch(NASDAQ_LISTED_URL),
      fetch(OTHER_LISTED_URL),
    ]);

    if (!nasdaqResponse.ok || !otherResponse.ok) {
      return unavailable(
        `Symbol directory fetch failed (${nasdaqResponse.status}/${otherResponse.status})`,
      );
    }

    const [nasdaqText, otherText] = await Promise.all([
      nasdaqResponse.text(),
      otherResponse.text(),
    ]);

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

    return [...nasdaq, ...other];
  } catch (err) {
    return unavailable(
      `Symbol directory network error: ${err.message}`,
    );
  }
}

async function fetchIwmHoldings() {
  try {
    const response = await fetch(IWM_HOLDINGS_URL, {
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      return unavailable(
        `IWM holdings fetch failed (${response.status})`,
      );
    }

    const text = await response.text();
    const holdings = parseIwmHoldings(text);

    if (holdings.length === 0) {
      return unavailable(
        'IWM holdings parsed to zero symbols',
      );
    }

    return holdings;
  } catch (err) {
    return unavailable(
      `IWM holdings network error: ${err.message}`,
    );
  }
}

export class NasdaqTraderUniverseProvider extends UniverseProvider {
  async getUniverse(_env) {
    const [listedResult, iwmResult] = await Promise.all([
      fetchListedUniverse(),
      fetchIwmHoldings(),
    ]);

    if (!Array.isArray(listedResult)) {
      return listedResult;
    }

    if (!Array.isArray(iwmResult)) {
      return iwmResult;
    }

    const universe = Array.from(
      new Set([
        ...listedResult,
        ...iwmResult,
        'IWM',
      ]),
    ).sort();

    if (universe.length === 0) {
      return unavailable(
        'Combined universe parsed to zero symbols',
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