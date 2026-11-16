// Small shared building blocks used across the portal.
import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, Star, AlertTriangle } from 'lucide-react'
import { dirOf, fmtPct, fmtSigned } from '../utils/format'

export function Change({ value, percent, showValue = true }) {
  const dir = dirOf(value ?? percent)
  const Icon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus
  return (
    <span className={`chg chg--${dir}`}>
      <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
      {showValue && <span>{fmtSigned(value)}</span>}
      {percent !== undefined && <span className="chg__pct">{showValue ? `(${fmtPct(percent)})` : fmtPct(percent)}</span>}
    </span>
  )
}

export function PctPill({ value }) {
  return <span className={`pill pill--${dirOf(value)}`}>{fmtPct(value)}</span>
}

export function StockLogo({ symbol, logo, size = 28 }) {
  const [failed, setFailed] = useState(false)
  if (!logo || failed) {
    return (
      <span className="logo logo--text" style={{ width: size, height: size }} aria-hidden="true">
        {symbol.slice(0, 2)}
      </span>
    )
  }
  return (
    <img className="logo" src={logo} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} />
  )
}

export function StarButton({ active, onClick, symbol }) {
  return (
    <button
      type="button"
      className={`star ${active ? 'star--on' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      title={active ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star size={15} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}

// Where today's price sits between its 52-week low and high
export function RangeBar({ low, high, value }) {
  const pos = high > low ? Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100)) : 50
  return (
    <span className="range" title={`52W: ${low} – ${high}`}>
      <span className="range__track">
        <span className="range__fill" style={{ width: `${pos}%` }} />
        <span className="range__dot" style={{ left: `${pos}%` }} />
      </span>
    </span>
  )
}

export function Sparkline({ values, width = 120, height = 36, dir = 'up' }) {
  if (!values || values.length < 2) return <svg width={width} height={height} aria-hidden="true" />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 3 - ((v - min) / span) * (height - 6)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const id = `spark-${dir}-${Math.round(values[0])}-${values.length}`
  return (
    <svg className={`spark spark--${dir}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${line} ${width},${height}`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function SectionHead({ id, eyebrow, title, children }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
      </div>
      {children && <div className="section-head__aside">{children}</div>}
    </div>
  )
}

export function ErrorNote({ error, what }) {
  if (!error) return null
  return (
    <p className="error-note" role="status">
      <AlertTriangle size={15} aria-hidden="true" /> Couldn’t load {what} ({error.message}). Retrying automatically…
    </p>
  )
}

export function Skeleton({ h = 16, w = '100%', r = 8 }) {
  return <span className="skel" style={{ height: h, width: w, borderRadius: r }} />
}

export function PageHead({ eyebrow, title, lead, updatedAt, children }) {
  return (
    <div className="page-head">
      <div className="page-head__text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      <div className="page-head__aside">
        {children}
        {updatedAt && <span className="muted small mono">Updated {updatedAt.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })}</span>}
      </div>
    </div>
  )
}

export function Pagination({ page, totalPages, totalItems, onPage, label = 'items' }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <nav className="pager" aria-label="Pagination">
      <span className="muted small">
        Page <b className="mono">{page}</b> of <b className="mono">{totalPages}</b>
        {totalItems != null && <> · {totalItems.toLocaleString('en-US')} {label}</>}
      </span>
      <div className="pager__btns">
        <button type="button" className="pager__btn" onClick={() => onPage(1)} disabled={page <= 1}>First</button>
        <button type="button" className="pager__btn" onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</button>
        <button type="button" className="pager__btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    </nav>
  )
}
