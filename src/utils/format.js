import { MARKET_HOURS, INDEX_LABELS } from '../config'

const isNum = (n) => n !== null && n !== undefined && !Number.isNaN(Number(n))

export function fmtNum(n, digits = 2) {
  if (!isNum(n)) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function fmtCompact(n) {
  if (!isNum(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}

export const fmtSigned = (n, d = 2) => (isNum(n) ? `${n > 0 ? '+' : ''}${fmtNum(n, d)}` : '—')
export const fmtPct = (n) => (isNum(n) ? `${n > 0 ? '+' : ''}${fmtNum(n, 2)}%` : '—')
export const dirOf = (n) => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat')

export const fmtTime = (d) =>
  d ? d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Karachi' }) : '—'

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' })

// Is PSX open right now? Uses MARKET_HOURS in config.js (Pakistan time).
export function marketStatus(now = new Date()) {
  const pk = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
  const minutes = pk.getHours() * 60 + pk.getMinutes()
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
  const sessions = MARKET_HOURS[pk.getDay()] || []
  const open = sessions.some(([a, b]) => minutes >= toMin(a) && minutes < toMin(b))
  return { open, label: open ? 'Market open' : 'Market closed' }
}

export function indexMeta(symbol, apiName) {
  const label = INDEX_LABELS[symbol]
  return { symbol, name: label?.[0] || apiName || symbol, desc: label?.[1] || apiName || '' }
}

export const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/(^|[\s/&(-])([a-z])/g, (m, a, b) => a + b.toUpperCase())

export const humanize = (key) =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())

export const isDateString = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)

export const fmtFullDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' })

// Format any unknown API value for display
export function fmtAny(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return Number.isInteger(v) ? v.toLocaleString('en-US') : fmtNum(v)
  if (isDateString(v)) return fmtFullDate(v)
  return String(v)
}
