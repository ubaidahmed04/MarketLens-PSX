import { useMemo, useState } from 'react'
import IndexCards from '../components/IndexCards'
import IndexHero from '../components/IndexHero'
import Breadth from '../components/Breadth'
import Movers from '../components/Movers'
import Contributors from '../components/Contributors'
import Watchlist from '../components/Watchlist'
import StocksTable from '../components/StocksTable'
import { SectionHead } from '../components/ui'
import { usePolling } from '../hooks/usePolling'
import { getAllIndices, getCompanies, getContributors, getPriceHistory } from '../api/sarmaaya'
import { getLiveIndices, getLiveQuotes } from '../api/lineup'
import { INDICES, MOVERS_UNIVERSE, POLL_MS } from '../config'
import { CHART_COLORS } from '../theme'
import { indexMeta } from '../utils/format'

// Try ALLSHR first (all shares), fall back to KSE100 if that fails.
async function loadUniverse() {
  for (const u of MOVERS_UNIVERSE) {
    try {
      const list = await getCompanies(u.symbol, u.limit)
      if (list.length) return { list, source: u.symbol }
    } catch {
      /* try next */
    }
  }
  throw new Error('No stock list available')
}

export default function Dashboard({ theme, reducedMotion, watch, selected, setSelected }) {
  const [range, setRange] = useState(30)
  const allQ = usePolling(getAllIndices, [])
  const apiRow = allQ.data?.find((r) => r.symbol === selected)
  const index = INDICES.find((i) => i.symbol === selected) || indexMeta(selected, apiRow?.apiName)

  // ── Data (each refreshes on its own every POLL_MS) ──
  const indicesQ = usePolling(() => Promise.all(INDICES.map((i) => getPriceHistory(i.symbol, 30).catch(() => []))), [])
  const liveIdxQ = usePolling(() => getLiveIndices(), [])
  const historyQ = usePolling(() => getPriceHistory(selected, range), [selected, range], POLL_MS * 2)
  const companiesQ = usePolling(() => getCompanies(selected, 100), [selected])
  const contribQ = usePolling(() => getContributors(selected), [selected])
  const universeQ = usePolling(loadUniverse, [])
  const quotesQ = usePolling(() => getLiveQuotes(watch.symbols), [watch.symbols.join(',')])

  // Index card numbers: Sarmaaya history, overridden by your live API when available
  const summaries = useMemo(
    () =>
      INDICES.map((meta, i) => {
        const hist = indicesQ.data?.[i] || []
        const last = hist[hist.length - 1]?.price ?? null
        const prev = hist[hist.length - 2]?.price ?? null
        const live = liveIdxQ.data?.find((x) => x.symbol === meta.symbol)
        const mv = allQ.data?.find((x) => x.symbol === meta.symbol)
        const value = live?.value ?? mv?.value ?? last
        const change = live?.change ?? mv?.change ?? (last != null && prev != null ? last - prev : null)
        const base = value != null && change != null ? value - change : prev
        const changePercent = live?.changePercent ?? mv?.changePercent ?? (base ? (change / base) * 100 : null)
        return { ...meta, value, prev: base, change, changePercent, spark: hist.map((d) => d.price), live: !!live }
      }),
    [indicesQ.data, liveIdxQ.data, allQ.data],
  )
  // Selected index may be outside the 4 cards (opened from the Indices screen)
  const summary = summaries.find((s) => s.symbol === selected) || (apiRow && { ...index, ...apiRow })

  const universe = universeQ.data?.list
  const colors = CHART_COLORS[theme]

  return (
    <>
        <section id="overview" className="section section--first" aria-label="Index overview">
          <IndexCards summaries={summaries} selected={selected} onSelect={setSelected} theme={theme} />
          <div className="overview">
            <IndexHero
              index={index}
              summary={summary}
              history={historyQ.data}
              range={range}
              onRange={setRange}
              error={historyQ.error}
              reducedMotion={reducedMotion}
              colors={colors}
            />
            <aside className="overview__side">
              <Breadth companies={companiesQ.data} indexName={index.name} />
              <div className="card explainer">
                <p className="eyebrow">How to read this</p>
                <ul>
                  <li><b className="txt--up">Green</b> means the price is higher than yesterday’s close, <b className="txt--down">red</b> means lower.</li>
                  <li><b>Index points</b> show how much a stock moved the {index.name} today.</li>
                  <li>The <b>52W bar</b> shows where today’s price sits between its 1-year low and high.</li>
                  <li>Tap <b>★</b> on any stock to pin it to your watchlist.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section id="movers" className="section" aria-labelledby="movers-h">
          <SectionHead id="movers-h" eyebrow="Today’s session" title="Who’s moving the market" />
          <Movers stocks={universe} source={universeQ.data?.source} watch={watch} error={universeQ.error} />
        </section>

        <section id="contributors" className="section" aria-labelledby="contrib-h">
          <SectionHead id="contrib-h" eyebrow={`${index.name} · index points`} title="What’s driving the index" />
          <Contributors data={contribQ.data} error={contribQ.error} indexName={index.name} />
        </section>

        <section id="watchlist" className="section" aria-labelledby="watch-h">
          <SectionHead id="watch-h" eyebrow="Saved on this device" title="Your watchlist">
            <span className="muted small">{watch.symbols.length} symbols</span>
          </SectionHead>
          <Watchlist watch={watch} stocks={universe} liveQuotes={quotesQ.data} />
        </section>

        <section id="stocks" className="section" aria-labelledby="stocks-h">
          <SectionHead id="stocks-h" eyebrow={`${index.name} constituents`} title="All stocks in the index">
            <div className="seg" role="group" aria-label="Choose index">
              {INDICES.map((i) => (
                <button key={i.symbol} type="button" className={`seg__btn ${selected === i.symbol ? 'is-on' : ''}`} onClick={() => setSelected(i.symbol)} aria-pressed={selected === i.symbol}>
                  {i.name}
                </button>
              ))}
            </div>
          </SectionHead>
          <StocksTable companies={companiesQ.data} watch={watch} error={companiesQ.error} indexName={index.name} />
        </section>
    </>
  )
}
