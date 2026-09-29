const QUEUE_INDEX_KEY = 'queue:index';
const MAX_QUEUE_SIZE = 500;
const MAX_AGE_MS = 4 * 3600 * 1000;
const MAX_RETRIES = 6;

async function readIndex(kv) {
  return (await kv.get(QUEUE_INDEX_KEY, 'json')) || [];
}

async function writeIndex(kv, index) {
  await kv.put(QUEUE_INDEX_KEY, JSON.stringify(index));
}

function evict(index) {
  const now = Date.now();

  let out = index.filter(
    (e) =>
      now - e.enqueuedAt < MAX_AGE_MS &&
      e.retries < MAX_RETRIES,
  );

  if (out.length > MAX_QUEUE_SIZE) {
    out = out
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          a.enqueuedAt - b.enqueuedAt,
      )
      .slice(0, MAX_QUEUE_SIZE);
  }

  return out;
}

export async function enqueue(kv, ticker, priority = 0) {
  return enqueueBatch(kv, [ticker], priority);
}

export async function enqueueBatch(kv, tickers, priority = 0) {
  if (!Array.isArray(tickers) || tickers.length === 0) return 0;

  const index = await readIndex(kv);
  const existing = new Set(index.map((e) => e.ticker));
  const now = Date.now();
  let added = 0;

  for (const ticker of tickers) {
    if (!ticker || existing.has(ticker)) continue;

    index.push({
      ticker,
      priority,
      enqueuedAt: now,
      retries: 0,
      lastAttempt: null,
    });

    existing.add(ticker);
    added++;
  }

  index.sort(
    (a, b) =>
      b.priority - a.priority ||
      a.enqueuedAt - b.enqueuedAt,
  );

  await writeIndex(kv, evict(index));

  return added;
}

export async function dequeueBatch(kv, batchSize = 25) {
  const index = await readIndex(kv);
  return index.slice(0, batchSize);
}

export async function markProcessed(kv, ticker, succeeded) {
  return markProcessedBatch(kv, [
    { ticker, succeeded },
  ]);
}

export async function markProcessedBatch(kv, results) {
  if (!Array.isArray(results) || results.length === 0) return;

  const index = await readIndex(kv);
  const resultMap = new Map(
    results.map((r) => [r.ticker, r.succeeded]),
  );

  const now = Date.now();

  for (const item of index) {
    if (!resultMap.has(item.ticker)) continue;

    if (resultMap.get(item.ticker)) {
      item._remove = true;
    } else {
      item.retries += 1;
      item.lastAttempt = now;
    }
  }

  const updated = index.filter((item) => !item._remove);

  for (const item of updated) {
    delete item._remove;
  }

  await writeIndex(kv, evict(updated));
}

export async function queueStatus(kv) {
  const index = await readIndex(kv);
  const now = Date.now();

  return {
    depth: index.length,
    oldestAgeMs: index.length
      ? Math.max(...index.map((e) => now - e.enqueuedAt))
      : 0,
    itemsNearRetryLimit: index.filter(
      (e) => e.retries >= MAX_RETRIES - 1,
    ).length,
  };
}
