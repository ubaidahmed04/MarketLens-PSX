import { useEffect, useState } from 'react'
import { DEFAULT_WATCHLIST } from '../config'

const KEY = 'hedgeplay-watchlist'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(saved) ? saved : DEFAULT_WATCHLIST
  } catch {
    return DEFAULT_WATCHLIST
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(symbols))
    } catch {
      /* storage blocked — watchlist still works for this session */
    }
  }, [symbols])

  const has = (s) => symbols.includes(s)
  const add = (s) => setSymbols((list) => (list.includes(s) ? list : [...list, s]))
  const remove = (s) => setSymbols((list) => list.filter((x) => x !== s))
  const toggle = (s) => (has(s) ? remove(s) : add(s))

  return { symbols, has, add, remove, toggle }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('hedgeplay-theme')
      if (saved) return saved
    } catch { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('hedgeplay-theme', theme) } catch { /* ignore */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
