// Staged scanner pipeline.
//
// Premarket:
//   universe -> liquidity -> in-play -> technical context
//   -> candidate engine -> top candidates
//
// Regular session:
//   universe -> liquidity -> in-play -> technical context
//   -> 15 setup detectors -> catalyst -> targets -> options
//
// Premarket candidates are intentionally NOT treated as confirmed setups.

import { providers, getQuoteWithFallback } from '../providers/index.js';
import { assessLiquidity } from './liquidity.js';
import { buildCandidate, selectMorningCandidates } from './candidates.js';
import { buildTechnicalContext } from './technical.js';
import { buildCandidateList } from './candidates.js';
import {
  detectAllSetups,
  SETUP_STATE,
} from './setups/index.js';
import { getPrimaryCatalyst } from './catalysts.js';
import { selectOptionsForSetup } from './options.js';
import { calculateTargets } from './targets.js';
import { recordSetupSnapshot } from '../journal/journal.js';
import { isDecisionGrade } from './freshness.js';
import { getMarketStatus } from './marketHours.js';

const IN_PLAY_MIN_GAP_PCT = 2;
const IN_PLAY_MIN_REL_VOLUME = 1.5;

/**
 * Runs the scanner pipeline for one batch of tickers.
 *
 * During premarket, returns potential candidates.
 * During regular session, returns actionable setups.
 */
export async function runPipelineForBatch(tickers, env) {
  const marketStatus = getMarketStatus();

  const isPremarket = marketStatus.status === 'premarket';
  const isRegular = marketStatus.status === 'regular';

  const actionableSetups = [];
  const candidateInputs = [];
  const errors = [];

  for (const ticker of tickers) {
    try {
      // ---------------------------------------------------------------
      // Stage 1: quote + liquidity
      // ---------------------------------------------------------------

      const quote = await getQuoteWithFallback(
        ticker,
        env,
      );

      if (
        !quote.ok ||
        !isDecisionGrade(
          'quote',
          quote.sourceTimestamp,
        )
      ) {
        continue;
      }

      const dailyBarsRes =
        await providers.quotesPrimary.getBars(
          ticker,
          'daily',
          40 * 86400000,
          env,
        );

      if (
        !dailyBarsRes.ok ||
        dailyBarsRes.data.length < 15
      ) {
        continue;
      }

      const liquidity = assessLiquidity({
        quote: quote.data,
        dailyBars: dailyBarsRes.data,
      });

      if (!liquidity.eligible) {
        errors.push({
          ticker,
          error: `liquidity:${liquidity.reason}`,
        });
        continue;
      }

      // ---------------------------------------------------------------
      // Stage 2: in-play filter
      // ---------------------------------------------------------------

      const prevClose =
        dailyBarsRes.data.at(-2)?.close;

      const gapPct =
        quote.data.open && prevClose
          ? (
              (quote.data.open - prevClose) /
              prevClose
            ) * 100
          : 0;

      const relVolProxy =
        quote.data.volume &&
        dailyBarsRes.data.at(-2)?.volume
          ? quote.data.volume /
            dailyBarsRes.data.at(-2).volume
          : 0;

      if (
        isRegular &&
        Math.abs(gapPct) <
          IN_PLAY_MIN_GAP_PCT &&
        relVolProxy <
          IN_PLAY_MIN_REL_VOLUME
      ) {
        continue;
      }

      // ---------------------------------------------------------------
      // Stage 3: intraday bars
      // ---------------------------------------------------------------

      const intradayRes =
        await providers.quotesPrimary.getBars(
          ticker,
          '5min',
          8 * 3600 * 1000,
          env,
        );

      if (
        !intradayRes.ok ||
        intradayRes.data.length < 12
      ) {
        continue;
      }

      // ---------------------------------------------------------------
      // Stage 4: separate premarket bars
      // ---------------------------------------------------------------

      const premarketBars = isPremarket
        ? intradayRes.data
        : [];

      const sessionBars = isRegular
        ? intradayRes.data
        : [];

      const ctx = buildTechnicalContext({
        dailyBars: dailyBarsRes.data,
        intradayBars: intradayRes.data,
        sessionBars,
        premarketBars,
      });

      // ---------------------------------------------------------------
      // PREMARKET PATH
      // ---------------------------------------------------------------

      if (isPremarket) {
        candidateInputs.push({
          ticker,
          quote: quote.data,
          dailyBars: dailyBarsRes.data,
          premarketBars,
          technicalContext: ctx,
        });

        continue;
      }

      // ---------------------------------------------------------------
      // REGULAR SESSION PATH
      // ---------------------------------------------------------------

      if (!isRegular) continue;

      const setups = detectAllSetups(
        ticker,
        {
          dailyBars: dailyBarsRes.data,
          intradayBars: intradayRes.data,
        },
        ctx,
        isRegular,
      );

      const actionable = setups.filter(
        (s) =>
          s.state === SETUP_STATE.CONFIRMED ||
          s.state === SETUP_STATE.AWAITING_CONFIRMATION,
      );

      if (actionable.length === 0) continue;

      for (const setup of actionable) {
        // Stage 5: catalyst
        const catalyst =
          await getPrimaryCatalyst(
            ticker,
            env,
          );

        // Stage 6: targets
        const entryPrice =
          quote.data.price;

        const targets =
          calculateTargets(
            setup,
            entryPrice,
            ctx,
          );

        if (
          !targets ||
          targets.length !== 4
        ) {
          continue;
        }

        // Stage 7: options
        const tradeHorizon =
          catalyst?.type === 'earnings'
            ? 'earnings'
            : 'day';

        const optionSelection =
          selectOptionsForSetup(
            setup,
            entryPrice,
            tradeHorizon,
            catalyst?.timestamp,
            env,
          );

        if (!optionSelection) continue;

        const fullSetup = {
          ...setup,
          targets,
          optionSelection,
          catalyst,
          entryPrice,
        };

        // Stage 8: journal
        if (env.JOURNAL_KV) {
          await recordSetupSnapshot(
            env.JOURNAL_KV,
            fullSetup,
          );
        }

        actionableSetups.push(
          fullSetup,
        );
      }
    } catch (err) {
      errors.push({
        ticker,
        error: err.message,
      });
    }
  }

  // ---------------------------------------------------------------
  // Premarket candidates
  // ---------------------------------------------------------------

  let candidates = {
    topWatch: [],
    additionalWatch: [],
  };

  if (isPremarket) {
    const builtCandidates = candidateInputs
      .map((input) => {
        const catalyst = null;

        return buildCandidate(
          input.ticker,
          input.quote,
          input.dailyBars,
          input.premarketBars,
          catalyst,
        );
      })
      .filter(Boolean);

    candidates = selectMorningCandidates(
      builtCandidates,
      6,
    );
  }

  return {
    setups: actionableSetups,
    candidates,
    errors,
    marketStatus,
  };
}
