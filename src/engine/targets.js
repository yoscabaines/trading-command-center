// Target engine. Every TP is derived from real underlying structure —
// nearby levels, ATR/ADR-scaled extensions, or setup geometry. If there
// isn't enough real structure to build 4 distinct targets, this returns
// null rather than padding with fabricated round numbers.

function uniqueAscending(levels, bias) {
  const sorted = [...new Set(levels.filter((l) => l != null))].sort((a, b) => a - b);
  return bias === 'bullish' ? sorted : sorted.slice().reverse();
}

/**
 * @param setup - a detected Setup (see setups/common.js)
 * @param entryPrice - the actionable trigger price
 * @param ctx - technical context (buildTechnicalContext output)
 */
export function calculateTargets(setup, entryPrice, ctx) {
  const bias = setup.bias;
  const atr = ctx.atr14;
  if (!entryPrice) return null;

  // Candidate structural levels beyond entry, in the trade direction.
  const structuralCandidates = bias === 'bullish'
    ? [ctx.pdh, ctx.pmh, ctx.weeklyHigh, ctx.ath, ...(ctx.resistances || [])]
    : [ctx.pdl, ctx.pml, ctx.weeklyLow, ctx.atl, ...(ctx.supports || [])];

  const inDirection = structuralCandidates.filter((l) =>
    l != null && (bias === 'bullish' ? l > entryPrice : l < entryPrice)
  );
  let ordered = uniqueAscending(inDirection, bias);

  // Fill remaining slots with ATR-scaled extensions off entry, geometrically
  // spaced (1x, 1.8x, 2.6x, 3.4x ATR) so they still reflect the stock's own
  // realized volatility rather than an arbitrary percentage.
  const atrMultiples = [1, 1.8, 2.6, 3.4];
  const atrTargets = atr
    ? atrMultiples.map((m) => (bias === 'bullish' ? entryPrice + atr * m : entryPrice - atr * m))
    : [];

  const merged = [];
  let si = 0, ai = 0;
  while (merged.length < 4 && (si < ordered.length || ai < atrTargets.length)) {
    if (si < ordered.length) { merged.push(ordered[si]); si++; }
    if (merged.length < 4 && ai < atrTargets.length) {
      // only add an ATR target if it doesn't collapse onto an existing one
      const candidate = atrTargets[ai];
      const tooClose = merged.some((m) => Math.abs(m - candidate) / candidate < 0.003);
      if (!tooClose) merged.push(candidate);
      ai++;
    }
  }

  if (merged.length < 4) return null; // not enough real structure — do not fabricate

  const final = uniqueAscending(merged, bias).slice(0, 4);
  return final.map((t) => Number(t.toFixed(2)));
}
