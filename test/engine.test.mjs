import test from 'node:test';
import assert from 'node:assert/strict';

import { vwap, atr, ema, buildTechnicalContext } from '../src/engine/technical.js';
import { detectAllSetups, SETUP_STATE } from '../src/engine/setups/index.js';
import { detectBreakout, detectBreakdown } from '../src/engine/setups/breakoutFamily.js';
import { detectSupportBounce } from '../src/engine/setups/bounceRejectionFamily.js';
import { detectPremarketHighBreak } from '../src/engine/setups/levelBreakFamily.js';
import { calculateTargets } from '../src/engine/targets.js';
import { classify, isDecisionGrade } from '../src/engine/freshness.js';
import { getMarketStatus } from '../src/engine/marketHours.js';
import { resolveTheme, themeToCssVariables, THEME_PRESETS } from '../src/config/theme.js';
import { selectStrikes, chooseExpiration } from '../src/engine/options.js';
import { enqueue, dequeueBatch, markProcessed, queueStatus } from '../src/engine/queue.js';
import { evaluateAtClose, OUTCOMES } from '../src/journal/journal.js';

function makeBars(closes, volBase = 1_000_000) {
  return closes.map((c, i) => ({
    time: i, open: c - 0.1, high: c + 0.2, low: c - 0.3, close: c, volume: volBase + i * 1000,
  }));
}

test('vwap returns null on empty bars, a number otherwise', () => {
  assert.equal(vwap([]), null);
  const bars = makeBars([10, 10.5, 11]);
  assert.ok(typeof vwap(bars) === 'number');
});

test('atr requires period+1 bars', () => {
  assert.equal(atr(makeBars([1, 2, 3]), 14), null);
  const bars = makeBars(Array.from({ length: 20 }, (_, i) => 10 + Math.sin(i)));
  assert.ok(typeof atr(bars, 14) === 'number');
});

test('detectBreakout fires on sustained acceptance above resistance', () => {
  const bars = makeBars([10, 10.1, 10.2, 10.3, 10.6, 10.65, 10.7]);
  const ctx = { resistances: [10.4], prevClose: 10.0, relVolume: 2.0 };
  const setup = detectBreakout('TEST', bars, ctx);
  assert.ok(setup);
  assert.equal(setup.bias, 'bullish');
  assert.equal(setup.state, SETUP_STATE.CONFIRMED);
});

test('detectBreakout does not fire without a break', () => {
  const bars = makeBars([10, 10.1, 10.0, 10.1, 10.0]);
  const ctx = { resistances: [12], prevClose: 10.0, relVolume: 2.0 };
  assert.equal(detectBreakout('TEST', bars, ctx), null);
});

test('detectBreakdown mirrors breakout downside', () => {
  const bars = makeBars([10, 9.9, 9.8, 9.5, 9.4, 9.3]);
  const ctx = { supports: [9.6], prevClose: 10.0, relVolume: 2.0 };
  const setup = detectBreakdown('TEST', bars, ctx);
  assert.ok(setup);
  assert.equal(setup.bias, 'bearish');
});

test('detectSupportBounce requires wick-below-close-above then follow-through', () => {
  const bars = makeBars([10.5, 10.4, 9.95, 10.6]); // manual override needed for wick
  bars[2] = { open: 10.3, high: 10.35, low: 9.9, close: 10.05, volume: 1_000_000 }; // rejection bar
  const ctx = { supports: [10.0], atr14: 0.2 };
  const setup = detectSupportBounce('TEST', bars, ctx);
  assert.ok(setup);
  assert.equal(setup.bias, 'bullish');
});

test('premarket-only setup is clamped to Awaiting confirmation, never Confirmed', () => {
  const bars = makeBars([9.0, 9.1, 9.3]);
  const ctx = { pmh: 9.2 };
  const setup = detectPremarketHighBreak('TEST', bars, ctx, /*isRegularSession*/ false);
  assert.ok(setup);
  assert.equal(setup.state, SETUP_STATE.AWAITING_CONFIRMATION);
  assert.equal(setup.isPremarketOnly, true);
});

test('premarket high break confirms once regular session data agrees', () => {
  const bars = makeBars([9.0, 9.1, 9.3]);
  const ctx = { pmh: 9.2 };
  const setup = detectPremarketHighBreak('TEST', bars, ctx, /*isRegularSession*/ true);
  assert.equal(setup.state, SETUP_STATE.CONFIRMED);
});

test('calculateTargets returns exactly 4 targets when structure supports it, or null otherwise', () => {
  const ctx = { atr14: 0.5, resistances: [101, 103] };
  const setup = { bias: 'bullish' };
  const targets = calculateTargets(setup, 100, ctx);
  assert.ok(targets === null || targets.length === 4);
});

test('calculateTargets never fabricates when there is zero structure', () => {
  const setup = { bias: 'bullish' };
  const targets = calculateTargets(setup, 100, {});
  assert.equal(targets, null);
});

test('freshness classify: live/delayed/stale/unavailable', () => {
  const now = Date.now();
  assert.equal(classify('quote', now - 1000, now), 'live');
  assert.equal(classify('quote', now - 4 * 60 * 1000, now), 'delayed');
  assert.equal(classify('quote', now - 20 * 60 * 1000, now), 'stale');
  assert.equal(classify('quote', null, now), 'unavailable');
  assert.equal(isDecisionGrade('quote', now - 20 * 60 * 1000, now), false);
});

test('marketHours: weekend is always closed', () => {
  const saturday = new Date('2026-09-26T15:00:00Z'); // a Saturday
  const status = getMarketStatus(saturday);
  assert.equal(status.status, 'closed');
  assert.equal(status.reason, 'weekend');
});

test('marketHours: a known 2026 holiday is closed', () => {
  const newYears = new Date('2026-01-01T15:00:00Z');
  assert.equal(getMarketStatus(newYears).reason, 'holiday');
});

test('theme: preset merges over default without losing untouched keys', () => {
  const theme = resolveTheme('dark-purple');
  assert.equal(theme.colors.accent, THEME_PRESETS['dark-purple'].colors.accent);
  assert.ok(theme.typography.fontPrimary); // untouched key survives merge
  const css = themeToCssVariables(theme);
  assert.ok(css.includes('--page-bg'));
});

test('theme: unknown preset falls back to default', () => {
  const theme = resolveTheme('does-not-exist');
  assert.equal(theme.colors.pageBg, '#0a0e14');
});

test('options: second-best strike is independently liquid, not just cheaper', () => {
  const chain = [
    { symbol: 'A', type: 'call', strike: 101, bid: 0.05, ask: 0.06, volume: 500, openInterest: 1000, delta: 0.3 },
    { symbol: 'B', type: 'call', strike: 102, bid: 0.5, ask: 5.0, volume: 5, openInterest: 5, delta: 0.3 }, // illiquid, wide spread
    { symbol: 'C', type: 'call', strike: 103, bid: 0.03, ask: 0.035, volume: 200, openInterest: 500, delta: 0.25 },
  ];
  const { preferred, secondBest } = selectStrikes(chain, 'bullish', 100);
  assert.ok(preferred);
  assert.notEqual(secondBest?.symbol, 'B'); // illiquid contract must be excluded even though it's a valid "next" strike
});

test('options: expiration selection honors trade horizon', () => {
  const exps = ['2026-10-02', '2026-10-09', '2026-10-16', '2026-11-20'];
  assert.equal(chooseExpiration(exps, 'day'), '2026-10-02');
  const swing = chooseExpiration(exps, 'swing');
  assert.ok(exps.includes(swing));
});

test('queue: enqueue/dequeue/markProcessed roundtrip with in-memory KV shim', async () => {
  const store = new Map();
  const kv = {
    get: async (k, type) => (store.has(k) ? (type === 'json' ? JSON.parse(store.get(k)) : store.get(k)) : null),
    put: async (k, v) => { store.set(k, v); },
    delete: async (k) => { store.delete(k); },
  };
  await enqueue(kv, 'AAPL', 1);
  await enqueue(kv, 'TSLA', 2);
  let status = await queueStatus(kv);
  assert.equal(status.depth, 2);
  const batch = await dequeueBatch(kv, 10);
  assert.equal(batch[0].ticker, 'TSLA'); // higher priority first
  await markProcessed(kv, 'TSLA', true);
  status = await queueStatus(kv);
  assert.equal(status.depth, 1);
});

test('journal: evaluateAtClose returns null without real price data', () => {
  assert.equal(evaluateAtClose({ bias: 'bullish', events: [], levels: {}, targets: [] }, [], null), null);
});

test('journal: never-confirmed outcome when trigger never hit', () => {
  const snapshot = { bias: 'bullish', events: [], levels: { level: 100 }, targets: [101, 102, 103, 104] };
  const series = [{ time: 1, price: 99 }, { time: 2, price: 99.5 }];
  const evalResult = evaluateAtClose(snapshot, series, 99.5);
  assert.equal(evalResult.outcome, OUTCOMES.NEVER_CONFIRMED);
});
