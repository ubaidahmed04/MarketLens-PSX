// ─────────────────────────────────────────────────────────────
//  All settings in one place. Change things here first.
// ─────────────────────────────────────────────────────────────

export const SARMAAYA_BASE = import.meta.env.VITE_SARMAAYA_URL || '/sarmaaya'
export const LINEUP_BASE = import.meta.env.VITE_LINEUP_URL || '/lineup'

// How often live data refreshes (milliseconds)
export const POLL_MS = 15000

// Indices shown in the portal
export const INDICES = [
  { symbol: 'KSE100', name: 'KSE-100', desc: '100 largest listed companies' },
  { symbol: 'KSE30', name: 'KSE-30', desc: '30 most liquid blue chips' },
  { symbol: 'KMI30', name: 'KMI-30', desc: '30 Shariah-compliant stocks' },
  { symbol: 'ALLSHR', name: 'All Share', desc: 'Every listed share on PSX' },
]

// Stock universe used for Top Advancers / Decliners / Most Active / Watchlist.
// Tries the first one; if it fails or is empty, falls back to the second.
export const MOVERS_UNIVERSE = [
  { symbol: 'ALLSHR', limit: 600 },
  { symbol: 'KSE100', limit: 100 },
]

// ── Your own API (nfapi037.lineup.pk) ──────────────────────────
// Put your endpoint paths here. Empty string = not used.
// When set, these LIVE values override Sarmaaya's for index cards & watchlist.
//   indices: returns a list of indices  e.g. '/api/psx/indices'
//   quotes : returns quotes for symbols, {symbols} becomes "HUBC,SYS,..."
//            e.g. '/api/psx/quotes?symbols={symbols}'
// Field names are mapped in src/api/lineup.js (mapIndex / mapQuote).
export const LINEUP_ENDPOINTS = {
  indices: '',
  quotes: '',
}

// PSX trading hours in Pakistan time (24h "HH:MM"). 0 = Sunday ... 6 = Saturday.
export const MARKET_HOURS = {
  1: [['09:30', '15:30']],
  2: [['09:30', '15:30']],
  3: [['09:30', '15:30']],
  4: [['09:30', '15:30']],
  5: [['09:15', '12:00'], ['14:30', '16:30']],
}

export const DEFAULT_WATCHLIST = ['HUBC', 'SYS', 'LUCK', 'OGDC', 'MARI', 'MEBL']

// Friendly names for index symbols (the API's own names are sometimes wrong or messy).
// Any symbol not listed here falls back to the name the API sends.
export const INDEX_LABELS = {
  KSE100: ['KSE-100', '100 largest listed companies'],
  KSE100PR: ['KSE-100 PR', 'KSE-100 price-return version'],
  KSE30: ['KSE-30', '30 most liquid blue chips'],
  KMI30: ['KMI-30', '30 Shariah-compliant stocks'],
  ALLSHR: ['All Share', 'Every listed share on PSX'],
  KMIALLSHR: ['KMI All Share', 'All Shariah-compliant shares'],
  BKTI: ['Banks Tradable', 'Banking sector tradable index'],
  OGTI: ['Oil & Gas Tradable', 'Oil & gas sector tradable index'],
  UPP9: ['UBL Pakistan Enterprise', 'UPP9 index'],
  NBPPGI: ['NBP Pakistan Growth', 'NBPPGI index'],
  MZNPI: ['Meezan Pakistan', 'MZNPI index'],
  NITPGI: ['NIT Pakistan Gateway', 'NITPGI index'],
  PSXDIV20: ['PSX Dividend 20', '20 high-dividend stocks'],
  HBLTTI: ['HBL Total Treasury', 'Government securities index'],
  JSMFI: ['JS Momentum Factor', 'JSMF index'],
  JSGBKTI: ['JS Global Banking', 'Banking sector index'],
  MII30: ['Mahaana Islamic 30', 'MII30 index'],
}

// Tabs on the Performers screen: [API "type" value, label]. Adjust if the API uses other words.
export const PERFORMER_TYPES = [
  ['active', 'Most active'],
  ['gainers', 'Gainers'],
  ['losers', 'Losers'],
]
