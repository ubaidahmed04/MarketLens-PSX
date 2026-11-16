import { useState } from 'react'
import { TrendingDown, TrendingUp, Activity } from 'lucide-react'
import { PctPill, StarButton, StockLogo, Skeleton, ErrorNote } from './ui'
import { fmtCompact, fmtNum } from '../utils/format'

const LISTS = [
  {
    key: 'adv',
    title: 'Top advancers',
    hint: 'Biggest % gain today',
    Icon: TrendingUp,
    pick: (list) => list.filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent),
  },
  {
    key: 'dec',
    title: 'Top decliners',
    hint: 'Biggest % loss today',
    Icon: TrendingDown,
    pick: (list) => list.filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent),
  },
  {
    key: 'act',
    title: 'Most active',
    hint: 'Highest shares traded',
    Icon: Activity,
    pick: (list) => [...list].sort((a, b) => b.volume - a.volume),
  },
]

function MoverList({ config, stocks, watch, count }) {
  const rows = stocks ? config.pick(stocks).slice(0, count) : null
  const { Icon } = config
  return (
    <div className={`card movers__col movers__col--${config.key}`}>
      <div className="movers__head">
        <span className="movers__icon"><Icon size={16} aria-hidden="true" /></span>
        <div>
          <h3>{config.title}</h3>
          <p className="muted small">{config.hint}</p>
        </div>
      </div>
      <ol className="movers__list">
        {!rows &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="movers__row"><Skeleton h={28} /></li>
          ))}
        {rows?.length === 0 && <li className="muted small empty">Nothing here yet today.</li>}
        {rows?.map((s, i) => (
          <li key={s.symbol} className="movers__row">
            <span className="movers__rank mono">{i + 1}</span>
            <StockLogo symbol={s.symbol} logo={s.logo} size={26} />
            <span className="movers__sym">
              <b>{s.symbol}</b>
              <span className="muted small mono">Vol {fmtCompact(s.volume)}</span>
            </span>
            <span className="movers__price mono">{fmtNum(s.curr)}</span>
            <PctPill value={s.changePercent} />
            <StarButton symbol={s.symbol} active={watch.has(s.symbol)} onClick={() => watch.toggle(s.symbol)} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Movers({ stocks, source, watch, error }) {
  const [count, setCount] = useState(10)
  return (
    <>
      <div className="movers">
        {LISTS.map((c) => (
          <MoverList key={c.key} config={c} stocks={stocks} watch={watch} count={count} />
        ))}
      </div>
      <div className="movers__foot">
        <span className="muted small">Ranked from {source === 'ALLSHR' ? 'all listed shares' : `${source} constituents`}.</span>
        <button type="button" className="link-btn" onClick={() => setCount((c) => (c === 10 ? 20 : 10))}>
          {count === 10 ? 'Show top 20' : 'Show top 10'}
        </button>
      </div>
      <ErrorNote error={error} what="market movers" />
    </>
  )
}
