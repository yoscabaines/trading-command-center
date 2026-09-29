// Options recommendation engine.
//
// This module does NOT query an option chain.
// It recommends a strike based on the underlying stock/ETF price.
// The user verifies the actual live contract in their broker.

function strikeIncrement(price) {
  if (price < 25) return 0.5;
  if (price < 500) return 1;
  return 5;
}

function roundUp(value, increment) {
  return Math.ceil(value / increment) * increment;
}

function roundDown(value, increment) {
  return Math.floor(value / increment) * increment;
}

export function recommendStrikes(bias, underlyingPrice) {
  if (!underlyingPrice || underlyingPrice <= 0) {
    return { preferredStrike: null, secondBestStrike: null };
  }

  const increment = strikeIncrement(underlyingPrice);

  if (bias === 'bullish') {
    return {
      preferredStrike: roundUp(underlyingPrice, increment),
      secondBestStrike: roundUp(
        underlyingPrice + increment,
        increment,
      ),
    };
  }

  return {
    preferredStrike: roundDown(underlyingPrice, increment),
    secondBestStrike: roundDown(
      underlyingPrice - increment,
      increment,
    ),
  };
}

// Kept for compatibility with the existing test suite.
// The scanner itself no longer uses an options chain.
export function selectStrikes(chain, bias, underlyingPrice) {
  const strikes = recommendStrikes(bias, underlyingPrice);

  return {
    preferred: strikes.preferredStrike
      ? { strike: strikes.preferredStrike }
      : null,
    secondBest: strikes.secondBestStrike
      ? { strike: strikes.secondBestStrike }
      : null,
  };
}

// Kept for compatibility with the existing engine tests.
// This now produces a suggested expiration without querying a broker.
export function chooseExpiration(expirations, tradeHorizon, catalystDate) {
  if (Array.isArray(expirations) && expirations.length > 0) {
    const sorted = [...expirations].sort();

    if (tradeHorizon === 'earnings' && catalystDate) {
      const target = new Date(catalystDate);
      return (
        sorted.find((d) => new Date(d) >= target) ??
        sorted[sorted.length - 1]
      );
    }

    if (tradeHorizon === 'swing') {
      const target = new Date(
        Date.now() + 21 * 86400000,
      );

      return sorted.reduce((best, current) => {
        const currentDiff = Math.abs(
          new Date(current) - target,
        );
        const bestDiff = Math.abs(
          new Date(best) - target,
        );

        return currentDiff < bestDiff ? current : best;
      });
    }

    return sorted[0];
  }

  return nextExpiration(
    tradeHorizon === 'earnings' ? 14 :
    tradeHorizon === 'swing' ? 21 : 7,
  );
}

function nextExpiration(daysOut = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysOut);

  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
}

export function selectOptionsForSetup(
  setup,
  underlyingPrice,
  tradeHorizon,
  catalystDate,
  _env,
) {
  const strikes = recommendStrikes(
    setup.bias,
    underlyingPrice,
  );

  if (!strikes.preferredStrike) return null;

  const expiration = chooseExpiration(
    [],
    tradeHorizon,
    catalystDate,
  );

  return {
    expiration,
    preferredStrike: strikes.preferredStrike,
    secondBestStrike: strikes.secondBestStrike,
    contractType: setup.bias === 'bullish' ? 'call' : 'put',
    chainFreshness: 'not_used',
    contractVerificationRequired: true,
  };
}
