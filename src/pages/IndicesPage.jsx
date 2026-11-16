import { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { usePolling } from '../hooks/usePolling'
import { getAllIndices } from '../api/sarmaaya'
import { Change, ErrorNote, PageHead, PctPill, Skeleton } from '../components/ui'
import { dirOf, fmtCompact, fmtNum, fmtPct, indexMeta } from '../utils/format'

function Highlight({ label, row, value, kind }) {
  return (
    <div className="card highlight">
      <p className="eyebrow">{label}</p>
      {row ? (
        <>
          <p className="highlight__name">{indexMeta(row.symbol, row.apiName).name}</p>
          <p className={`highlight__value mono txt--${kind}`}>{value}</p>
        </>
      ) : (
        <Skeleton h={40} />
      )}
    </div>
  )
}

export default function IndicesPage({ onOpenIndex }) {
  const { data, error, updatedAt } = usePolling(getAllIndices, [])
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    if (!data) return null
    const q = query.trim().toLowerCase()
    return data
      .map((r) => ({ ...r, meta: indexMeta(r.symbol, r.apiName) }))
      .filter((r) => !q || r.symbol.toLowerCase().includes(q) || r.meta.name.toLowerCase().includes(q))
  }, [data, query])

  const withPct = (data || []).filter((r) => r.changePercent != null)
  const best = [...withPct].sort((a, b) => b.changePercent - a.changePercent)[0]
  const worst = [...withPct].sort((a, b) => a.changePercent - b.changePercent)[0]
  const busiest = [...(data || [])].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0]
  const up = withPct.filter((r) => r.changePercent > 0).length
  const showHL = data?.some((r) => r.high != null)

  return (
    <div className="page">
      <PageHead
        eyebrow="Pakistan Stock Exchange"
        title="All indices"
        lead={data ? `${up} of ${withPct.length} indices are up today. Tap any index to open its chart and constituents.` : 'Every PSX index in one place.'}
        updatedAt={updatedAt}
      />

      <div className="highlights">
        <Highlight label="Best today" row={best} value={best && fmtPct(best.changePercent)} kind={dirOf(best?.changePercent)} />
        <Highlight label="Weakest today" row={worst} value={worst && fmtPct(worst.changePercent)} kind={dirOf(worst?.changePercent)} />
        <Highlight label="Highest volume" row={busiest} value={busiest && fmtCompact(busiest.volume)} kind="flat" />
      </div>

      <div className="card table-card">
        <div className="table-tools">
          <label className="search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search indices</span>
            <input className="input input--bare" placeholder="Search index name or symbol" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <span className="muted small">{rows ? `${rows.length} indices` : ''}</span>
        </div>
        <div className="table-wrap table-wrap--tall">
          <table className="table">
            <thead>
              <tr>
                <th className="ta-left">Index</th>
                <th>Value</th>
                <th>Change</th>
                <th>Change %</th>
                {showHL && <th>Day low – high</th>}
                <th>Volume</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {!rows && Array.from({ length: 8 }, (_, i) => (
                <tr key={i}><td colSpan={7}><Skeleton h={22} /></td></tr>
              ))}
              {rows?.length === 0 && <tr><td colSpan={7} className="empty">No index matches “{query}”.</td></tr>}
              {rows?.map((r) => (
                <tr key={r.symbol} className="row-link" onClick={() => onOpenIndex(r.symbol)}>
                  <td className="ta-left">
                    <button type="button" className="row-btn" onClick={(e) => { e.stopPropagation(); onOpenIndex(r.symbol) }}>
                      <b>{r.meta.name}</b>
                      <span className="muted small">{r.symbol}{r.meta.desc ? ` · ${r.meta.desc}` : ''}</span>
                    </button>
                  </td>
                  <td className="mono">{fmtNum(r.value)}</td>
                  <td><Change value={r.change} /></td>
                  <td><PctPill value={r.changePercent} /></td>
                  {showHL && <td className="mono muted">{fmtNum(r.low)} – {fmtNum(r.high)}</td>}
                  <td className="mono">{fmtCompact(r.volume)}</td>
                  <td className="muted"><ChevronRight size={16} aria-hidden="true" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ErrorNote error={error} what="indices" />
      </div>
    </div>
  )
}
