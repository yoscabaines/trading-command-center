import { providers } from '../providers/index.js';

// Internal liquidity thresholds. These gate contract selection but are
// NEVER surfaced in the API/UI response — only the chosen strike/expiration
// are exposed, per the product requirement.
const LIQUIDITY_RULES = {
  maxSpreadPct: 15,      // (ask-bid)/mid must be below this ...
  maxSpreadAbsolute: 0.02, // ... OR the absolute spread is this small (cheap-contract exception:
                            // a $0.01 spread on a $0.05 contract is 20%+ but is a perfectly normal,
                            // tradable market for a sub-$0.10 OTM contract)
  minVolume: 50,
  minOpenInterest: 100,
  minDelta: 0.15,
  maxDelta: 0.65,
};

function passesLiquidity(contract) {
  if (!contract.bid || !contract.ask || contract.bid <= 0) return false;
  const mid = (contract.bid + contract.ask) / 2;
  const spread = contract.ask - contract.bid;
  const spreadPct = (spread / mid) * 100;
  if (spreadPct > LIQUIDITY_RULES.maxSpreadPct && spread > LIQUIDITY_RULES.maxSpreadAbsolute) return false;
  if ((contract.volume ?? 0) < LIQUIDITY_RULES.minVolume && (contract.openInterest ?? 0) < LIQUIDITY_RULES.minOpenInterest) return false;
  if (contract.delta != null) {
    const absDelta = Math.abs(contract.delta);
    if (absDelta < LIQUIDITY_RULES.minDelta || absDelta > LIQUIDITY_RULES.maxDelta) return false;
  }
  return true;
}

/**
 * Chooses an expiration appropriate to trade horizon.
 * tradeHorizon: 'day' | 'swing' | 'earnings'
 */
export function chooseExpiration(expirations, tradeHorizon, catalystDate) {
  if (!expirations?.length) return null;
  const sorted = [...expirations].sort();
  const now = new Date();
  if (tradeHorizon === 'day') {
    // nearest expiration that is not today-after-close (avoid 0DTE assignment/gamma risk edge cases
    // only if a farther one exists within 3 sessions)
    return sorted[0];
  }
  if (tradeHorizon === 'earnings' && catalystDate) {
    // first expiration on/after the catalyst date, so the position covers the event
    const target = new Date(catalystDate);
    return sorted.find((d) => new Date(d) >= target) ?? sorted[sorted.length - 1];
  }
  // swing: prefer an expiration roughly 2-4 weeks out
  const target = new Date(now.getTime() + 21 * 86400000);
  let best = sorted[0], bestDiff = Infinity;
  for (const d of sorted) {
    const diff = Math.abs(new Date(d) - target);
    if (diff < bestDiff) { best = d; bestDiff = diff; }
  }
  return best;
}

/**
 * Selects preferred + second-best strikes for a directional bias.
 * The second-best strike must independently pass liquidity filters — it is
 * never chosen merely for being cheaper than the preferred strike.
 */
export function selectStrikes(chain, bias, underlyingPrice) {
  const type = bias === 'bullish' ? 'call' : 'put';
  const candidates = chain
    .filter((c) => c.type === type)
    .filter(passesLiquidity)
    .sort((a, b) => Math.abs(a.strike - underlyingPrice) - Math.abs(b.strike - underlyingPrice));

  if (candidates.length === 0) return { preferred: null, secondBest: null };

  // Preferred: slightly OTM (matches the account's typical cheap-OTM style)
  // in the direction of the trade, first candidate that clears liquidity.
  const otmCandidates = candidates.filter((c) =>
    bias === 'bullish' ? c.strike >= underlyingPrice : c.strike <= underlyingPrice
  );
  const preferred = otmCandidates[0] ?? candidates[0];
  const secondBest = (otmCandidates.find((c) => c.symbol !== preferred?.symbol)) ?? candidates.find((c) => c.symbol !== preferred?.symbol) ?? null;

  return { preferred, secondBest };
}

/**
 * Full options-selection flow for one setup. Returns null (not a fabricated
 * placeholder) if chain/expiration data is unavailable.
 */
export async function selectOptionsForSetup(setup, underlyingPrice, tradeHorizon, catalystDate, env) {
  const expRes = await providers.options.getExpirations(setup.ticker, env);
  if (!expRes.ok) return null;
  const expiration = chooseExpiration(expRes.data, tradeHorizon, catalystDate);
  if (!expiration) return null;
  const chainRes = await providers.options.getChain(setup.ticker, expiration, env);
  if (!chainRes.ok) return null;
  const { preferred, secondBest } = selectStrikes(chainRes.data, setup.bias, underlyingPrice);
  if (!preferred) return null;
  return {
    expiration,
    preferredStrike: preferred.strike,
    secondBestStrike: secondBest?.strike ?? null,
    contractType: setup.bias === 'bullish' ? 'call' : 'put',
    chainFreshness: chainRes.freshness, // tracked separately from setup/stock freshness
  };
}
