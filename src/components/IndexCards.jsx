import SpotlightCard from './reactbits/SpotlightCard'
import { Change, Sparkline, Skeleton } from './ui'
import { dirOf, fmtNum } from '../utils/format'

// One clickable card per index. Clicking selects it for the whole page.
export default function IndexCards({ summaries, selected, onSelect, theme }) {
  return (
    <div className="index-cards" role="tablist" aria-label="Choose an index">
      {summaries.map((s) => {
        const active = s.symbol === selected
        return (
          <SpotlightCard
            key={s.symbol}
            theme={theme}
            spotlightColor={theme === 'dark' ? '#3BE0A0' : '#0B8A5E'}
            intensity={0.12}
            spotlightSize={220}
            borderGlow={0.5}
            className={`index-card ${active ? 'index-card--active' : ''}`}
            style={{
              '--spotlight-card-surface': 'var(--surface)',
              '--spotlight-card-border': active ? 'var(--accent)' : 'var(--border)',
              '--spotlight-card-shadow': 'none',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              className="index-card__btn"
              onClick={() => onSelect(s.symbol)}
            >
              <span className="index-card__top">
                <span>
                  <span className="index-card__name">{s.name}</span>
                  <span className="index-card__desc">{s.desc}</span>
                </span>
                {s.live && <span className="tag">Live</span>}
              </span>
              {s.value == null ? (
                <Skeleton h={26} w="70%" />
              ) : (
                <span className="index-card__value mono">{fmtNum(s.value)}</span>
              )}
              <span className="index-card__bottom">
                <Change value={s.change} percent={s.changePercent} />
                <Sparkline values={s.spark} width={96} height={30} dir={dirOf(s.change)} />
              </span>
            </button>
          </SpotlightCard>
        )
      })}
    </div>
  )
}
