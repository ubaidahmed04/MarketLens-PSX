import { useEffect, useRef, useState } from 'react'
import { POLL_MS } from '../config'

// Calls `fetcher` now, then again every `interval` ms.
// Re-starts when anything in `deps` changes. Slows down while the tab is hidden.
export function usePolling(fetcher, deps = [], interval = POLL_MS) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let alive = true
    let timer
    setLoading(true)

    const run = async () => {
      try {
        const result = await fetcherRef.current()
        if (!alive) return
        setData(result)
        setError(null)
        setUpdatedAt(new Date())
      } catch (err) {
        if (alive) setError(err)
      } finally {
        if (alive) {
          setLoading(false)
          if (interval) timer = setTimeout(run, document.hidden ? interval * 4 : interval)
        }
      }
    }

    run()
    return () => {
      alive = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, updatedAt }
}
