import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CountUp from './reactbits/CountUp'
import { Change, ErrorNote, Skeleton } from './ui'
import { dirOf, fmtDate, fmtNum, fmtPct } from '../utils/format'

const RANGES = [
  [7, '1W'],
  [30, '1M'],
  [90, '3M'],
  [180, '6M'],
  [365, '1Y'],
]

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="chart-tip">
      <span>{fmtDate(p.date)}</span>
      <b className="mono">{fmtNum(p.price)}</b>
    </div>
  )
}

export default function IndexHero({ index, summary, history, range, onRange, error, reducedMotion, colors }) {
  const list = history || []
  const first = list[0]?.price
  const last = list[list.length - 1]?.price
  const periodChange = first && last ? ((last - first) / first) * 100 : null
  const high = list.length ? Math.max(...list.map((d) => d.price)) : null
  const low = list.length ? Math.min(...list.map((d) => d.price)) : null
  const dir = dirOf(periodChange)
  const lineColor = dir === 'down' ? colors.down : colors.up
  const rangeLabel = RANGES.find(([d]) => d === range)?.[1]

  return (
    <div className="hero card">
      <div className="hero__head">
        <div>
          <p className="eyebrow">Pakistan Stock Exchange · {index.desc}</p>
          <h1 className="hero__title">{index.name}</h1>
        </div>
        <div className="seg" role="group" aria-label="Chart range">
          {RANGES.map(([d, label]) => (
            <button key={d} type="button" className={`seg__btn ${range === d ? 'is-on' : ''}`} onClick={() => onRange(d)} aria-pressed={range === d}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hero__value">
        {summary?.value == null ? (
          <Skeleton h={56} w={320} />
        ) : (
          <span className="hero__number mono">
            <CountUp to={summary.value} from={summary.prev ?? summary.value} decimals={2} separator="," duration={reducedMotion ? 0 : 1.1} trigger="load" />
          </span>
        )}
        <div className="hero__change">
          <Change value={summary?.change} percent={summary?.changePercent} />
          <span className="muted">today vs previous close</span>
        </div>
      </div>

      <div className="hero__chart">
        {list.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={list} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="heroFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: colors.muted, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={32} />
              <YAxis
                domain={['auto', 'auto']}
                orientation="right"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                tick={{ fill: colors.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTip />} cursor={{ stroke: colors.muted, strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#heroFill)"
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Skeleton h="100%" r={14} />
        )}
      </div>
      <ErrorNote error={error} what="index history" />

      <dl className="stats">
        <div>
          <dt>{rangeLabel} change</dt>
          <dd className={`mono txt--${dir}`}>{fmtPct(periodChange)}</dd>
        </div>
        <div>
          <dt>{rangeLabel} high</dt>
          <dd className="mono">{fmtNum(high)}</dd>
        </div>
        <div>
          <dt>{rangeLabel} low</dt>
          <dd className="mono">{fmtNum(low)}</dd>
        </div>
        <div>
          <dt>Previous close</dt>
          <dd className="mono">{fmtNum(summary?.prev)}</dd>
        </div>
      </dl>
    </div>
  )
}
