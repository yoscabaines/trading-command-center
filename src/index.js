import indexHtml from './ui/index.html';
import { handleStatus, handleSetups, handleJournal, handleConfig } from './api/routes.js';
import { providers } from './providers/index.js';
import { enqueue, dequeueBatch, markProcessed } from './engine/queue.js';
import { runPipelineForBatch } from './engine/pipeline.js';
import { getMarketStatus } from './engine/marketHours.js';
import { listRecentJournal, finalizeOutcome, evaluateAtClose } from './journal/journal.js';
import { getQuoteWithFallback } from './providers/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(indexHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/api/status') return handleStatus(env);
    if (url.pathname === '/api/setups') return handleSetups(env, url);
    if (url.pathname === '/api/journal') return handleJournal(env);
    if (url.pathname === '/api/config') return handleConfig(url);

    return new Response('Not found', { status: 404 });
  },

  /**
   * Scheduled handler. Cron firing alone never implies the market is open —
   * every branch checks getMarketStatus() before doing real work.
   * The three configured cron times (see wrangler.toml) map to:
   *   - premarket universe refresh + queue seed
   *   - mid-session scan pass
   *   - end-of-session journal evaluation
   */
  async scheduled(event, env, ctx) {
    const status = getMarketStatus();

    if (status.status === 'premarket') {
      const universeRes = await providers.universe.getUniverse(env);
      if (universeRes.ok && env.QUEUE_KV) {
        const optionable = universeRes.data;
        for (const ticker of optionable) await enqueue(env.QUEUE_KV, ticker);
      }
      return;
    }

    if (status.status === 'regular' && env.QUEUE_KV) {
      const batch = await dequeueBatch(env.QUEUE_KV, 25);
      if (batch.length > 0) {
        await runPipelineForBatch(batch.map((b) => b.ticker), env);
        for (const b of batch) await markProcessed(env.QUEUE_KV, b.ticker, true);
      }
      return;
    }

    if ((status.status === 'after-hours' || status.status === 'closed') && env.JOURNAL_KV) {
      // End-of-session evaluation: only run once per day, and only with a
      // real closing price per ticker — never fabricate a close.
      const entries = await listRecentJournal(env.JOURNAL_KV, 200);
      const today = new Date().toISOString().slice(0, 10);
      for (const snapshot of entries) {
        if (snapshot.date !== today || snapshot.outcome) continue;
        const quote = await getQuoteWithFallback(snapshot.ticker, env);
        if (!quote.ok) continue;
        const bars = await providers.quotesPrimary.getBars(snapshot.ticker, '5min', 8 * 3600 * 1000, env);
        if (!bars.ok) continue;
        const series = bars.data.map((b) => ({ time: b.time, price: b.close }));
        const evaluation = evaluateAtClose(snapshot, series, quote.data.price);
        if (evaluation) await finalizeOutcome(env.JOURNAL_KV, snapshot.id, evaluation);
      }
    }
  },
};
