import { makeSetup, near, SETUP_STATE } from './common.js';

/**
 * Break & Retest: level breaks -> pullback -> level holds -> buyers/sellers
 * return -> confirmation. Requires the break AND a subsequent retest bar
 * where price returned to the broken level and held, in the recent bars.
 */
export function detectBreakRetest(ticker, bars, ctx) {
  if (bars.length < 6) return null;
  const level = ctx.pdh ?? ctx.resistances?.[0];
  if (!level) return null;
  const recent = bars.slice(-6);
  const breakIdx = recent.findIndex((b) => b.close > level);
  if (breakIdx === -1 || breakIdx >= recent.length - 2) return null; // need bars after the break
  const afterBreak = recent.slice(breakIdx + 1);
  const pulledBack = afterBreak.some((b) => b.low <= level * 1.001);
  const held = afterBreak[afterBreak.length - 1].close > level;
  if (!pulledBack) return null;
  const state = held ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Break & Retest', state,
    trigger: `Reclaim and hold above ${level.toFixed(2)} after retest`,
    confirmation: `Close back above ${level.toFixed(2)} following the pullback`,
    invalidation: `Close below ${(level * 0.995).toFixed(2)}`,
    levels: { level },
  });
}

/**
 * Breakout: level breaks -> acceptance (closes stay above) -> confirmation.
 * Distinct from Break & Retest: no pullback is required, just sustained
 * acceptance over consecutive bars.
 */
export function detectBreakout(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const level = ctx.resistances?.find((r) => r > (ctx.prevClose ?? 0)) ?? ctx.pdh;
  if (!level) return null;
  const last3 = bars.slice(-3);
  const allAbove = last3.every((b) => b.close > level);
  const justBroke = bars[bars.length - 4]?.close <= level;
  if (!allAbove) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.3;
  return makeSetup({
    ticker, bias: 'bullish', setupType: 'Breakout',
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Sustained acceptance above ${level.toFixed(2)}`,
    confirmation: `3 consecutive closes above ${level.toFixed(2)} with relative volume ≥ 1.3x`,
    invalidation: `Close back below ${level.toFixed(2)}`,
    levels: { level, justBroke: !!justBroke },
  });
}

/** Breakdown: mirror of Breakout, downside. */
export function detectBreakdown(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const level = ctx.supports?.find((s) => s < (ctx.prevClose ?? Infinity)) ?? ctx.pdl;
  if (!level) return null;
  const last3 = bars.slice(-3);
  const allBelow = last3.every((b) => b.close < level);
  if (!allBelow) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.3;
  return makeSetup({
    ticker, bias: 'bearish', setupType: 'Breakdown',
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Sustained acceptance below ${level.toFixed(2)}`,
    confirmation: `3 consecutive closes below ${level.toFixed(2)} with relative volume ≥ 1.3x`,
    invalidation: `Close back above ${level.toFixed(2)}`,
    levels: { level },
  });
}
