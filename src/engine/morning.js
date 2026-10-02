const MORNING_KEY = 'morning-watchlist';

function candidateStrength(candidate) {
  const gap = Math.abs(Number(candidate?.gapPct) || 0);
  const volume = Number(candidate?.premarketVolume) || 0;

  return gap + Math.log10(volume + 1);
}

function mergeCandidates(existing, incoming) {
  const all = [
    ...(existing?.topWatch || []),
    ...(existing?.additionalWatch || []),
    ...(incoming?.topWatch || []),
    ...(incoming?.additionalWatch || []),
  ];

  const unique = new Map();

  for (const candidate of all) {
    if (!candidate?.ticker) continue;

    const previous = unique.get(candidate.ticker);

    if (
      !previous ||
      candidateStrength(candidate) > candidateStrength(previous)
    ) {
      unique.set(candidate.ticker, candidate);
    }
  }

  const sorted = [...unique.values()]
    .sort((a, b) => candidateStrength(b) - candidateStrength(a))
    .slice(0, 6);

  return {
    topWatch: sorted.slice(0, 3),
    additionalWatch: sorted.slice(3, 6),
  };
}

export async function saveMorningWatchlist(kv, candidates) {
  if (!kv) return null;

  const existing = await kv.get(MORNING_KEY, 'json');

  const merged = mergeCandidates(existing, candidates);

  const snapshot = {
    savedAt: new Date().toISOString(),
    ...merged,
  };

  await kv.put(MORNING_KEY, JSON.stringify(snapshot));

  return snapshot;
}

export async function getMorningWatchlist(kv) {
  if (!kv) return null;
  return kv.get(MORNING_KEY, 'json');
}
