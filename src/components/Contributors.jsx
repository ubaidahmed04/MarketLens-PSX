import { ErrorNote, Skeleton } from './ui'
import { fmtCompact, fmtNum } from '../utils/format'

// Which stocks pushed the index up, and which pulled it down — in index points.
function Side({ title, rows, max, kind }) {
  return (
    <div className="contrib__side">
      <h3 className={`contrib__title txt--${kind}`}>{title}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.name} className="contrib__row">
            <span className="contrib__sym">{r.name}</span>
            <span className="contrib__track">
              <span className={`contrib__bar bg-${kind}`} style={{ width: `${(Math.abs(r.indexpoints) / max) * 100}%` }} />
            </span>
            <span className={`contrib__pts mono txt--${kind}`}>
              {r.indexpoints > 0 ? '+' : ''}
              {fmtNum(r.indexpoints)}
            </span>
            <span className="contrib__vol muted small mono">{fmtCompact(r.volume)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Contributors({ data, error, indexName }) {
  if (!data) {
    return (
      <div className="card contrib">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={18} />)}
        <ErrorNote error={error} what="point contributors" />
      </div>
    )
  }
  const pos = data.positiveData || []
  const neg = data.negativeData || []
  const max = Math.max(1, ...pos.map((r) => Math.abs(r.indexpoints)), ...neg.map((r) => Math.abs(r.indexpoints)))
  const added = pos.reduce((s, r) => s + r.indexpoints, 0)
  const removed = neg.reduce((s, r) => s + r.indexpoints, 0)

  return (
    <div className="card contrib">
      <p className="contrib__summary">
        Top {pos.length} lifters added <b className="txt--up mono">+{fmtNum(added)}</b> points to the {indexName}, while the top{' '}
        {neg.length} draggers took away <b className="txt--down mono">{fmtNum(removed)}</b>. Net effect of these stocks:{' '}
        <b className={`mono txt--${added + removed >= 0 ? 'up' : 'down'}`}>
          {added + removed >= 0 ? '+' : ''}
          {fmtNum(added + removed)} pts
        </b>
        .
      </p>
      <div className="contrib__grid">
        <Side title="Lifting the index" rows={pos} max={max} kind="up" />
        <Side title="Dragging the index" rows={neg} max={max} kind="down" />
      </div>
      <ErrorNote error={error} what="point contributors" />
    </div>
  )
}
