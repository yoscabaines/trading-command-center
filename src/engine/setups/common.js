// Shared types/helpers for all setup detectors. Every detector receives the
// same `ctx` shape and returns either null (no setup found) or a Setup
// object in this shape. Bias is never inferred from "stock is green/red" —
// each detector derives bias from its own structural logic.

export const SETUP_STATE = Object.freeze({
  POTENTIAL: 'Potential',
  AWAITING_CONFIRMATION: 'Awaiting confirmation',
  CONFIRMED: 'Confirmed',
  INVALIDATED: 'Invalidated',
  EXPIRED: 'Expired/Stale',
});

export const SETUP_TYPES = Object.freeze([
  'Break & Retest', 'Support Bounce', 'Resistance Rejection', 'Breakout', 'Breakdown',
  'Bull Flag', 'Bear Flag', 'Consolidation Breakout', 'Consolidation Breakdown',
  'Premarket High Break', 'Premarket Low Break', 'Previous-Day High Break', 'Previous-Day Low Break',
  'Double Bottom', 'Double Top',
]);

/**
 * @typedef {Object} Setup
 * @property {string} ticker
 * @property {'bullish'|'bearish'} bias
 * @property {string} setupType
 * @property {string} state
 * @property {string} trigger           - human-readable actionable trigger
 * @property {string} confirmation      - what must happen to confirm
 * @property {string} invalidation      - what invalidates the setup
 * @property {Object} levels            - relevant levels only (setup-specific)
 * @property {boolean} isPremarketOnly  - true if built from premarket data only (never auto-confirmed)
 */

export function makeSetup(partial) {
  return {
    state: SETUP_STATE.POTENTIAL,
    isPremarketOnly: false,
    ...partial,
  };
}

/** Premarket action can only ever produce Potential/Awaiting confirmation, never Confirmed. */
export function clampPremarketState(setup, isPremarketSession) {
  if (isPremarketSession && setup.state === SETUP_STATE.CONFIRMED) {
    return { ...setup, state: SETUP_STATE.AWAITING_CONFIRMATION, isPremarketOnly: true };
  }
  return setup;
}

/** Within-tolerance level test, e.g. "price is at/near this level". */
export function near(price, level, toleranceAtrFraction, atr14) {
  if (level == null || price == null) return false;
  const tolerance = atr14 ? atr14 * toleranceAtrFraction : level * 0.0015;
  return Math.abs(price - level) <= tolerance;
}

export function pctFrom(price, level) {
  if (!level) return null;
  return ((price - level) / level) * 100;
}
