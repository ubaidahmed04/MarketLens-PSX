import { useEffect, useState } from 'react'
import Header from './components/Header'
import TickerTape from './components/TickerTape'
import Dashboard from './pages/Dashboard'
import IndicesPage from './pages/IndicesPage'
import SectorsPage from './pages/SectorsPage'
import PerformersPage from './pages/PerformersPage'
import DividendsPage from './pages/DividendsPage'
import { usePolling } from './hooks/usePolling'
import { useTheme, useWatchlist } from './hooks/useWatchlist'
import { go, useRoute } from './hooks/useRoute'
import { getTicker } from './api/sarmaaya'
import { POLL_MS } from './config'

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const reducedMotion = useReducedMotion()
  const watch = useWatchlist()
  const route = useRoute()
  const [selected, setSelected] = useState('KSE100')
  const tickerQ = usePolling(() => getTicker('KSE100'), [])

  const openIndex = (symbol) => {
    setSelected(symbol)
    go('dashboard')
  }

  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Skip to content
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} route={route} reducedMotion={reducedMotion} />
      <TickerTape stocks={tickerQ.data} />

      <main id="main" className="container" tabIndex={-1}>
        {route === 'dashboard' && (
          <Dashboard theme={theme} reducedMotion={reducedMotion} watch={watch} selected={selected} setSelected={setSelected} />
        )}
        {route === 'indices' && <IndicesPage onOpenIndex={openIndex} />}
        {route === 'sectors' && <SectorsPage />}
        {route === 'performers' && <PerformersPage />}
        {route === 'dividends' && <DividendsPage />}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span><b>HedgePlay</b> Markets · PSX market data portal</span>
          <span className="muted small">
            Data: Sarmaaya API & HedgePlay feed. Refreshes every {POLL_MS / 1000}s; may be delayed. Not investment advice.
          </span>
        </div>
      </footer>
    </>
  )
}
