# HedgePlay Markets — PSX portal (React + Vite, plain JavaScript)

Screens: Dashboard, All indices, Sectors heatmap, Top performers, Dividends.
Live PSX indices, top advancers / decliners / most active, index point contributors,
watchlist and a full sortable stocks table. Light + dark theme, works on mobile.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production files in dist/
```

## Where things are
- `src/config.js` — **start here**: API URLs, refresh time, indices, your lineup endpoints, market hours, default watchlist
- `src/api/sarmaaya.js` — Sarmaaya calls (price history, contributors, companies)
- `src/api/lineup.js` — your nfapi037.lineup.pk calls + field mapping (`mapIndex`, `mapQuote`)
- `src/hooks/usePolling.js` — auto-refresh logic
- `src/hooks/useRoute.js` — screen list + hash router (`#/`, `#/indices`, `#/sectors`, `#/performers`, `#/dividends`)
- `src/pages/*` — one file per screen (Dashboard, IndicesPage, SectorsPage, PerformersPage, DividendsPage)
- `src/components/*` — one file per section (IndexCards, IndexHero, Movers, Contributors, Watchlist, StocksTable)
- `src/components/reactbits/*` — React Bits components (CountUp, SpotlightCard, ShinyText)
- `src/index.css` — all styles; colors are CSS variables at the top

## Connecting nfapi037.lineup.pk
1. In `src/config.js` fill `LINEUP_ENDPOINTS.indices` and/or `LINEUP_ENDPOINTS.quotes`.
2. If your JSON field names differ, edit `mapIndex` / `mapQuote` in `src/api/lineup.js`.
3. When set, live values override Sarmaaya on the index cards and watchlist (a "Live" tag appears).

## CORS / production
In dev, Vite proxies `/sarmaaya/*` and `/lineup/*` (see `vite.config.js`), so the browser never hits CORS.
In production either add the same proxy rules on your server (nginx / Netlify `_redirects`),
or set `VITE_SARMAAYA_URL` / `VITE_LINEUP_URL` in `.env` to the full URLs (those servers must allow CORS).
