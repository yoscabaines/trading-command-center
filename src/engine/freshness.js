// Freshness engine. Every external datum carries sourceTimestamp (when the
// provider says the data reflects) and retrievedTimestamp (when we fetched
// it). A cache hit must NEVER bump these — staleness is measured from the
// original values, not from "last time we happened to read the cache."
//
// Decision-grade thresholds. Data older than these MUST NOT be used to
// gate setup detection, confirmation, invalidation, or target calculation.
// Options-contract freshness is tracked and thresholded SEPARATELY from
// stock/setup freshness per the product requirement (delayed option quotes
// must never drive setup logic).
export const FRESHNESS_LIMITS_MS = {
  quote: 5 * 60 * 1000,       // 5 min — quotes driving setup/confirmation logic
  bars: 10 * 60 * 1000,       // 10 min — intraday bars driving technical engine
  optionChain: 20 * 60 * 1000, // 20 min — informational only, never gates setup logic
  catalyst: 24 * 3600 * 1000, // 24 hr — catalysts are inherently slower-moving
};

export function classify(kind, sourceTimestamp, now = Date.now()) {
  if (!sourceTimestamp) return 'unavailable';
  const age = now - sourceTimestamp;
  const limit = FRESHNESS_LIMITS_MS[kind];
  if (limit == null) return 'unavailable';
  if (age <= limit * 0.5) return 'live';
  if (age <= limit) return 'delayed';
  return 'stale';
}

/** Throws-free gate: returns true only if data is fresh enough to be decision-grade. */
export function isDecisionGrade(kind, sourceTimestamp, now = Date.now()) {
  return classify(kind, sourceTimestamp, now) !== 'stale' && sourceTimestamp != null;
}

export function ageLabel(sourceTimestamp, now = Date.now()) {
  if (!sourceTimestamp) return 'unknown';
  const s = Math.round((now - sourceTimestamp) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}
