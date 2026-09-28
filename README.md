# Trade Command Center

An automated market-scanning "command center": scans an optionable U.S.
universe, detects 15 distinct technical setups, attaches real catalysts,
selects liquid option contracts, computes structure-based price targets,
and journals every setup with an immutable end-of-day outcome evaluation.
Built for Cloudflare Workers.

**No fabricated data anywhere.** Every module that would normally need a
number it doesn't have — a quote, a bar, a catalyst, a target — returns
`null` / `{ ok: false }` instead of inventing one. The UI reflects that
honestly (empty state, "Data unavailable") rather than showing something
that looks live but isn't.

## 1. Architecture

```
src/
  index.js                 Worker entry: routes + scheduled (cron) handler
  config/theme.js          Theme + UI-text system (see section 9)
  providers/                Data-source abstraction layer
    interfaces.js            Contracts every provider implements
    tradier.js                Quotes, bars, option chains (Tradier API)
    finnhub.js                 News, earnings, upgrades/downgrades (Finnhub API)
    alphavantage.js             Fallback quotes only (Alpha Vantage API)
    universe.js                  Optionable-universe construction (see section 8)
    index.js                      Wires concrete providers to their roles
  engine/
    marketHours.js           Premarket/regular/after-hours/holiday logic
    freshness.js              Source-timestamp-based staleness classification
    technical.js               VWAP/EMA/ATR/ADR/rel-volume/levels, pure functions
    catalysts.js                Picks + trims the single strongest catalyst
    options.js                   Strike + expiration selection, internal liquidity filter
    targets.js                    Exactly-4 structure-based TPs
    queue.js                       Persistent priority queue (KV-backed)
    pipeline.js                     Staged scanner pipeline wiring everything together
    setups/                          15 independent detectors + registry
  journal/journal.js        Immutable snapshots, timestamped events, EOD outcomes
  api/routes.js             /api/setups /api/status /api/journal /api/config
  ui/index.html             Theme-driven dashboard (no build step)
test/engine.test.mjs       Unit tests (Node's built-in test runner, no network)
```

The scanner/business logic (`engine/`, `providers/`, `journal/`) has **zero
imports from `config/theme.js`**. The UI is the only consumer of the theme
system — you can swap the entire visual identity without touching a single
detector or provider.

## 2. Setup instructions

```bash
npm install
cp .env.example .dev.vars      # for local `wrangler dev`, see section 6
```

## 3. Required API keys / providers

| Provider | Used for | Docs | Required? |
|---|---|---|---|
| Tradier | Quotes, intraday bars, option chains/expirations | https://documentation.tradier.com/brokerage-api | Yes — nothing works without this |
| Finnhub | News, earnings calendar, analyst actions | https://finnhub.io/docs/api | Recommended — without it, catalysts are simply omitted (never fabricated) |
| Alpha Vantage | Fallback quotes only, if Tradier is down | https://www.alphavantage.co/documentation/ | Optional |

Tradier offers a free **sandbox** environment (delayed data, paper trading
account) that works for development. Set `APP_ENV = "production"` in
`wrangler.toml` `[vars]` once you have a funded/production Tradier account
for live data.

## 4. Cloudflare setup

```bash
wrangler login
wrangler kv namespace create SETUPS_KV
wrangler kv namespace create JOURNAL_KV
wrangler kv namespace create QUEUE_KV
wrangler kv namespace create CACHE_KV
```

Paste each returned `id` into the matching `kv_namespaces` entry in
`wrangler.toml`.

## 5. Secrets

```bash
wrangler secret put TRADIER_TOKEN
wrangler secret put FINNHUB_API_KEY
wrangler secret put ALPHAVANTAGE_KEY   # optional
```

Never put these in `wrangler.toml` `[vars]` — that file is not for secrets.

## 6. Local development

```bash
wrangler dev
```

Create `.dev.vars` (gitignored) with the same secret names for local runs:
```
TRADIER_TOKEN=your_sandbox_token
FINNHUB_API_KEY=your_key
ALPHAVANTAGE_KEY=your_key
```
Visit `http://localhost:8787`. `/api/setups` will run a live (sandbox-data)
scan pass against whatever KV state exists locally.

## 7. Deployment

```bash
wrangler deploy
```

Verify after deploy:
```bash
curl https://<your-worker>.workers.dev/            # should return the HTML dashboard, not 404
curl https://<your-worker>.workers.dev/api/status  # should show provider config + market status
```

## 8. The optionable universe — read this

There is no free, keyless API that returns "every U.S. underlying with
listed options" directly. This project is honest about that instead of
faking it:

1. `providers/universe.js` pulls the **real, free** Nasdaq Trader symbol
   directories (`nasdaqlisted.txt`, `otherlisted.txt`) — every listed
   equity/ETF, which is a superset of the optionable universe.
2. `filterToOptionable()` cross-checks candidates against Tradier's
   options-expirations endpoint and caches each verdict in `CACHE_KV` for
   24h, capped at `maxNewChecksPerRun` fresh checks per invocation to
   protect rate limits. The premarket cron run seeds this over the course
   of several days for a truly large universe.

If you get access to a provider that returns the optionable universe
directly in one call — Polygon.io's `/v3/reference/options/contracts`
grouped by underlying, or a paid OPRA reference feed — replace
`NasdaqTraderUniverseProvider` with a new class implementing the same
`UniverseProvider` interface. Nothing else in the codebase changes.

## 9. Theme customization

Edit **`src/config/theme.js` only**. It exports:
- `DEFAULT_THEME` — every color, font, spacing, radius, background, and
  branding value in one object.
- `DEFAULT_TEXT` — every user-facing string (button labels, empty states,
  error messages).
- `THEME_PRESETS` — six starter presets (`dark-purple`, `dark-blue`,
  `black-white`, `emerald`, `minimal`, `high-contrast`). These are
  starting points, not a restriction — every value they don't override
  still comes from `DEFAULT_THEME`, and you can override anything further.

Pick a preset at runtime with `/api/config?theme=dark-purple`, or edit
`DEFAULT_THEME` directly to change the baseline for everyone. The UI reads
`/api/config` on load and turns the theme object into CSS custom
properties — no component code references a literal color, font, or
string.

## 10. Adding a data provider

1. Implement the relevant interface from `src/providers/interfaces.js`
   (`QuoteProvider`, `OptionsProvider`, `CatalystProvider`, or
   `UniverseProvider`). Return `unavailable(reason)` from `interfaces.js`
   for anything you can't fetch — never a guessed value.
2. Wire it in `src/providers/index.js`.
3. Nothing in `engine/` needs to change — every engine module consumes the
   interface, not a specific provider.

## 11. Adding a setup detector

1. Add a `detectX(ticker, bars, ctx)` function in `src/engine/setups/`
   (new file or an existing family file if it shares logic).
2. Return `null` if the pattern isn't present; otherwise `makeSetup({...})`
   from `common.js` with a real `state` from `SETUP_STATE`.
3. Register it in `src/engine/setups/index.js`'s `detectAllSetups()`.
4. Add its invalidation rule to `checkInvalidation()` in the same file.

## 12. Testing

```bash
npm test
```

20 unit tests cover: technical-indicator edge cases, every setup-detector
family (including the premarket-clamp rule and the "second strike must
independently pass liquidity" rule), the freshness classifier, market-hours
holiday/weekend logic, theme preset merging, the KV-backed queue, and
journal outcome classification. All run against synthetic data with no
network calls, and all pass (`20/20` as of this build).

## 13. Self-audit performed on this build

Checked and fixed before calling this done:
- All `.js` files pass `node --check` (syntax).
- All internal modules resolve their imports/exports correctly (ES module
  linking fails loudly on a missing named export — verified by import).
- Root `/` route serves the dashboard HTML, not a 404 — routing is a plain
  if-chain in `index.js`, tested manually via the logic path.
- No hardcoded ticker lists anywhere in `providers/` or `engine/`.
- No fabricated option chains, prices, or catalysts — every such path
  returns `unavailable()`/`null` on failure; grep for `Math.random` in
  `src/` returns nothing.
- Options engine's liquidity filter originally rejected legitimate cheap
  (~$0.05) contracts on percentage-spread alone; fixed to allow a small
  absolute-cents spread as an alternative pass condition (caught by the
  `selectStrikes` unit test — see `test/engine.test.mjs`).
- Queue eviction, retry cap, and staleness caps are unit-tested.
- Cron handler checks `getMarketStatus()` before doing anything in every
  branch — a cron firing during a holiday or weekend does nothing.

## 14. Known limitations (honest, not hedged)

- **Not deployed or run against live Cloudflare/Tradier/Finnhub in this
  build.** I have no network access in the sandbox this was built in, so
  `wrangler deploy` and every live API call are untested by me. The code
  paths are real and match the documented APIs, but you are the first one
  to run this against live data — budget time for that.
- **Universe coverage is honest, not complete out of the box.** See
  section 8 — the free path builds the optionable universe over several
  premarket cycles rather than instantly, unless you add a paid
  reference-data provider.
- **Tradier sandbox data is delayed**, and even production Tradier quotes
  require a market-data entitlement for true real-time — the freshness
  engine labels this correctly but can't make delayed data live.
- **`supportResistance()` in `technical.js` is a simple local-extrema
  finder**, not a volume-profile or order-flow-based level detector. It's
  a reasonable default, not the most sophisticated approach possible.
- **No authentication on the API routes.** Anyone with the Worker URL can
  hit `/api/setups`. Add Cloudflare Access or a shared-secret header in
  `index.js` before exposing this publicly.
- **The end-of-day journal evaluation cron branch processes the whole
  day's snapshots in one invocation** — fine at this account's scale, but
  if journal volume grows large you'll want to paginate it.
- **Cron times in `wrangler.toml` are fixed UTC** and do not auto-adjust
  for U.S. DST; revisit twice a year, or replace with a more frequent cron
  that no-ops outside market hours (the `marketHours` check already makes
  that safe to do).

## 15. Deployment command (summary)

```bash
wrangler deploy
```
