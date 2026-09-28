import { makeSetup, SETUP_STATE, clampPremarketState } from './common.js';

/**
 * Premarket High Break: premarket action alone may only produce a
 * Potential/Awaiting-confirmation setup — regular-session confirmation is
 * required to move to Confirmed. `isRegularSession` gates that promotion.
 */
export function detectPremarketHighBreak(ticker, bars, ctx, isRegularSession) {
  if (!ctx.pmh) return null;
  const last = bars[bars.length - 1];
  if (last.close <= ctx.pmh) return null;
  let setup = makeSetup({
    ticker, bias: 'bullish', setupType: 'Premarket High Break',
    state: SETUP_STATE.CONFIRMED,
    trigger: `Break and hold above premarket high ${ctx.pmh.toFixed(2)}`,
    confirmation: `Regular-session close above ${ctx.pmh.toFixed(2)} with volume confirmation`,
    invalidation: `Regular-session close back below ${ctx.pmh.toFixed(2)}`,
    levels: { pmh: ctx.pmh },
  });
  return clampPremarketState(setup, !isRegularSession);
}

export function detectPremarketLowBreak(ticker, bars, ctx, isRegularSession) {
  if (!ctx.pml) return null;
  const last = bars[bars.length - 1];
  if (last.close >= ctx.pml) return null;
  let setup = makeSetup({
    ticker, bias: 'bearish', setupType: 'Premarket Low Break',
    state: SETUP_STATE.CONFIRMED,
    trigger: `Break and hold below premarket low ${ctx.pml.toFixed(2)}`,
    confirmation: `Regular-session close below ${ctx.pml.toFixed(2)} with volume confirmation`,
    invalidation: `Regular-session close back above ${ctx.pml.toFixed(2)}`,
    levels: { pml: ctx.pml },
  });
  return clampPremarketState(setup, !isRegularSession);
}

/** Previous-Day High Break: regular-session break of the prior day's high. */
export function detectPrevDayHighBreak(ticker, bars, ctx) {
  if (!ctx.pdh) return null;
  const last = bars[bars.length - 1];
  const prior = bars[bars.length - 2];
  if (!(last.close > ctx.pdh && prior.close <= ctx.pdh)) return null;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Previous-Day High Break',
    state: (ctx.relVolume ?? 0) >= 1.2 ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above PDH ${ctx.pdh.toFixed(2)}`,
    confirmation: `Close above ${ctx.pdh.toFixed(2)} with relative volume ≥ 1.2x`,
    invalidation: `Close back below ${ctx.pdh.toFixed(2)}`,
    levels: { pdh: ctx.pdh },
  });
}

export function detectPrevDayLowBreak(ticker, bars, ctx) {
  if (!ctx.pdl) return null;
  const last = bars[bars.length - 1];
  const prior = bars[bars.length - 2];
  if (!(last.close < ctx.pdl && prior.close >= ctx.pdl)) return null;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Previous-Day Low Break',
    state: (ctx.relVolume ?? 0) >= 1.2 ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below PDL ${ctx.pdl.toFixed(2)}`,
    confirmation: `Close below ${ctx.pdl.toFixed(2)} with relative volume ≥ 1.2x`,
    invalidation: `Close back above ${ctx.pdl.toFixed(2)}`,
    levels: { pdl: ctx.pdl },
  });
}
