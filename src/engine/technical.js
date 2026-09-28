// Technical engine. Pure functions over OHLCV bar arrays — no fabrication:
// every function here returns null/undefined when it doesn't have enough
// real bars to compute a real value, rather than guessing.
//
// Bar shape: { time, open, high, low, close, volume }

export function vwap(bars) {
  let cumPV = 0, cumVol = 0;
  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3;
    cumPV += typical * b.volume;
    cumVol += b.volume;
  }
  return cumVol > 0 ? cumPV / cumVol : null;
}

export function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export function atr(bars, period = 14) {
  if (bars.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < bars.length; i++) {
    const cur = bars[i], prev = bars[i - 1];
    trs.push(Math.max(cur.high - cur.low, Math.abs(cur.high - prev.close), Math.abs(cur.low - prev.close)));
  }
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

export function adr(dailyBars, period = 20) {
  if (dailyBars.length < period) return null;
  const recent = dailyBars.slice(-period);
  const ranges = recent.map((b) => ((b.high - b.low) / b.close) * 100);
  return ranges.reduce((a, b) => a + b, 0) / ranges.length;
}

export function relativeVolume(bars, lookbackDays = 20) {
  if (bars.length < 2) return null;
  const today = bars[bars.length - 1];
  const priorDays = bars.slice(0, -1).slice(-lookbackDays);
  if (priorDays.length === 0) return null;
  const avgVol = priorDays.reduce((a, b) => a + b.volume, 0) / priorDays.length;
  return avgVol > 0 ? today.volume / avgVol : null;
}

export function gapPercent(currentOpen, prevClose) {
  if (!currentOpen || !prevClose) return null;
  return ((currentOpen - prevClose) / prevClose) * 100;
}

export function relativeStrength(tickerChangePct, benchmarkChangePct) {
  if (tickerChangePct == null || benchmarkChangePct == null) return null;
  return tickerChangePct - benchmarkChangePct;
}

/** Simple momentum: rate of change over N bars. */
export function momentum(closes, period = 10) {
  if (closes.length < period + 1) return null;
  const past = closes[closes.length - 1 - period];
  const now = closes[closes.length - 1];
  return past ? ((now - past) / past) * 100 : null;
}

// -- Key levels ---------------------------------------------------------

export function previousDayLevels(dailyBars) {
  if (dailyBars.length < 2) return {};
  const prev = dailyBars[dailyBars.length - 2];
  return { pdh: prev.high, pdl: prev.low, prevClose: prev.close };
}

export function weeklyLevels(dailyBars) {
  const week = dailyBars.slice(-5);
  if (week.length === 0) return {};
  return { weeklyHigh: Math.max(...week.map((b) => b.high)), weeklyLow: Math.min(...week.map((b) => b.low)) };
}

export function premarketLevels(premarketBars) {
  if (!premarketBars || premarketBars.length === 0) return {};
  return {
    pmh: Math.max(...premarketBars.map((b) => b.high)),
    pml: Math.min(...premarketBars.map((b) => b.low)),
  };
}

export function sessionLevels(sessionBars) {
  if (!sessionBars || sessionBars.length === 0) return {};
  return {
    sessionHigh: Math.max(...sessionBars.map((b) => b.high)),
    sessionLow: Math.min(...sessionBars.map((b) => b.low)),
  };
}

/** Naive local-extrema support/resistance from recent daily bars. */
export function supportResistance(dailyBars, lookback = 40, window = 3) {
  const bars = dailyBars.slice(-lookback);
  const supports = [], resistances = [];
  for (let i = window; i < bars.length - window; i++) {
    const slice = bars.slice(i - window, i + window + 1);
    const low = bars[i].low, high = bars[i].high;
    if (low === Math.min(...slice.map((b) => b.low))) supports.push(low);
    if (high === Math.max(...slice.map((b) => b.high))) resistances.push(high);
  }
  return { supports: dedupeLevels(supports), resistances: dedupeLevels(resistances) };
}

function dedupeLevels(levels, tolerancePct = 0.3) {
  const sorted = [...levels].sort((a, b) => a - b);
  const out = [];
  for (const lvl of sorted) {
    const last = out[out.length - 1];
    if (last == null || Math.abs(lvl - last) / last * 100 > tolerancePct) out.push(lvl);
  }
  return out;
}

export function allTimeHighLow(dailyBars) {
  if (!dailyBars || dailyBars.length === 0) return {};
  return { ath: Math.max(...dailyBars.map((b) => b.high)), atl: Math.min(...dailyBars.map((b) => b.low)) };
}

/** Bundles everything the setup detectors need into one context object. */
export function buildTechnicalContext({ dailyBars, intradayBars, premarketBars, sessionBars, benchmarkChangePct }) {
  const closes = dailyBars.map((b) => b.close);
  return {
    vwap: vwap(sessionBars || intradayBars || []),
    ema9: ema(closes, 9),
    ema20: ema(closes, 20),
    atr14: atr(dailyBars, 14),
    adr20: adr(dailyBars, 20),
    relVolume: relativeVolume(dailyBars, 20),
    momentum10: momentum(closes, 10),
    ...previousDayLevels(dailyBars),
    ...weeklyLevels(dailyBars),
    ...premarketLevels(premarketBars),
    ...sessionLevels(sessionBars),
    ...supportResistance(dailyBars),
    ...allTimeHighLow(dailyBars),
  };
}
