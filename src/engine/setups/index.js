import { detectBreakRetest, detectBreakout, detectBreakdown } from './breakoutFamily.js';
import { detectSupportBounce, detectResistanceRejection } from './bounceRejectionFamily.js';
import { detectBullFlag, detectBearFlag, detectConsolidationBreakout, detectConsolidationBreakdown } from './flagConsolidationFamily.js';
import { detectPremarketHighBreak, detectPremarketLowBreak, detectPrevDayHighBreak, detectPrevDayLowBreak } from './levelBreakFamily.js';
import { detectDoubleBottom, detectDoubleTop } from './doubleTopBottomFamily.js';
import { SETUP_STATE } from './common.js';

export { SETUP_STATE, SETUP_TYPES } from './common.js';

const SETUP_STALE_MS = 90 * 60 * 1000; // a setup not confirmed within 90 min of detection is Expired/Stale

/**
 * Runs all 15 detectors against one ticker's data and returns only the
 * setups that fired — this file is the single place that wires "all 15,
 * each with its own logic" together. No detector is a fallback for another.
 */
export function detectAllSetups(ticker, { dailyBars, intradayBars }, ctx, isRegularSession) {
  const results = [];
  const push = (setup) => { if (setup) results.push(setup); };

  push(detectBreakRetest(ticker, intradayBars, ctx));
  push(detectBreakout(ticker, intradayBars, ctx));
  push(detectBreakdown(ticker, intradayBars, ctx));
  push(detectSupportBounce(ticker, intradayBars, ctx));
  push(detectResistanceRejection(ticker, intradayBars, ctx));
  push(detectBullFlag(ticker, intradayBars, ctx));
  push(detectBearFlag(ticker, intradayBars, ctx));
  push(detectConsolidationBreakout(ticker, intradayBars, ctx));
  push(detectConsolidationBreakdown(ticker, intradayBars, ctx));
  push(detectPremarketHighBreak(ticker, intradayBars, ctx, isRegularSession));
  push(detectPremarketLowBreak(ticker, intradayBars, ctx, isRegularSession));
  push(detectPrevDayHighBreak(ticker, intradayBars, ctx));
  push(detectPrevDayLowBreak(ticker, intradayBars, ctx));
  push(detectDoubleBottom(ticker, intradayBars, ctx));
  push(detectDoubleTop(ticker, intradayBars, ctx));

  return results.map((s) => ({ ...s, ticker, detectedAt: Date.now() }));
}

/**
 * Advances a stored setup's state against fresh data: checks invalidation,
 * checks staleness/expiration. Confirmation transitions happen by
 * re-running the relevant detector on fresh bars (callers do this), not
 * here — this function only handles the two state paths every setup shares.
 */
export function applyLifecycleRules(storedSetup, currentPrice, now = Date.now()) {
  if (storedSetup.state === SETUP_STATE.INVALIDATED || storedSetup.state === SETUP_STATE.EXPIRED) {
    return storedSetup; // terminal states
  }
  const age = now - storedSetup.detectedAt;
  if (storedSetup.state !== SETUP_STATE.CONFIRMED && age > SETUP_STALE_MS) {
    return { ...storedSetup, state: SETUP_STATE.EXPIRED };
  }
  const inval = checkInvalidation(storedSetup, currentPrice);
  if (inval) return { ...storedSetup, state: SETUP_STATE.INVALIDATED };
  return storedSetup;
}

function checkInvalidation(setup, price) {
  if (price == null) return false;
  const l = setup.levels || {};
  switch (setup.setupType) {
    case 'Break & Retest':
    case 'Breakout':
    case 'Consolidation Breakout':
    case 'Previous-Day High Break':
      return l.level != null ? price < l.level : l.rangeHigh != null ? price < l.rangeHigh : l.pdh != null ? price < l.pdh : false;
    case 'Breakdown':
    case 'Consolidation Breakdown':
    case 'Previous-Day Low Break':
      return l.level != null ? price > l.level : l.rangeLow != null ? price > l.rangeLow : l.pdl != null ? price > l.pdl : false;
    case 'Support Bounce':
      return l.support != null && price < l.support;
    case 'Resistance Rejection':
      return l.resistance != null && price > l.resistance;
    case 'Bull Flag':
      return l.flagLow != null && price < l.flagLow;
    case 'Bear Flag':
      return l.flagHigh != null && price > l.flagHigh;
    case 'Premarket High Break':
      return l.pmh != null && price < l.pmh;
    case 'Premarket Low Break':
      return l.pml != null && price > l.pml;
    case 'Double Bottom':
      return l.secondLow != null && price < l.secondLow;
    case 'Double Top':
      return l.secondHigh != null && price > l.secondHigh;
    default:
      return false;
  }
}
