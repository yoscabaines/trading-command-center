import { providers } from '../providers/index.js';
import { dequeueBatch, enqueueBatch, markProcessedBatch, queueStatus } from '../engine/queue.js';
import { runPipelineForBatch } from '../engine/pipeline.js';
import { getMarketStatus } from '../engine/marketHours.js';
import { listRecentJournal } from '../journal/journal.js';
import { resolveTheme, DEFAULT_TEXT } from '../config/theme.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

/** GET /api/status */
export async function handleDebugBars(env, url) {
  const ticker = url.searchParams.get('ticker')?.trim().toUpperCase() || 'AAPL';

  const result = await providers.quotesPrimary.getBars(
    ticker,
    '1min',
    12 * 3600 * 1000,
    env,
  );

  const bars = result.ok ? result.data : [];

  return json({
    ticker,
    ok: result.ok,
    reason: result.reason || null,
    count: bars.length,
    firstBar: bars[0] || null,
    latestBar: bars.at(-1) || null,
    sourceTimestamp: result.sourceTimestamp || null,
    sourceTime: result.sourceTimestamp
      ? new Date(result.sourceTimestamp).toISOString()
      : null,
    ageSeconds: result.sourceTimestamp
      ? Math.round((Date.now() - result.sourceTimestamp) / 1000)
      : null,
  });
}

export async function handleDebugQuote(env, url) {
  const ticker = url.searchParams.get('ticker')?.trim().toUpperCase() || 'AAPL';

  const result = await providers.quotesPrimary.getQuote(ticker, env);

  return json({
    ticker,
    ok: result.ok,
    reason: result.reason || null,
    price: result.data?.price ?? null,
    sourceTimestamp: result.sourceTimestamp || null,
    sourceTime: result.sourceTimestamp
      ? new Date(result.sourceTimestamp).toISOString()
      : null,
    ageSeconds: result.sourceTimestamp
      ? Math.round((Date.now() - result.sourceTimestamp) / 1000)
      : null,
    retrievedTimestamp: result.retrievedTimestamp || null,
  });
}

export async function handleStatus(env) {
  const q = env.QUEUE_KV ? await queueStatus(env.QUEUE_KV) : { depth: 0, oldestAgeMs: 0, itemsNearRetryLimit: 0 };
  return json({
    marketStatus: getMarketStatus(),
    queue: q,
    providers: {
      quotes: env.ALPACA_API_KEY && env.ALPACA_API_SECRET ? 'configured' : 'missing ALPACA credentials',
      catalysts: env.FINNHUB_API_KEY ? 'configured' : 'missing FINNHUB_API_KEY',
      
    },
    now: Date.now(),
  });
}

/**
 * GET /api/setups
 * Triggers a bounded scan pass over a batch dequeued from QUEUE_KV. If the
 * queue is empty (e.g. first run), seeds it from the universe provider.
 */
export async function handleSetups(env, url) {
  if (!env.QUEUE_KV) return json({ error: 'QUEUE_KV not bound', setups: [] }, 500);

  const requestedTicker = url.searchParams.get('ticker')?.trim().toUpperCase();

  if (requestedTicker) {
    const { setups, candidates, errors, marketStatus } = await runPipelineForBatch(
      [requestedTicker],
      env,
    );

    return json({
      setups,
      candidates,
      marketStatus,
      scannedCount: 1,
      errorCount: errors.length,
      ticker: requestedTicker,
    });
  }

  let status = await queueStatus(env.QUEUE_KV);

  if (status.depth === 0) {
    const universeRes = await providers.universe.getUniverse(env);

    if (!universeRes.ok) {
      return json(
        {
          error: `Universe unavailable: ${universeRes.reason}`,
          setups: [],
        },
        502,
      );
    }

    const universe = universeRes.data;
    const cursorKey = 'universe:cursor';
    const cursor = Number(
      await env.CACHE_KV.get(cursorKey) || '0',
    );

    const seedSize = 100;
    const seedBatch = universe.slice(
      cursor,
      cursor + seedSize,
    );

    if (seedBatch.length > 0) {
      await enqueueBatch(env.QUEUE_KV, seedBatch);

      const nextCursor =
        cursor + seedBatch.length >= universe.length
          ? 0
          : cursor + seedBatch.length;

      await env.CACHE_KV.put(
        cursorKey,
        String(nextCursor),
      );
    }
  }

  const batch = await dequeueBatch(env.QUEUE_KV, 25);
  if (batch.length === 0) {
    return json({ setups: [], candidates: [], marketStatus: getMarketStatus(), note: 'Queue empty and universe fetch returned nothing yet.' });
  }
  const { setups, candidates, errors, marketStatus, diagnostics } = await runPipelineForBatch(
    batch.map((b) => b.ticker),
    env,
  );
  await markProcessedBatch(env.QUEUE_KV, batch.map((b) => ({ ticker: b.ticker, succeeded: true }))); // processed this cycle; re-enqueue happens on next universe refresh
  return json({
    setups,
    candidates,
    marketStatus,
    scannedCount: batch.length,
    errorCount: errors.length,
    diagnostics,
  });
}

/** GET /api/journal */
export async function handleJournal(env) {
  if (!env.JOURNAL_KV) return json({ error: 'JOURNAL_KV not bound', entries: [] }, 500);
  const entries = await listRecentJournal(env.JOURNAL_KV, 50);
  return json({ entries });
}

/** GET /api/config?theme=<preset> */
export async function handleConfig(url) {
  const presetName = url.searchParams.get('theme');
  const theme = resolveTheme(presetName);
  return json({ theme, text: DEFAULT_TEXT });
}
