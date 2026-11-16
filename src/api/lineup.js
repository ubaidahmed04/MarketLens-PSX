import { LINEUP_BASE, LINEUP_ENDPOINTS } from '../config'

async function get(path) {
  const res = await fetch(LINEUP_BASE + path)
  if (!res.ok) throw new Error(`Lineup HTTP ${res.status}`)
  return res.json()
}

// Accepts common response shapes: [...], {data:[...]}, {response:[...]}, {response:{data:[...]}}
function toList(json) {
  if (Array.isArray(json)) return json
  return json?.data || json?.response?.data || json?.response || json?.result || []
}

const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v))

// ── Adjust these two mappers to match your API's field names ──
function mapIndex(row) {
  return {
    symbol: String(row.symbol ?? row.index ?? row.name ?? '').toUpperCase(),
    value: num(row.value ?? row.current ?? row.curr ?? row.price ?? row.last),
    change: num(row.change ?? row.netChange),
    changePercent: num(row.changePercent ?? row.change_percent ?? row.pctChange),
  }
}

function mapQuote(row) {
  return {
    symbol: String(row.symbol ?? row.Symbol ?? '').toUpperCase(),
    curr: num(row.curr ?? row.current ?? row.price ?? row.last ?? row.ltp),
    change: num(row.change ?? row.netChange),
    changePercent: num(row.changePercent ?? row.change_percent ?? row.pctChange),
    volume: num(row.volume ?? row.vol),
    high: num(row.high),
    low: num(row.low),
  }
}

// Returns null when the endpoint isn't configured, so the app just uses Sarmaaya.
export async function getLiveIndices() {
  if (!LINEUP_ENDPOINTS.indices) return null
  return toList(await get(LINEUP_ENDPOINTS.indices)).map(mapIndex)
}

export async function getLiveQuotes(symbols) {
  if (!LINEUP_ENDPOINTS.quotes || !symbols.length) return null
  const path = LINEUP_ENDPOINTS.quotes.replace('{symbols}', encodeURIComponent(symbols.join(',')))
  return toList(await get(path)).map(mapQuote)
}
