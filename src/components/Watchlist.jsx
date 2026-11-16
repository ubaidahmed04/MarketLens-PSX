import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Change, RangeBar, StockLogo } from './ui'
import { fmtCompact, fmtNum } from '../utils/format'

export default function Watchlist({ watch, stocks, liveQuotes }) {
  const [query, setQuery] = useState('')
  const bySymbol = new Map((stocks || []).map((s) => [s.symbol, s]))
  const liveBySymbol = new Map((liveQuotes || []).map((q) => [q.symbol, q]))

  const addSymbol = (e) => {
    e.preventDefault()
    const sym = query.trim().toUpperCase()
    if (sym) watch.add(sym)
    setQuery('')
  }

  return (
    <div className="watch">
      <form className="watch__add" onSubmit={addSymbol}>
        <label htmlFor="watch-input" className="sr-only">Add a symbol</label>
        <input
          id="watch-input"
          className="input"
          list="symbol-options"
          placeholder="Add symbol, e.g. ENGROH"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <datalist id="symbol-options">
          {(stocks || []).filter((s) => !watch.has(s.symbol)).map((s) => (
            <option key={s.symbol} value={s.symbol} />
          ))}
        </datalist>
        <button type="submit" className="btn" disabled={!query.trim()}>
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </form>

      {watch.symbols.length === 0 && (
        <p className="empty card">Your watchlist is empty. Tap the star next to any stock, or add a symbol above.</p>
      )}

      <div className="watch__grid">
        {watch.symbols.map((sym) => {
          const base = bySymbol.get(sym)
          const live = liveBySymbol.get(sym)
          const s = base ? { ...base, ...Object.fromEntries(Object.entries(live || {}).filter(([, v]) => v != null)) } : live
          return (
            <article key={sym} className="card watch__card">
              <header className="watch__top">
                <StockLogo symbol={sym} logo={s?.logo} size={32} />
                <div className="watch__id">
                  <b>{sym}</b>
                  <span className="muted small">
                    {s?.isShariah ? 'Shariah compliant' : s ? 'Listed equity' : 'No data for this symbol'}
                    {live && ' · live'}
                  </span>
                </div>
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => watch.remove(sym)} aria-label={`Remove ${sym}`}>
                  <X size={15} />
                </button>
              </header>
              {s && (
                <>
                  <div className="watch__price">
                    <span className="mono">{fmtNum(s.curr)}</span>
                    <Change value={s.change} percent={s.changePercent} />
                  </div>
                  <div className="watch__meta">
                    <div>
                      <span className="muted small">Volume</span>
                      <b className="mono">{fmtCompact(s.volume)}</b>
                    </div>
                    <div>
                      <span className="muted small">Mkt cap</span>
                      <b className="mono">{fmtCompact(s.marketCap)}</b>
                    </div>
                  </div>
                  {s.low52 != null && (
                    <div className="watch__range">
                      <span className="muted small mono">{fmtNum(s.low52)}</span>
                      <RangeBar low={s.low52} high={s.high52} value={s.curr} />
                      <span className="muted small mono">{fmtNum(s.high52)}</span>
                    </div>
                  )}
                  {s.low52 != null && <p className="muted small center">52-week range</p>}
                </>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
