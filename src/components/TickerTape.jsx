import { fmtNum, fmtPct, dirOf } from '../utils/format'

// Scrolling strip of the day's biggest movers. Pauses on hover.
export default function TickerTape({ stocks }) {
  if (!stocks?.length) return <div className="ticker ticker--empty" />
  const top = [...stocks]
    .filter((s) => s.volume > 0)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 24)
  const row = top.map((s) => (
    <span className="ticker__item" key={s.symbol}>
      <b>{s.symbol}</b>
      <span className="mono">{fmtNum(s.curr)}</span>
      <span className={`ticker__chg ticker__chg--${dirOf(s.changePercent)}`}>{fmtPct(s.changePercent)}</span>
    </span>
  ))
  return (
    <div className="ticker" aria-label="Biggest movers today">
      <div className="ticker__track">
        <div className="ticker__group">{row}</div>
        <div className="ticker__group" aria-hidden="true">{row}</div>
      </div>
    </div>
  )
}
