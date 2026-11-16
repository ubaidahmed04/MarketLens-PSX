import { SARMAAYA_BASE } from '../config'

async function get(path) {
  const res = await fetch(SARMAAYA_BASE + path)
  if (!res.ok) throw new Error(`Sarmaaya HTTP ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Sarmaaya API error')
  return json.response
}

// [{ symbol, price, date }] sorted oldest → newest
export async function getPriceHistory(symbol, days = 30) {
  const list = await get(`/api/indices/price-history/${symbol}?days=${days}`)
  return [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
}

// { positiveData: [{ name, indexpoints, marketCap, volume }], negativeData: [...] }
export function getContributors(symbol) {
  return get(`/api/indices/top-point-contributors/${symbol}?filter=stocks`)
}

// [{ symbol, curr, change, changePercent, volume, high52, low52, marketCap, weights, points, logo, isShariah }]
export async function getCompanies(symbol, limit = 100) {
  const res = await get(`/api/indices/${symbol}/companies?page=1&limit=${limit}`)
  return res?.data || []
}

// ───────── Extra screens ─────────
const num = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

// One shape for any index row, whatever field names the endpoint uses
export function normIndex(r) {
  const value = num(r.close ?? r.curr ?? r.current ?? r.price)
  const prevRaw = num(r.ldcp ?? r.previousClose ?? r.prevClose ?? r.prev_close ?? r.previous)
  let change = num(r.change ?? r.netChange)
  if (change == null && value != null && prevRaw != null) change = value - prevRaw
  const prev = prevRaw ?? (value != null && change != null ? value - change : null)
  let changePercent = num(r.changePercent ?? r.change_percentage ?? r.changePercentage ?? r.pctChange)
  if (changePercent == null && change != null && prev) changePercent = (change / prev) * 100
  return {
    symbol: r.symbol,
    apiName: clean(r.name),
    value,
    prev,
    change,
    changePercent,
    volume: num(r.volume),
    high: num(r.high),
    low: num(r.low),
    sortOrder: r.sort_order ?? 999,
    logo: r.logo,
  }
}

// All indices: market-view first, /api/indices fills any missing fields
export async function getAllIndices() {
  const [mv, list] = await Promise.allSettled([get('/api/dashboard/market-view'), get('/api/indices?limit=50')])
  const mvRows = mv.status === 'fulfilled' ? mv.value || [] : []
  const listRows = list.status === 'fulfilled' ? list.value?.data || [] : []
  if (!mvRows.length && !listRows.length) throw new Error('Index list unavailable')
  const bySymbol = new Map()
  for (const r of listRows) bySymbol.set(r.symbol, { ...r })
  for (const r of mvRows) bySymbol.set(r.symbol, { ...(bySymbol.get(r.symbol) || {}), ...r })
  return [...bySymbol.values()].map(normIndex).sort((a, b) => a.sortOrder - b.sortOrder)
}

// Live prices for every stock in an index
export async function getTicker(index = 'KSE100') {
  const rows = await get(`/api/stocks/ticker?index=${index}`)
  return (rows || []).map((r) => ({
    symbol: r.symbol,
    curr: num(r.price),
    change: num(r.change),
    changePercent: num(r.changePercentage),
    volume: num(r.volume),
    isShariah: r.isShariah,
  }))
}

// { type, data: [...], pagination: {currentPage, totalPages, totalItems, ...} }
export function getPerformers(type = 'active', page = 1, limit = 20) {
  return get(`/api/dashboard/stock-performers?type=${type}&page=${page}&limit=${limit}`)
}

// { stockDividends: [...], pagination: {...} }
export function getDividends(page = 1, limit = 20) {
  return get(`/api/dashboard/stock-divindend?page=${page}&limit=${limit}`)
}

export async function getSectors() {
  const res = await get('/api/sectors/list')
  return (res?.data || []).map((r) => {
    const value = num(r.currentSv)
    const prev = num(r.previousSv)
    return {
      id: r.sectorId,
      name: clean(r.name),
      value,
      prev,
      // when previousSv is missing, the API's "change" equals the value itself, so don't trust it
      change: prev != null && value != null ? value - prev : null,
      changePercent: num(r.changePercent) ?? 0,
      raw: r,
    }
  })
}
