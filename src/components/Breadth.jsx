import { fmtCompact } from '../utils/format'
import { Skeleton } from './ui'

// How many stocks in the index went up / down / stayed flat today.
export default function Breadth({ companies, indexName }) {
  if (!companies) {
    return (
      <div className="card breadth">
        <Skeleton h={18} w="50%" />
        <Skeleton h={12} />
      </div>
    )
  }
  const up = companies.filter((c) => c.change > 0).length
  const down = companies.filter((c) => c.change < 0).length
  const flat = companies.length - up - down
  const total = companies.length || 1
  const volume = companies.reduce((sum, c) => sum + (c.volume || 0), 0)
  const mood = up > down * 1.3 ? 'Buyers in control' : down > up * 1.3 ? 'Sellers in control' : 'Mixed session'

  return (
    <div className="card breadth">
      <div className="breadth__head">
        <div>
          <p className="eyebrow">Market breadth · {indexName}</p>
          <p className="breadth__mood">{mood}</p>
        </div>
        <div className="breadth__vol">
          <span className="muted">Volume</span>
          <b className="mono">{fmtCompact(volume)}</b>
        </div>
      </div>
      <div className="breadth__bar" role="img" aria-label={`${up} up, ${down} down, ${flat} unchanged`}>
        <span className="bg-up" style={{ width: `${(up / total) * 100}%` }} />
        <span className="bg-flat" style={{ width: `${(flat / total) * 100}%` }} />
        <span className="bg-down" style={{ width: `${(down / total) * 100}%` }} />
      </div>
      <div className="breadth__legend">
        <span><i className="bg-up" /> {up} advancing</span>
        <span><i className="bg-flat" /> {flat} unchanged</span>
        <span><i className="bg-down" /> {down} declining</span>
      </div>
    </div>
  )
}
