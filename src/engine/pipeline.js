// Staged scanner pipeline. Each stage is a cheap-to-expensive filter, in
// order, so we never spend an options-chain or catalyst call on a
// candidate that fails a cheaper earlier check.
//
//  0. Universe          - broad optionable list (cached)
//  1. In-play filter    - gap% / relative volume threshold from quotes
//  2. Technical analysis- bars -> technical context
//  3. Setup detection    - all 15 detectors
//  4. Catalyst lookup    - only for tickers with a live setup (expensive)
//  5. Options selection  - strike/expiration (only for actionable setups)
//  6. Target calculation
//  7. Journal + store

import { providers, getQuoteWithFallback } from '../providers/index.js';
import { assessLiquidity } from './liquidity.js';
import { buildTechnicalContext } from './technical.js';
import { detectAllSetups, SETUP_STATE } from './setups/index.js';
import { getPrimaryCatalyst } from './catalysts.js';
import { selectOptionsForSetup } from './options.js';
import { calculateTargets } from './targets.js';
import { recordSetupSnapshot } from '../journal/journal.js';
import { isDecisionGrade } from './freshness.js';
import { getMarketStatus } from './marketHours.js';

const IN_PLAY_MIN_GAP_PCT = 2;
const IN_PLAY_MIN_REL_VOLUME = 1.5;

/**
 * Runs the full pipeline for one batch of candidate tickers (typically a
 * dequeued batch, see engine/queue.js). Returns only setups that meet the
 * "actionable" bar defined in setups — nothing else is included.
 */
export async function runPipelineForBatch(tickers, env) {
  const marketStatus = getMarketStatus();
  const isRegular = marketStatus.status === 'regular';
  const actionableSetups = [];
  const errors = [];

  for (const ticker of tickers) {
    try {
      // Stage 1: in-play filter (cheap - one quote call)
      const quote = await getQuoteWithFallback(ticker, env);
      if (!quote.ok || !isDecisionGrade('quote', quote.sourceTimestamp)) continue;
      const dailyBarsRes = await providers.quotesPrimary.getBars(ticker, 'daily', 40 * 86400000, env);
      if (!dailyBarsRes.ok || dailyBarsRes.data.length < 15) continue;

      const liquidity = assessLiquidity({
        quote: quote.data,
        dailyBars: dailyBarsRes.data,
      });

      if (!liquidity.eligible) continue;
      const gapPct = quote.data.open && dailyBarsRes.data.at(-2)?.close
        ? ((quote.data.open - dailyBarsRes.data.at(-2).close) / dailyBarsRes.data.at(-2).close) * 100
        : 0;
      const relVolProxy = quote.data.volume && dailyBarsRes.data.at(-2)?.volume
        ? quote.data.volume / dailyBarsRes.data.at(-2).volume
        : 0;
      if (Math.abs(gapPct) < IN_PLAY_MIN_GAP_PCT && relVolProxy < IN_PLAY_MIN_REL_VOLUME) continue;

      // Stage 2: technical context
      const intradayRes = await providers.quotesPrimary.getBars(ticker, '5min', 8 * 3600 * 1000, env);
      if (!intradayRes.ok || intradayRes.data.length < 12) continue;
      const ctx = buildTechnicalContext({
        dailyBars: dailyBarsRes.data,
        intradayBars: intradayRes.data,
        sessionBars: intradayRes.data,
        premarketBars: marketStatus.status === 'premarket' ? intradayRes.data : [],
      });

      // Stage 3: setup detection (all 15)
      const setups = detectAllSetups(ticker, { dailyBars: dailyBarsRes.data, intradayBars: intradayRes.data }, ctx, isRegular);
      const actionable = setups.filter((s) => s.state === SETUP_STATE.CONFIRMED || s.state === SETUP_STATE.AWAITING_CONFIRMATION);
      if (actionable.length === 0) continue;

      for (const setup of actionable) {
        // Stage 4: catalyst (only for tickers that made it this far)
        const catalyst = await getPrimaryCatalyst(ticker, env);

        // Stage 5: targets — required to be actionable; skip if structure insufficient
        const entryPrice = quote.data.price;
        const targets = calculateTargets(setup, entryPrice, ctx);
        if (!targets || targets.length !== 4) continue;

        // Stage 6: strike recommendation.
        // This does not query an option chain. The user verifies the
        // actual live contract in their broker.
        const tradeHorizon = catalyst?.type === 'earnings' ? 'earnings' : 'day';
        const optionSelection = selectOptionsForSetup(
          setup,
          entryPrice,
          tradeHorizon,
          catalyst?.timestamp,
          env,
        );
        if (!optionSelection) continue;

        const fullSetup = { ...setup, targets, optionSelection, catalyst, entryPrice };

        // Stage 7: journal (immutable snapshot) + collect for response
        if (env.JOURNAL_KV) await recordSetupSnapshot(env.JOURNAL_KV, fullSetup);
        actionableSetups.push(fullSetup);
      }
    } catch (err) {
      errors.push({ ticker, error: err.message });
    }
  }

  return { setups: actionableSetups, errors, marketStatus };
}
