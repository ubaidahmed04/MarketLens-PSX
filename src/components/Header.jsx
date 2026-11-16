import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import ShinyText from './reactbits/ShinyText'
import { fmtTime, marketStatus } from '../utils/format'
import { ROUTES, linkTo } from '../hooks/useRoute'

export default function Header({ theme, onToggleTheme, route, reducedMotion }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const status = marketStatus(now)

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <a className="brand" href="#/" aria-label="HedgePlay Markets home">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="var(--accent)" />
            <path d="M7 21l6-6 4 4 8-9" stroke="var(--accent-ink)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand__name">HedgePlay</span>
          <span className="brand__tag">Markets</span>
        </a>

        <nav className="nav" aria-label="Screens">
          {ROUTES.map(([id, label]) => (
            <a key={id} href={linkTo(id)} className={`nav__link ${route === id ? 'is-active' : ''}`} aria-current={route === id ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <div className="topbar__right">
          <span className={`status ${status.open ? 'status--open' : ''}`}>
            <span className="status__dot" aria-hidden="true" />
            {status.open ? (
              <ShinyText
                text="LIVE"
                color={theme === 'dark' ? '#3BE0A0' : '#0B8A5E'}
                shineColor={theme === 'dark' ? '#ffffff' : '#bff5df'}
                speed={2.4}
                disabled={reducedMotion}
              />
            ) : (
              <span>Closed</span>
            )}
            <span className="status__time">{fmtTime(now)} PKT</span>
          </span>
          <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle light / dark theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  )
}
