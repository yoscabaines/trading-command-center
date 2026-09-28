import { makeSetup, near, SETUP_STATE } from './common.js';

/**
 * Support Bounce: support test -> rejection (wick, not close, through level)
 * -> reclaim/confirmation on the following bar(s).
 */
export function detectSupportBounce(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const support = ctx.supports?.find((s) => near(bars[bars.length - 2].low, s, 0.6, ctx.atr14));
  if (!support) return null;
  const testBar = bars[bars.length - 2];
  const rejected = testBar.low < support && testBar.close > support; // wick below, close back above
  if (!rejected) return null;
  const nextBar = bars[bars.length - 1];
  const reclaimed = nextBar.close > testBar.close;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Support Bounce',
    state: reclaimed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Hold above ${support.toFixed(2)} with follow-through buying`,
    confirmation: `Close above the rejection bar's close (${testBar.close.toFixed(2)})`,
    invalidation: `Close below ${support.toFixed(2)}`,
    levels: { support },
  });
}

/** Resistance Rejection: mirror of Support Bounce, upside test rejected. */
export function detectResistanceRejection(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const resistance = ctx.resistances?.find((r) => near(bars[bars.length - 2].high, r, 0.6, ctx.atr14));
  if (!resistance) return null;
  const testBar = bars[bars.length - 2];
  const rejected = testBar.high > resistance && testBar.close < resistance;
  if (!rejected) return null;
  const nextBar = bars[bars.length - 1];
  const confirmed = nextBar.close < testBar.close;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Resistance Rejection',
    state: confirmed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Stay below ${resistance.toFixed(2)} with follow-through selling`,
    confirmation: `Close below the rejection bar's close (${testBar.close.toFixed(2)})`,
    invalidation: `Close above ${resistance.toFixed(2)}`,
    levels: { resistance },
  });
}
