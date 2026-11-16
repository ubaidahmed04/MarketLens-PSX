import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { usePolling } from '../hooks/usePolling'
import { getDividends } from '../api/sarmaaya'
import { ErrorNote, PageHead, Pagination, Skeleton } from '../components/ui'
import { fmtAny, humanize, titleCase } from '../utils/format'

// Columns shown first, in this order. Every other field the API sends is added after them automatically.
const FIRST = ['symbol', 'name', 'type', 'facevalue']
const HIDE = new Set(['id', '_id', 'logo', 'company_id', 'companyId', 'created_at', 'updated_at', 'createdAt', 'updatedAt'])
const LABELS = { facevalue: 'Face value' }

export default function DividendsPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  // Payouts don't change minute to minute, so no auto-refresh here (interval 0)
  const { data, error, loading } = usePolling(() => getDividends(page, 20), [page], 0)

  const all = data?.stockDividends
  const columns = useMemo(() => {
    if (!all?.length) return FIRST
    const keys = new Set()
    all.forEach((r) => Object.entries(r).forEach(([k, v]) => { if (!HIDE.has(k) && (v === null || typeof v !== 'object')) keys.add(k) }))
    return [...FIRST.filter((k) => keys.has(k)), ...[...keys].filter((k) => !FIRST.includes(k))]
  }, [all])

  const types = useMemo(() => ['all', ...new Set((all || []).map((r) => r.type).filter(Boolean))], [all])
  const rows = all?.filter((r) => {
    const q = query.trim().toLowerCase()
    return (type === 'all' || r.type === type) && (!q || `${r.symbol} ${r.name}`.toLowerCase().includes(q))
  })
  const p = data?.pagination

  return (
    <div className="page">
      <PageHead
        eyebrow="Corporate actions"
        title="Dividends & payouts"
        lead="Announced cash dividends, bonus shares and other payouts by listed companies, newest first."
      />

      <div className={`card table-card ${loading && all ? 'is-loading' : ''}`}>
        <div className="table-tools">
          <label className="search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search this page</span>
            <input className="input input--bare" placeholder="Search symbol or company (this page)" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {types.length > 2 && (
            <div className="seg" role="group" aria-label="Payout type">
              {types.map((t) => (
                <button key={t} type="button" className={`seg__btn ${type === t ? 'is-on' : ''}`} aria-pressed={type === t} onClick={() => setType(t)}>
                  {t === 'all' ? 'All' : titleCase(t)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="table-wrap table-wrap--tall">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c, i) => (
                  <th key={c} className={i < 3 ? 'ta-left' : ''}>{LABELS[c] || humanize(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows && Array.from({ length: 10 }, (_, i) => (
                <tr key={i}><td colSpan={columns.length}><Skeleton h={22} /></td></tr>
              ))}
              {rows?.length === 0 && <tr><td colSpan={columns.length} className="empty">Nothing on this page matches.</td></tr>}
              {rows?.map((r, i) => (
                <tr key={`${r.symbol}-${i}`}>
                  {columns.map((c, ci) => (
                    <td key={c} className={ci < 3 ? 'ta-left' : 'mono'}>
                      {c === 'symbol' ? <b>{r.symbol}</b>
                        : c === 'type' ? <span className={`tag tag--type tag--${String(r.type).toLowerCase()}`}>{titleCase(r.type)}</span>
                        : c === 'name' ? <span className="clamp">{r.name}</span>
                        : fmtAny(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={p?.totalPages} totalItems={p?.totalItems} onPage={(n) => { setPage(n); setType('all') }} label="announcements" />
        <ErrorNote error={error} what="dividends" />
      </div>
    </div>
  )
}
