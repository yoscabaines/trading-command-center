import { providers } from '../providers/index.js';

const MAX_HEADLINE_LEN = 70;

function concise(headline) {
  if (headline.length <= MAX_HEADLINE_LEN) return headline;
  return headline.slice(0, MAX_HEADLINE_LEN - 1).trimEnd() + '…';
}

/** Returns the single strongest recent catalyst for a ticker, or null. Never fabricates. */
export async function getPrimaryCatalyst(ticker, env) {
  const r = await providers.catalysts.getCatalysts(ticker, env);
  if (!r.ok || !r.data?.length) return null;
  // Prioritize earnings and FDA/corporate events over routine news.
  const priority = { earnings: 0, fda: 1, corporate: 2, upgrade: 3, downgrade: 3, 'price-target': 4, ipo: 5, economic: 6, news: 7 };
  const sorted = [...r.data].sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9) || b.timestamp - a.timestamp);
  const top = sorted[0];
  return { type: top.type, text: concise(top.headline), timestamp: top.timestamp };
}
