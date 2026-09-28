// Journal engine. Setup snapshots are immutable once written — later
// developments are appended as timestamped events under the same journal
// id, never overwriting the original record.

function journalId(setup) {
  return `journal:${setup.ticker}:${setup.detectedAt}`;
}

export async function recordSetupSnapshot(kv, setup) {
  const id = journalId(setup);
  const existing = await kv.get(id, 'json');
  if (existing) return existing; // immutable — never overwrite
  const snapshot = {
    id,
    ticker: setup.ticker,
    date: new Date(setup.detectedAt).toISOString().slice(0, 10),
    bias: setup.bias,
    setupType: setup.setupType,
    trigger: setup.trigger,
    confirmation: setup.confirmation,
    invalidation: setup.invalidation,
    levels: setup.levels,
    targets: setup.targets ?? null,
    optionSelection: setup.optionSelection ?? null,
    catalyst: setup.catalyst ?? null,
    createdAt: Date.now(),
    events: [],
    outcome: null,
  };
  await kv.put(id, JSON.stringify(snapshot));
  return snapshot;
}

export async function appendEvent(kv, id, event) {
  const snapshot = await kv.get(id, 'json');
  if (!snapshot) return null;
  snapshot.events.push({ ...event, timestamp: Date.now() });
  await kv.put(id, JSON.stringify(snapshot));
  return snapshot;
}

const OUTCOMES = Object.freeze({
  PLAYED_OUT: 'Setup played out',
  PARTIALLY_PLAYED_OUT: 'Setup partially played out',
  TRIGGERED_THEN_INVALIDATED: 'Setup triggered but later invalidated',
  NEVER_CONFIRMED: 'Setup never confirmed',
  INVALIDATED_BEFORE_CONFIRMATION: 'Setup invalidated before confirmation',
});
export { OUTCOMES };

/**
 * End-of-session evaluation. Requires real closing-price data — returns
 * null (does not guess an outcome) if that data is unavailable.
 * @param snapshot - a stored journal snapshot
 * @param sessionPriceSeries - real intraday prices for the session, [{time, price}]
 * @param closePrice - real session close
 */
export function evaluateAtClose(snapshot, sessionPriceSeries, closePrice) {
  if (!sessionPriceSeries?.length || closePrice == null) return null;
  const prices = sessionPriceSeries.map((p) => p.price);
  const bias = snapshot.bias;
  const wasConfirmed = snapshot.events.some((e) => e.type === 'confirmed');
  const wasInvalidated = snapshot.events.some((e) => e.type === 'invalidated');
  const triggerHit = bias === 'bullish'
    ? prices.some((p) => p >= (snapshot.levels?.level ?? snapshot.levels?.pdh ?? snapshot.levels?.support ?? -Infinity))
    : prices.some((p) => p <= (snapshot.levels?.level ?? snapshot.levels?.pdl ?? snapshot.levels?.resistance ?? Infinity));

  const tps = snapshot.targets || [];
  const tpHits = tps.map((tp) => (bias === 'bullish' ? prices.some((p) => p >= tp) : prices.some((p) => p <= tp)));
  const tpCount = tpHits.filter(Boolean).length;

  const maxFavorable = bias === 'bullish' ? Math.max(...prices) : Math.min(...prices);
  const maxAdverse = bias === 'bullish' ? Math.min(...prices) : Math.max(...prices);

  let outcome;
  if (!triggerHit && !wasConfirmed) {
    outcome = wasInvalidated ? OUTCOMES.INVALIDATED_BEFORE_CONFIRMATION : OUTCOMES.NEVER_CONFIRMED;
  } else if (wasInvalidated) {
    outcome = OUTCOMES.TRIGGERED_THEN_INVALIDATED;
  } else if (tpCount === tps.length && tps.length > 0) {
    outcome = OUTCOMES.PLAYED_OUT;
  } else if (tpCount > 0) {
    outcome = OUTCOMES.PARTIALLY_PLAYED_OUT;
  } else {
    outcome = OUTCOMES.TRIGGERED_THEN_INVALIDATED;
  }

  return {
    outcome, tp1: tpHits[0] ?? false, tp2: tpHits[1] ?? false, tp3: tpHits[2] ?? false, tp4: tpHits[3] ?? false,
    maxFavorableMove: maxFavorable, maxAdverseMove: maxAdverse, closingPrice: closePrice,
  };
}

export async function finalizeOutcome(kv, id, evaluation) {
  const snapshot = await kv.get(id, 'json');
  if (!snapshot || !evaluation) return null;
  snapshot.outcome = evaluation;
  await kv.put(id, JSON.stringify(snapshot));
  return snapshot;
}

export async function listRecentJournal(kv, limit = 50) {
  const list = await kv.list({ prefix: 'journal:' });
  const keys = list.keys.slice(-limit).reverse();
  const entries = await Promise.all(keys.map((k) => kv.get(k.name, 'json')));
  return entries.filter(Boolean);
}
