const MAX_CANDIDATES = 5;

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function roundPrice(value) {
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}

function getPremarketBars(bars = []) {
  return bars.filter((bar) => {
    const ts = Number(bar.timestamp ?? bar.t ?? bar.time ?? 0);
    if (!ts) return false;

    const d = new Date(ts);
    const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();

    return minutes >= 8 * 60 && minutes < 13 * 60 + 30;
  });
}

function buildCandidate(
  ticker,
  quote,
  dailyBars,
  intradayBars,
  catalyst = null,
) {
  const price = num(quote?.price);

  if (!price || !dailyBars?.length) return null;

  const previous = dailyBars.at(-2);
  const previousClose = num(previous?.close);

  if (!previousClose) return null;

  const gapPct = ((price - previousClose) / previousClose) * 100;
  const premarketBars = getPremarketBars(intradayBars);

  const highs = premarketBars
    .map((b) => num(b.high))
    .filter(Number.isFinite);

  const lows = premarketBars
    .map((b) => num(b.low))
    .filter(Number.isFinite);

  const pmHigh = highs.length ? Math.max(...highs) : null;
  const pmLow = lows.length ? Math.min(...lows) : null;

  const pmVolume = premarketBars.reduce(
    (sum, b) => sum + (num(b.volume) || 0),
    0,
  );

  const priorHigh = num(previous?.high);
  const priorLow = num(previous?.low);

  const bullish = gapPct >= 0;
  const bias = bullish ? 'bullish' : 'bearish';

  const keyLevel = bullish
    ? pmHigh ?? priorHigh
    : pmLow ?? priorLow;

  const trigger = bullish
    ? `Break and hold above ${roundPrice(keyLevel)}`
    : `Break and hold below ${roundPrice(keyLevel)}`;

  const confirmation = bullish
    ? `Hold above ${roundPrice(keyLevel)} after the break`
    : `Hold below ${roundPrice(keyLevel)} after the break`;

  const invalidation = bullish
    ? `Lose ${roundPrice(pmLow ?? priorLow)}`
    : `Recover above ${roundPrice(pmHigh ?? priorHigh)}`;

  const range =
    pmHigh != null && pmLow != null
      ? pmHigh - pmLow
      : Math.abs(price - previousClose);

  const move = Math.max(range, price * 0.01);

  const targets = bullish
    ? [
        roundPrice(price + move * 0.5),
        roundPrice(price + move),
        roundPrice(price + move * 1.5),
        roundPrice(price + move * 2),
      ]
    : [
        roundPrice(price - move * 0.5),
        roundPrice(price - move),
        roundPrice(price - move * 1.5),
        roundPrice(price - move * 2),
      ];

  const activity = pmVolume > 0 ? Math.log10(pmVolume + 1) : 0;

  const levelInteraction =
    (pmHigh != null &&
    Math.abs(price - pmHigh) / price < 0.02
      ? 2
      : 0) +
    (pmLow != null &&
    Math.abs(price - pmLow) / price < 0.02
      ? 2
      : 0);

  const internalPriority =
    Math.min(Math.abs(gapPct), 10) +
    activity +
    levelInteraction +
    (catalyst ? 3 : 0);

  return {
    ticker,
    state: 'Watch',
    isPremarketOnly: true,
    bias,
    setupType: 'Potential setup',
    trigger,
    confirmation,
    invalidation,
    levels: {
      pmh: pmHigh != null ? roundPrice(pmHigh) : null,
      pml: pmLow != null ? roundPrice(pmLow) : null,
      pdh: priorHigh != null ? roundPrice(priorHigh) : null,
      pdl: priorLow != null ? roundPrice(priorLow) : null,
    },
    gapPct: roundPrice(gapPct),
    premarketVolume: pmVolume,
    targets,
    catalyst,
    entryPrice: roundPrice(price),
    internalPriority,
  };
}

export function selectMorningCandidates(
  rows,
  maxCandidates = MAX_CANDIDATES,
) {
  const candidates = rows
    .filter(Boolean)
    .sort((a, b) => b.internalPriority - a.internalPriority)
    .slice(0, maxCandidates);

  return {
    topWatch: candidates
      .slice(0, 3)
      .map(({ internalPriority, ...candidate }) => candidate),

    additionalWatch: candidates
      .slice(3, 6)
      .map(({ internalPriority, ...candidate }) => candidate),
  };
}

export { buildCandidate };
