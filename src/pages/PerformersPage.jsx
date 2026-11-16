import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getPerformers } from '../api/sarmaaya'
import { PERFORMER_TYPES } from '../config'
import { ErrorNote, PageHead, Pagination, PctPill, Skeleton, StockLogo } from '../components/ui'
import { dirOf, fmtCompact, fmtFullDate, fmtNum, fmtSigned } from '../utils/format'

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v))

// The endpoint can return stocks or mutual funds — normalise both
function normalise(r) {
  return {
    key: r.fund_id || r.symbol,
    symbol: r.symbol,
    name: r.name,
    logo: r.logo,
    isFund: r.nav !== undefined,
    price: num(r.nav ?? r.price ?? r.curr ?? r.close),
    change: num(r.change),
    changePercent: num(r.change_percentage ?? r.changePercent ?? r.changePercentage),
    volume: num(r.volume),
    aum: num(r.aum),
    risk: r.risk_profile,
    asOf: r.nav_date || r.date,
    isShariah: r.isShariah,
  }
}

export default function PerformersPage() {
  const [type, setType] = useState(PERFORMER_TYPES[0][0])
  const [page, setPage] = useState(1)
  const { data, error, loading, updatedAt } = usePolling(() => getPerformers(type, page, 20), [type, page])

  const rows = data?.data?.map(normalise)
  const isFund = rows?.some((r) => r.isFund)
  const p = data?.pagination
  const cols = isFund ? 7 : 5

  return (
    <div className="page">
      <PageHead
        eyebrow="Market performers"
        title="Top performers"
        lead={isFund ? 'These rows are mutual funds, ranked by NAV change. AUM = assets under management.' : 'Stocks ranked by today’s trading.'}
        updatedAt={updatedAt}
      >
        <div className="seg" role="group" aria-label="Performer type">
          {PERFORMER_TYPES.map(([k, label]) => (
            <button key={k} type="button" className={`seg__btn ${type === k ? 'is-on' : ''}`} aria-pressed={type === k} onClick={() => { setType(k); setPage(1) }}>
              {label}
            </button>
          ))}
        </div>
      </PageHead>

      <div className={`card table-card ${loading && rows ? 'is-loading' : ''}`}>
        <div className="table-wrap table-wrap--tall">
          <table className="table">
            <thead>
              <tr>
                <th className="ta-left">#</th>
                <th className="ta-left">{isFund ? 'Fund' : 'Stock'}</th>
                <th>{isFund ? 'NAV' : 'Price'}</th>
                <th>Change</th>
                <th>Change %</th>
                {isFund ? (
                  <>
                    <th>AUM</th>
                    <th className="ta-left">Risk</th>
                    <th>NAV date</th>
                  </>
                ) : (
                  <th>Volume</th>
                )}
              </tr>
            </thead>
            <tbody>
              {!rows && Array.from({ length: 10 }, (_, i) => (
                <tr key={i}><td colSpan={cols + 1}><Skeleton h={22} /></td></tr>
              ))}
              {rows?.length === 0 && <tr><td colSpan={cols + 1} className="empty">No data for this list right now.</td></tr>}
              {rows?.map((r, i) => (
                <tr key={r.key}>
                  <td className="ta-left mono muted">{(page - 1) * 20 + i + 1}</td>
                  <td className="ta-left">
                    <span className="sym-cell">
                      <StockLogo symbol={r.symbol} logo={r.logo} size={26} />
                      <span className="name-cell">
                        <b>{r.symbol}</b>
                        <span className="muted small">{r.name}</span>
                      </span>
                      {r.isShariah && <span className="tag tag--soft" title="Shariah compliant">S</span>}
                    </span>
                  </td>
                  <td className="mono">{fmtNum(r.price)}</td>
                  <td className={`mono txt--${dirOf(r.change)}`}>{fmtSigned(r.change)}</td>
                  <td><PctPill value={r.changePercent} /></td>
                  {isFund ? (
                    <>
                      <td className="mono">{fmtCompact(r.aum)}</td>
                      <td className="ta-left">{r.risk ? <span className={`risk risk--${String(r.risk).toLowerCase()}`}>{r.risk}</span> : '—'}</td>
                      <td className="mono muted">{r.asOf ? fmtFullDate(r.asOf) : '—'}</td>
                    </>
                  ) : (
                    <td className="mono">{fmtCompact(r.volume)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={p?.totalPages} totalItems={p?.totalItems} onPage={setPage} label={isFund ? 'funds' : 'stocks'} />
        <ErrorNote error={error} what="performers" />
      </div>
    </div>
  )
}
