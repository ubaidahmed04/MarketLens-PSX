import { useEffect, useState } from 'react'

// Tiny hash router: #/  #/indices  #/sectors  #/performers  #/dividends
export const ROUTES = [
  ['dashboard', 'Dashboard'],
  ['indices', 'Indices'],
  ['sectors', 'Sectors'],
  ['performers', 'Performers'],
  ['dividends', 'Dividends'],
]

const read = () => {
  const name = window.location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]
  return ROUTES.some(([r]) => r === name) ? name : 'dashboard'
}

export function useRoute() {
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => {
      const next = read()
      setRoute((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const go = (name) => {
  window.location.hash = name === 'dashboard' ? '#/' : `#/${name}`
}

export const linkTo = (name) => (name === 'dashboard' ? '#/' : `#/${name}`)
