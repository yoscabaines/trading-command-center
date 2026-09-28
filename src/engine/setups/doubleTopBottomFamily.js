import { makeSetup, SETUP_STATE } from './common.js';

/**
 * Double Bottom: first low -> bounce -> second low (holds near first low) ->
 * neckline reclaim -> confirmation.
 */
export function detectDoubleBottom(ticker, bars, ctx) {
  if (bars.length < 12) return null;
  const window = bars.slice(-12);
  const lows = window.map((b) => b.low);
  const firstLowIdx = lows.indexOf(Math.min(...lows.slice(0, 6)));
  const firstLow = lows[firstLowIdx];
  const bounceIdx = window.slice(firstLowIdx).findIndex((b, i) => i > 0 && b.close > window[firstLowIdx].close * 1.01);
  if (bounceIdx === -1) return null;
  const necklineIdx = firstLowIdx + bounceIdx;
  const neckline = Math.max(...window.slice(firstLowIdx, necklineIdx + 1).map((b) => b.high));
  const secondLegBars = window.slice(necklineIdx);
  if (secondLegBars.length < 2) return null;
  const secondLow = Math.min(...secondLegBars.map((b) => b.low));
  const secondLowHolds = Math.abs(secondLow - firstLow) / firstLow < 0.01 && secondLow >= firstLow * 0.99;
  if (!secondLowHolds) return null;
  const last = window[window.length - 1];
  const reclaimed = last.close > neckline;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Double Bottom',
    state: reclaimed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Reclaim neckline ${neckline.toFixed(2)} after second low holds ${secondLow.toFixed(2)}`,
    confirmation: `Close above neckline ${neckline.toFixed(2)}`,
    invalidation: `Close below the second low ${secondLow.toFixed(2)}`,
    levels: { firstLow, secondLow, neckline },
  });
}

/** Double Top: mirror of Double Bottom, upside pattern. */
export function detectDoubleTop(ticker, bars, ctx) {
  if (bars.length < 12) return null;
  const window = bars.slice(-12);
  const highs = window.map((b) => b.high);
  const firstHighIdx = highs.indexOf(Math.max(...highs.slice(0, 6)));
  const firstHigh = highs[firstHighIdx];
  const pullbackIdx = window.slice(firstHighIdx).findIndex((b, i) => i > 0 && b.close < window[firstHighIdx].close * 0.99);
  if (pullbackIdx === -1) return null;
  const necklineIdx = firstHighIdx + pullbackIdx;
  const neckline = Math.min(...window.slice(firstHighIdx, necklineIdx + 1).map((b) => b.low));
  const secondLegBars = window.slice(necklineIdx);
  if (secondLegBars.length < 2) return null;
  const secondHigh = Math.max(...secondLegBars.map((b) => b.high));
  const secondHighRejects = Math.abs(secondHigh - firstHigh) / firstHigh < 0.01 && secondHigh <= firstHigh * 1.01;
  if (!secondHighRejects) return null;
  const last = window[window.length - 1];
  const brokeDown = last.close < neckline;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Double Top',
    state: brokeDown ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break neckline ${neckline.toFixed(2)} after second high rejects ${secondHigh.toFixed(2)}`,
    confirmation: `Close below neckline ${neckline.toFixed(2)}`,
    invalidation: `Close above the second high ${secondHigh.toFixed(2)}`,
    levels: { firstHigh, secondHigh, neckline },
  });
}
