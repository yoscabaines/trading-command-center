const MIN_PRICE = 3;
const MIN_AVG_VOLUME = 1_000_000;
const MIN_AVG_DOLLAR_VOLUME = 25_000_000;
const LOOKBACK_DAYS = 20;

export function assessLiquidity({ quote, dailyBars }) {
  if (!quote || !Array.isArray(dailyBars) || dailyBars.length < 10) {
    return {
      eligible: false,
      reason: 'insufficient-liquidity-data',
    };
  }

  const price = Number(quote.price ?? quote.last ?? quote.close ?? 0);

  if (!Number.isFinite(price) || price < MIN_PRICE) {
    return {
      eligible: false,
      reason: 'price-below-minimum',
    };
  }

  const bars = dailyBars
    .slice(-LOOKBACK_DAYS)
    .filter(
      (bar) =>
        Number.isFinite(Number(bar.volume)) &&
        Number.isFinite(Number(bar.close)),
    );

  if (bars.length < 10) {
    return {
      eligible: false,
      reason: 'insufficient-daily-bars',
    };
  }

  const avgVolume =
    bars.reduce((sum, bar) => sum + Number(bar.volume), 0) /
    bars.length;

  const avgDollarVolume =
    bars.reduce(
      (sum, bar) =>
        sum + Number(bar.volume) * Number(bar.close),
      0,
    ) / bars.length;

  if (avgVolume < MIN_AVG_VOLUME) {
    return {
      eligible: false,
      reason: 'average-volume-too-low',
      avgVolume,
      avgDollarVolume,
    };
  }

  if (avgDollarVolume < MIN_AVG_DOLLAR_VOLUME) {
    return {
      eligible: false,
      reason: 'average-dollar-volume-too-low',
      avgVolume,
      avgDollarVolume,
    };
  }

  return {
    eligible: true,
    price,
    avgVolume,
    avgDollarVolume,
    lookbackDays: bars.length,
  };
}

const MIN_PRICE = 3;
const MIN_AVG_VOLUME = 1_000_000;
const MIN_AVG_DOLLAR_VOLUME = 25_000_000;
const LOOKBACK_DAYS = 20;

export function assessLiquidity({ quote, dailyBars }) {
  if (!quote || !Array.isArray(dailyBars) || dailyBars.length < 10) {
    return {
      eligible: false,
      reason: 'insufficient-liquidity-data',
    };
  }

  const price = Number(quote.price ?? quote.last ?? quote.close ?? 0);

  if (!Number.isFinite(price) || price < MIN_PRICE) {
    return {
      eligible: false,
      reason: 'price-below-minimum',
    };
  }

  const bars = dailyBars
    .slice(-LOOKBACK_DAYS)
    .filter(
      (bar) =>
        Number.isFinite(Number(bar.volume)) &&
        Number.isFinite(Number(bar.close)),
    );

  if (bars.length < 10) {
    return {
      eligible: false,
      reason: 'insufficient-daily-bars',
    };
  }

  const avgVolume =
    bars.reduce((sum, bar) => sum + Number(bar.volume), 0) /
    bars.length;

  const avgDollarVolume =
    bars.reduce(
      (sum, bar) =>
        sum + Number(bar.volume) * Number(bar.close),
      0,
    ) / bars.length;

  if (avgVolume < MIN_AVG_VOLUME) {
    return {
      eligible: false,
      reason: 'average-volume-too-low',
      avgVolume,
      avgDollarVolume,
    };
  }

  if (avgDollarVolume < MIN_AVG_DOLLAR_VOLUME) {
    return {
      eligible: false,
      reason: 'average-dollar-volume-too-low',
      avgVolume,
      avgDollarVolume,
    };
  }

  return {
    eligible: true,
    price,
    avgVolume,
    avgDollarVolume,
    lookbackDays: bars.length,
  };
}
