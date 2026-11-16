import { useMemo, useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getSectors } from '../api/sarmaaya'
import { ErrorNote, PageHead, Skeleton } from '../components/ui'
import { dirOf, fmtNum, fmtPct, titleCase } from '../utils/format'

const SORTS = [
  ['change', 'Biggest move'],
  ['up', 'Top gainers'],
  ['down', 'Top losers'],
  ['name', 'A–Z'],
]

// Tile color strength grows with the size of the move (capped at ±3%)
function tileStyle(pct) {
  const strength = Math.min(1, Math.abs(pct) / 3)
  if (!pct) return {}
  const color = pct > 0 ? 'var(--up)' : 'var(--down)'
  return {
    background: `color-mix(in srgb, ${color} ${Math.round(6 + strength * 26)}%, var(--surface))`,
    borderColor: `color-mix(in srgb, ${color} ${Math.round(14 + strength * 40)}%, transparent)`,
  }
}

export default function SectorsPage() {
  const { data, error, updatedAt } = usePolling(getSectors, [])
  const [sort, setSort] = useState('change')

  const rows = useMemo(() => {
    if (!data) return null
    const list = [...data]
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'up') list.sort((a, b) => b.changePercent - a.changePercent)
    if (sort === 'down') list.sort((a, b) => a.changePercent - b.changePercent)
    if (sort === 'change') list.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    return list
  }, [data, sort])

  const up = data?.filter((s) => s.changePercent > 0).length ?? 0
  const down = data?.filter((s) => s.changePercent < 0).length ?? 0
  const top = data && [...data].sort((a, b) => b.changePercent - a.changePercent)[0]
  const bottom = data && [...data].sort((a, b) => a.changePercent - b.changePercent)[0]

  return (
    <div className="page">
      <PageHead
        eyebrow="Sector performance"
        title="Sectors heatmap"
        lead={
          data
            ? `${up} sectors up, ${down} down. Strongest: ${titleCase(top?.name)} (${fmtPct(top?.changePercent)}). Weakest: ${titleCase(bottom?.name)} (${fmtPct(bottom?.changePercent)}).`
            : 'How each PSX sector is doing today. Darker color = bigger move.'
        }
        updatedAt={updatedAt}
      >
        <div className="seg" role="group" aria-label="Sort sectors">
          {SORTS.map(([k, label]) => (
            <button key={k} type="button" className={`seg__btn ${sort === k ? 'is-on' : ''}`} onClick={() => setSort(k)} aria-pressed={sort === k}>
              {label}
            </button>
          ))}
        </div>
      </PageHead>

      <div className="heat">
        {!rows && Array.from({ length: 12 }, (_, i) => <Skeleton key={i} h={108} r={16} />)}
        {rows?.map((s) => (
          <article key={s.id} className="heat__tile" style={tileStyle(s.changePercent)}>
            <h3 className="heat__name">{titleCase(s.name)}</h3>
            <div className="heat__bottom">
              <span className={`heat__pct mono txt--${dirOf(s.changePercent)}`}>{fmtPct(s.changePercent)}</span>
              <span className="muted small mono" title="Sector value">{fmtNum(s.value)}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="heat-legend muted small">
        <span className="heat-legend__bar" aria-hidden="true" />
        <span>−3% or worse</span>
        <span>0%</span>
        <span>+3% or better</span>
      </div>
      <ErrorNote error={error} what="sectors" />
    </div>
  )
}
