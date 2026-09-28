// Persistent candidate queue, backed by QUEUE_KV. Prevents candidates that
// need intraday confirmation from being dropped between scan cycles.
// Exposes only operational status (queue depth, age, retry count) — never
// a ranking score or "best candidate" framing, per the product requirement.

const QUEUE_INDEX_KEY = 'queue:index';
const MAX_QUEUE_SIZE = 500;
const MAX_AGE_MS = 4 * 3600 * 1000; // evict candidates older than 4h regardless of retries
const MAX_RETRIES = 6;

async function readIndex(kv) {
  return (await kv.get(QUEUE_INDEX_KEY, 'json')) || [];
}
async function writeIndex(kv, index) {
  await kv.put(QUEUE_INDEX_KEY, JSON.stringify(index));
}

/** Adds a candidate ticker if not already queued; otherwise a no-op. */
export async function enqueue(kv, ticker, priority = 0) {
  const index = await readIndex(kv);
  if (index.find((e) => e.ticker === ticker)) return;
  const entry = { ticker, priority, enqueuedAt: Date.now(), retries: 0, lastAttempt: null };
  index.push(entry);
  await kv.put(`queue:item:${ticker}`, JSON.stringify(entry));
  index.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);
  await writeIndex(kv, evict(index));
}

function evict(index) {
  const now = Date.now();
  let out = index.filter((e) => now - e.enqueuedAt < MAX_AGE_MS && e.retries < MAX_RETRIES);
  if (out.length > MAX_QUEUE_SIZE) {
    // age out lowest-priority, oldest entries first
    out = out.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt).slice(0, MAX_QUEUE_SIZE);
  }
  return out;
}

export async function dequeueBatch(kv, batchSize = 25) {
  const index = await readIndex(kv);
  const batch = index.slice(0, batchSize);
  return batch;
}

export async function markProcessed(kv, ticker, succeeded) {
  const index = await readIndex(kv);
  const idx = index.findIndex((e) => e.ticker === ticker);
  if (idx === -1) return;
  if (succeeded) {
    index.splice(idx, 1);
    await kv.delete(`queue:item:${ticker}`);
  } else {
    index[idx].retries += 1;
    index[idx].lastAttempt = Date.now();
    await kv.put(`queue:item:${ticker}`, JSON.stringify(index[idx]));
  }
  await writeIndex(kv, evict(index));
}

/** Operational status only — no scores, no "top" framing. */
export async function queueStatus(kv) {
  const index = await readIndex(kv);
  const now = Date.now();
  return {
    depth: index.length,
    oldestAgeMs: index.length ? Math.max(...index.map((e) => now - e.enqueuedAt)) : 0,
    itemsNearRetryLimit: index.filter((e) => e.retries >= MAX_RETRIES - 1).length,
  };
}
