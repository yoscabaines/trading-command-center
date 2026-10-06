import indexHtml from './ui/index.html';
import { handleStatus, handleSetups, handleJournal, handleConfig, handleDebugQuote, handleDebugBars } from './api/routes.js';
import { providers } from './providers/index.js';
import { enqueue, dequeueBatch, markProcessed } from './engine/queue.js';
import { runPipelineForBatch } from './engine/pipeline.js';
import { getMarketStatus } from './engine/marketHours.js';
import { listRecentJournal, finalizeOutcome, evaluateAtClose } from './journal/journal.js';
import { getQuoteWithFallback } from './providers/index.js';
import { getMorningWatchlist } from './engine/morning.js';
import { saveMorningWatchlist } from './engine/morning.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(indexHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/api/status') return handleStatus(env);
    if (url.pathname === '/api/debug/quote') return handleDebugQuote(env, url);
    if (url.pathname === '/api/debug/bars') return handleDebugBars(env, url);

    if (url.pathname === '/api/ticker-debug') {
      const daily = await providers.quotesPrimary.getBars(
        'IWM',
        'daily',
        10 * 24 * 3600 * 1000,
        env,
      );

      const intraday = await providers.quotesPrimary.getBars(
        'IWM',
        '1min',
        24 * 3600 * 1000,
        env,
      );

      return new Response(
        JSON.stringify({
          daily: daily?.data?.slice(-5) || [],
          intraday: intraday?.data?.slice(-30) || [],
        }),
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          },
        },
      );
    }

    if (url.pathname === '/api/ticker') {
      const status = getMarketStatus();

      const symbols = new Set(['IWM']);

      if (env.SETUPS_KV) {
        const watchlist = await getMorningWatchlist(env.SETUPS_KV);

        for (const candidate of [
          ...(watchlist?.topWatch || []),
          ...(watchlist?.additionalWatch || []),
        ]) {
          if (candidate?.ticker) symbols.add(candidate.ticker);
        }
      }

      const items = [];

      for (const ticker of symbols) {
        try {
          const daily = await providers.quotesPrimary.getBars(
            ticker,
            'daily',
            10 * 24 * 3600 * 1000,
            env,
          );

          if (!daily?.ok || !Array.isArray(daily.data)) continue;

          const dailyBars = daily.data
            .filter(b => Number.isFinite(Number(b.close)))
            .sort((a, b) => new Date(a.time) - new Date(b.time));

          if (dailyBars.length < 2) continue;

          const previousBar = dailyBars[dailyBars.length - 2];
          const previousClose = Number(previousBar.close);

          if (!Number.isFinite(previousClose)) continue;

          let regularClose = Number(dailyBars[dailyBars.length - 1].close);

          if (ticker === 'IWM') {
            console.log('IWM DAILY LAST:', JSON.stringify(dailyBars.slice(-3)));

            const debugIntraday = await providers.quotesPrimary.getBars(
              ticker,
              '1min',
              24 * 3600 * 1000,
              env,
            );

            if (debugIntraday?.ok && Array.isArray(debugIntraday.data)) {
              console.log(
                'IWM 1MIN LAST 15:',
                JSON.stringify(debugIntraday.data.slice(-15)),
              );
            }
          }

          // Use today's 1-minute bars to get the actual regular-session
          // closing print instead of relying on the daily bar.
          const intraday = await providers.quotesPrimary.getBars(
            ticker,
            '1min',
            24 * 3600 * 1000,
            env,
          );

          if (intraday?.ok && Array.isArray(intraday.data)) {
            const regularBars = intraday.data
              .filter(b => Number.isFinite(Number(b.close)))
              .filter(b => {
                const d = new Date(b.time);

                const parts = new Intl.DateTimeFormat('en-US', {
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hourCycle: 'h23',
                }).formatToParts(d);

                const values = Object.fromEntries(
                  parts.map(p => [p.type, p.value]),
                );

                const hour = Number(values.hour);
                const minute = Number(values.minute);

                return hour >= 9 && (
                  hour > 9 ||
                  minute >= 30
                ) && (
                  hour < 16
                );
              })
              .sort((a, b) => new Date(a.time) - new Date(b.time));

            if (regularBars.length > 0) {
              regularClose = Number(
                regularBars[regularBars.length - 1].close,
              );
            }
          }

          if (!Number.isFinite(regularClose)) continue;

          let price = regularClose;

          // During regular trading hours, show the live quote.
          if (status.status === 'regular') {
            const quote = await getQuoteWithFallback(ticker, env);

            if (quote?.ok && quote.data) {
              const livePrice = Number(quote.data.price);

              if (Number.isFinite(livePrice)) {
                price = livePrice;
              }
            }
          }

          const change = regularClose - previousClose;

          const changePct =
            previousClose !== 0
              ? (change / previousClose) * 100
              : null;

          const displayChange =
            status.status === 'regular'
              ? price - previousClose
              : change;

          const displayChangePct =
            previousClose !== 0
              ? (displayChange / previousClose) * 100
              : null;

          items.push({
            ticker,
            price,
            change: displayChange,
            changePct: displayChangePct,
            regularClose,
            previousClose,
          });
        } catch (error) {
          console.error(`Ticker failed for ${ticker}:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          marketStatus: status,
          items,
          updatedAt: new Date().toISOString(),
        }),
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          },
        },
      );
    }

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
      const seedKey = `morning-seeded-${status.dateStr}`;
      const alreadySeeded = env.CACHE_KV
        ? await env.CACHE_KV.get(seedKey)
        : null;

      if (!alreadySeeded) {
        const universeRes = await providers.universe.getUniverse(env);

        if (universeRes.ok && env.QUEUE_KV) {
          for (const ticker of universeRes.data) {
            await enqueue(env.QUEUE_KV, ticker);
          }

          if (env.CACHE_KV) {
            await env.CACHE_KV.put(seedKey, '1', {
              expirationTtl: 86400,
            });
          }
        }
      }

      if (env.QUEUE_KV) {
        const batch = await dequeueBatch(env.QUEUE_KV, 25);

        if (batch.length > 0) {
          const result = await runPipelineForBatch(
            batch.map((b) => b.ticker),
            env,
          );

          if (env.SETUPS_KV && result.candidates) {
            await saveMorningWatchlist(
              env.SETUPS_KV,
              result.candidates,
            );
          }

          for (const b of batch) {
            await markProcessed(env.QUEUE_KV, b.ticker, true);
          }
        }
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
