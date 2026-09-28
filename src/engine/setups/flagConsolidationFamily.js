import { makeSetup, SETUP_STATE } from './common.js';

function rangePct(bars) {
  const highs = bars.map((b) => b.high), lows = bars.map((b) => b.low);
  const hi = Math.max(...highs), lo = Math.min(...lows);
  return ((hi - lo) / lo) * 100;
}

/**
 * Bull Flag: sharp pole (strong impulsive move up) -> tight, shallow,
 * lower-volume consolidation (the flag) -> breakout above the flag high.
 */
export function detectBullFlag(ticker, bars, ctx) {
  if (bars.length < 8) return null;
  const pole = bars.slice(-8, -4);
  const flag = bars.slice(-4);
  const poleMove = (pole[pole.length - 1].close - pole[0].open) / pole[0].open * 100;
  if (poleMove < 3) return null; // needs a real impulsive pole
  const flagTight = rangePct(flag) < poleMove * 0.5;
  const flagVolDown = avgVol(flag) < avgVol(pole);
  if (!flagTight || !flagVolDown) return null;
  const flagHigh = Math.max(...flag.map((b) => b.high));
  const last = bars[bars.length - 1];
  const broke = last.close > flagHigh;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Bull Flag',
    state: broke ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above flag high ${flagHigh.toFixed(2)} on expanding volume`,
    confirmation: `Close above ${flagHigh.toFixed(2)} with volume exceeding the flag's average`,
    invalidation: `Close below the flag low ${Math.min(...flag.map((b) => b.low)).toFixed(2)}`,
    levels: { flagHigh, flagLow: Math.min(...flag.map((b) => b.low)), poleStart: pole[0].open },
  });
}

/** Bear Flag: mirror of Bull Flag, downside pole + consolidation + breakdown. */
export function detectBearFlag(ticker, bars, ctx) {
  if (bars.length < 8) return null;
  const pole = bars.slice(-8, -4);
  const flag = bars.slice(-4);
  const poleMove = (pole[0].open - pole[pole.length - 1].close) / pole[0].open * 100;
  if (poleMove < 3) return null;
  const flagTight = rangePct(flag) < poleMove * 0.5;
  const flagVolDown = avgVol(flag) < avgVol(pole);
  if (!flagTight || !flagVolDown) return null;
  const flagLow = Math.min(...flag.map((b) => b.low));
  const last = bars[bars.length - 1];
  const broke = last.close < flagLow;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Bear Flag',
    state: broke ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below flag low ${flagLow.toFixed(2)} on expanding volume`,
    confirmation: `Close below ${flagLow.toFixed(2)} with volume exceeding the flag's average`,
    invalidation: `Close above the flag high ${Math.max(...flag.map((b) => b.high)).toFixed(2)}`,
    levels: { flagLow, flagHigh: Math.max(...flag.map((b) => b.high)), poleStart: pole[0].open },
  });
}

/** Consolidation Breakout: extended tight range, then break above the range high. */
export function detectConsolidationBreakout(ticker, bars, ctx) {
  if (bars.length < 10) return null;
  const range = bars.slice(-10, -1);
  if (rangePct(range) > 4) return null; // must be genuinely tight
  const rangeHigh = Math.max(...range.map((b) => b.high));
  const last = bars[bars.length - 1];
  if (last.close <= rangeHigh) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.5;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Consolidation Breakout',
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above range high ${rangeHigh.toFixed(2)} with volume expansion`,
    confirmation: `Close above ${rangeHigh.toFixed(2)} with relative volume ≥ 1.5x`,
    invalidation: `Close back inside the range (below ${rangeHigh.toFixed(2)})`,
    levels: { rangeHigh, rangeLow: Math.min(...range.map((b) => b.low)) },
  });
}

/** Consolidation Breakdown: mirror, break below the range low. */
export function detectConsolidationBreakdown(ticker, bars, ctx) {
  if (bars.length < 10) return null;
  const range = bars.slice(-10, -1);
  if (rangePct(range) > 4) return null;
  const rangeLow = Math.min(...range.map((b) => b.low));
  const last = bars[bars.length - 1];
  if (last.close >= rangeLow) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.5;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Consolidation Breakdown',
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below range low ${rangeLow.toFixed(2)} with volume expansion`,
    confirmation: `Close below ${rangeLow.toFixed(2)} with relative volume ≥ 1.5x`,
    invalidation: `Close back inside the range (above ${rangeLow.toFixed(2)})`,
    levels: { rangeLow, rangeHigh: Math.max(...range.map((b) => b.high)) },
  });
}

function avgVol(bars) {
  return bars.reduce((a, b) => a + b.volume, 0) / bars.length;
}
