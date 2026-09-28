// ---------------------------------------------------------------------------
// THEME / UI-CONFIG LAYER
//
// This is the ONLY file you should need to touch to change how the app
// looks. Nothing in src/engine/*, src/providers/*, src/journal/*, or
// src/api/* reads from here — the scanner/business logic has zero
// dependency on presentation. The UI (src/ui/*) reads this object at
// render time and turns it into CSS custom properties, so every value
// below is live-editable without touching component code.
//
// To add a preset: copy DEFAULT_THEME, override what you want, add it to
// THEME_PRESETS at the bottom, and reference it by name via the
// `?theme=` query param or the THEME_PRESET var.
// ---------------------------------------------------------------------------

export const DEFAULT_THEME = {
  colors: {
    pageBg: '#0a0e14',
    secondaryBg: '#0f1420',
    cardBg: '#141a26',
    cardHoverBg: '#1a2130',
    panelBg: '#10151f',

    textPrimary: '#e8ecf4',
    textSecondary: '#9aa5b8',
    textMuted: '#5c6478',

    border: '#232b3d',
    divider: '#1c2333',

    bullish: '#2ecc71',
    bearish: '#e74c3c',
    neutral: '#8a93a6',
    warning: '#f5a623',
    success: '#2ecc71',
    error: '#e74c3c',

    buttonBg: '#3b7cff',
    buttonText: '#ffffff',
    buttonHoverBg: '#5a90ff',

    inputBg: '#0f1420',
    inputBorder: '#2a3448',

    accent: '#3b7cff',
    accentSecondary: '#9b6bff',

    chartUp: '#2ecc71',
    chartDown: '#e74c3c',
    chartGrid: '#1c2333',

    badgeBg: '#1c2333',
    badgeText: '#c3cadb',

    levelColor: '#f5a623',
    targetColor: '#3b7cff',
    invalidationColor: '#e74c3c',
  },

  typography: {
    fontPrimary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSecondary: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
    fontSizeBase: '14px',
    fontSizeSm: '12px',
    fontSizeLg: '16px',
    headingSize: '20px',
    tickerSize: '22px',
    cardTitleSize: '16px',
    labelSize: '11px',
    buttonSize: '14px',
    lineHeight: '1.45',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700',
    letterSpacing: '0.01em',
  },

  layout: {
    pageMaxWidth: '1400px',
    pagePadding: '20px',
    cardMinWidth: '320px',
    cardGap: '16px',
    borderRadius: '10px',
    cardPadding: '16px',
    headerHeight: '64px',
    gridColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    mobileBreakpoint: '640px',
    desktopBreakpoint: '1024px',
    spacingScale: [4, 8, 12, 16, 24, 32, 48],
  },

  components: {
    cardBorder: '1px solid var(--border)',
    cardShadow: '0 1px 3px rgba(0,0,0,0.4)',
    cardRadius: '10px',
    buttonRadius: '8px',
    badgeRadius: '999px',
    inputRadius: '8px',
    hoverTransition: 'all 0.15s ease',
    transitionSpeed: '0.15s',
    animationEnabled: true,
    cardOpacity: 1,
    borderWidth: '1px',
  },

  background: {
    mode: 'solid', // 'solid' | 'gradient' | 'image'
    solid: '#0a0e14',
    gradient: 'linear-gradient(180deg, #0a0e14 0%, #0d1220 100%)',
    image: '',
    imageOpacity: 0.15,
    imagePosition: 'center',
    imageSize: 'cover',
    overlay: 'rgba(10,14,20,0.6)',
    panelTransparency: 1,
  },

  branding: {
    siteName: 'Trade Command Center',
    subtitle: 'Live setup scanner',
    logo: '',
    favicon: '',
    browserTitle: 'Trade Command Center',
    headerText: 'Trade Command Center',
    footerText: '',
  },
};

// ---------------------------------------------------------------------------
// UI TEXT — every user-facing string in one place. Component code should
// never hardcode a phrase; it should read from this object (passed through
// as `text` alongside `theme`).
// ---------------------------------------------------------------------------
export const DEFAULT_TEXT = {
  appTitle: 'Trade Command Center',
  scanButton: 'Scan',
  refreshButton: 'Refresh',
  noSetups: 'No actionable setups right now.',
  marketOpen: 'Market Open',
  marketClosed: 'Market Closed',
  marketPremarket: 'Premarket',
  marketAfterHours: 'After Hours',
  lastUpdated: 'Last Updated',
  catalystLabel: 'Catalyst',
  setupLabel: 'Setup',
  entryLabel: 'Entry',
  watchLabel: 'Watch',
  expirationLabel: 'Expiration',
  callsLabel: 'Calls',
  putsLabel: 'Puts',
  tpsLabel: 'TPs',
  invalidationLabel: 'Invalidation',
  confirmationLabel: 'Confirmation',
  loading: 'Loading…',
  dataUnavailable: 'Data unavailable',
  errorGeneric: 'Something went wrong. Try refreshing.',
  errorScan: 'Scan failed — see status panel for details.',
  emptyStateSub: 'The scanner is running but nothing has met the actionable bar yet.',
  connectionOk: 'Connected',
  connectionDown: 'Disconnected',
  journalTitle: 'Journal',
  freshnessLive: 'Live',
  freshnessDelayed: 'Delayed',
  freshnessStale: 'Stale',
};

export const THEME_PRESETS = {
  'dark-purple': {
    colors: {
      pageBg: '#0d0a14', secondaryBg: '#120f1c', cardBg: '#181228', cardHoverBg: '#201a33',
      panelBg: '#140f20', border: '#2a2140', divider: '#221a36',
      accent: '#a855f7', accentSecondary: '#6366f1', buttonBg: '#a855f7', buttonHoverBg: '#c084fc',
      textPrimary: '#ede9f7', textSecondary: '#a79dc4', textMuted: '#6b6188',
    },
    background: { mode: 'gradient', gradient: 'linear-gradient(180deg,#0d0a14 0%,#150f24 100%)' },
  },
  'dark-blue': {
    colors: {
      pageBg: '#060b16', secondaryBg: '#0a1120', cardBg: '#0f1930', cardHoverBg: '#142240',
      accent: '#3b82f6', buttonBg: '#3b82f6', buttonHoverBg: '#60a5fa',
    },
  },
  'black-white': {
    colors: {
      pageBg: '#000000', secondaryBg: '#0a0a0a', cardBg: '#111111', cardHoverBg: '#1a1a1a',
      panelBg: '#0a0a0a', border: '#2a2a2a', divider: '#1a1a1a',
      textPrimary: '#ffffff', textSecondary: '#b3b3b3', textMuted: '#6b6b6b',
      accent: '#ffffff', buttonBg: '#ffffff', buttonText: '#000000', buttonHoverBg: '#d9d9d9',
      bullish: '#ffffff', bearish: '#808080',
    },
  },
  emerald: {
    colors: {
      pageBg: '#06120d', secondaryBg: '#081a12', cardBg: '#0d2318', cardHoverBg: '#123020',
      accent: '#10b981', buttonBg: '#10b981', buttonHoverBg: '#34d399',
    },
  },
  minimal: {
    colors: {
      pageBg: '#fafafa', secondaryBg: '#f2f2f2', cardBg: '#ffffff', cardHoverBg: '#f5f5f5',
      panelBg: '#ffffff', border: '#e5e5e5', divider: '#eeeeee',
      textPrimary: '#111111', textSecondary: '#555555', textMuted: '#999999',
      accent: '#111111', buttonBg: '#111111', buttonText: '#ffffff', buttonHoverBg: '#333333',
      inputBg: '#ffffff', inputBorder: '#dddddd',
    },
    components: { cardShadow: '0 1px 2px rgba(0,0,0,0.06)' },
    background: { mode: 'solid', solid: '#fafafa' },
  },
  'high-contrast': {
    colors: {
      pageBg: '#000000', cardBg: '#000000', border: '#ffffff', divider: '#ffffff',
      textPrimary: '#ffffff', textSecondary: '#ffffff', textMuted: '#cccccc',
      bullish: '#00ff66', bearish: '#ff3333', warning: '#ffcc00',
      accent: '#ffff00', buttonBg: '#ffff00', buttonText: '#000000',
    },
    components: { borderWidth: '2px' },
  },
};

function deepMerge(base, override) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override || {})) {
    const bv = base ? base[key] : undefined;
    const ov = override[key];
    if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object') {
      out[key] = deepMerge(bv, ov);
    } else {
      out[key] = ov;
    }
  }
  return out;
}

export function resolveTheme(presetName) {
  if (!presetName || !THEME_PRESETS[presetName]) return DEFAULT_THEME;
  return deepMerge(DEFAULT_THEME, THEME_PRESETS[presetName]);
}

export function themeToCssVariables(theme) {
  const lines = [];
  for (const [group, values] of Object.entries(theme)) {
    if (typeof values !== 'object' || Array.isArray(values)) continue;
    for (const [key, val] of Object.entries(values)) {
      if (Array.isArray(val) || typeof val === 'boolean') continue;
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      lines.push(`  ${cssVar}: ${val};`);
    }
  }
  return `:root {\n${lines.join('\n')}\n}`;
}
