import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { ErrorNote, PctPill, RangeBar, StarButton, StockLogo, Skeleton } from './ui'
import { dirOf, fmtCompact, fmtNum, fmtSigned } from '../utils/format'

const COLUMNS = [
  ['symbol', 'Symbol', 'left'],
  ['curr', 'Price'],
  ['change', 'Change'],
  ['changePercent', 'Change %'],
  ['volume', 'Volume'],
  ['points', 'Index pts'],
  ['weights', 'Weight'],
  ['range', '52W range', 'center'],
  ['marketCap', 'Mkt cap'],
]

const FILTERS = [
  ['all', 'All', () => true],
  ['up', 'Gainers', (s) => s.change > 0],
  ['down', 'Losers', (s) => s.change < 0],
  ['shariah', 'Shariah', (s) => s.isShariah],
]

export default function StocksTable({ companies, watch, error, indexName }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'points', dir: 'desc' })

  const rows = useMemo(() => {
    if (!companies) return null
    const test = FILTERS.find(([k]) => k === filter)[2]
    const q = query.trim().toUpperCase()
    const list = companies.filter((s) => test(s) && (!q || s.symbol.includes(q)))
    const key = sort.key === 'range' ? 'curr' : sort.key
    return list.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av ?? 0) - (bv ?? 0)
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [companies, filter, query, sort])

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  return (
    <div className="card table-card">
      <div className="table-tools">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search symbol</span>
          <input className="input input--bare" placeholder={`Search ${indexName} stocks`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="seg" role="group" aria-label="Filter stocks">
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" className={`seg__btn ${filter === key ? 'is-on' : ''}`} onClick={() => setFilter(key)} aria-pressed={filter === key}>
              {label}
            </button>
          ))}
        </div>
        <span className="muted small">{rows ? `${rows.length} stocks` : ''}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th aria-label="Watchlist" />
              {COLUMNS.map(([key, label, align]) => (
                <th key={key} className={align ? `ta-${align}` : ''} aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="th-btn" onClick={() => toggleSort(key)}>
                    {label}
                    {sort.key === key && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows &&
              Array.from({ length: 8 }, (_, i) => (
                <tr key={i}><td colSpan={COLUMNS.length + 1}><Skeleton h={22} /></td></tr>
              ))}
            {rows?.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 1} className="empty">No stocks match “{query}”.</td></tr>
            )}
            {rows?.map((s) => (
              <tr key={s.symbol}>
                <td><StarButton symbol={s.symbol} active={watch.has(s.symbol)} onClick={() => watch.toggle(s.symbol)} /></td>
                <td className="ta-left">
                  <span className="sym-cell">
                    <StockLogo symbol={s.symbol} logo={s.logo} size={24} />
                    <b>{s.symbol}</b>
                    {s.isShariah && <span className="tag tag--soft" title="Shariah compliant">S</span>}
                  </span>
                </td>
                <td className="mono">{fmtNum(s.curr)}</td>
                <td className={`mono txt--${dirOf(s.change)}`}>{fmtSigned(s.change)}</td>
                <td><PctPill value={s.changePercent} /></td>
                <td className="mono">{fmtCompact(s.volume)}</td>
                <td className={`mono txt--${dirOf(s.points)}`}>{fmtSigned(s.points)}</td>
                <td className="mono">{fmtNum(s.weights)}%</td>
                <td className="ta-center"><RangeBar low={s.low52} high={s.high52} value={s.curr} /></td>
                <td className="mono">{fmtCompact(s.marketCap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ErrorNote error={error} what="stocks" />
    </div>
  )
}
