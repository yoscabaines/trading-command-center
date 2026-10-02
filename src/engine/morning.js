const MORNING_KEY = 'morning-watchlist';

export async function saveMorningWatchlist(kv, candidates) {
  if (!kv) return;

  await kv.put(
    MORNING_KEY,
    JSON.stringify({
      savedAt: new Date().toISOString(),
      ...candidates,
    }),
  );
}

export async function getMorningWatchlist(kv) {
  if (!kv) return null;
  return kv.get(MORNING_KEY, 'json');
}
