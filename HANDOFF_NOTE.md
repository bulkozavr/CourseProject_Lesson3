# HANDOFF_NOTE — Locale Reference

## Project structure

```
e:\Users\Rumata\javarush\6512068\locale\
├── package.json          # Node project metadata, start script
├── .gitignore            # node_modules/, .env, *.log
├── CLAUDE.md             # Conventions
├── locales.json          # 5 static locales (source of truth)
├── server.js             # Node HTTP server — /api/* + public/* (cache-busting for dev)
├── HANDOFF_NOTE.md       # This file
├── test/
│   └── api-test.sh       # M1 smoke tests (12 checks, curl + node)
└── public/
    ├── ui-starter.html   # Reference mockup (keep, untouched)
    ├── index.html        # Shell — loading/error/empty/table, CDN flag-icons
    ├── style.css         # Tokens from ui-starter.html (dark theme, no new styles)
    └── app.js            # Fetch /api/locales → render rows with fi fi-XX
```

## API contract (M1 — immutable)

| Endpoint | Method | Response |
|---|---|---|
| `GET /api/locales` | GET | `200` — array of locale objects |
| `GET /api/locales/:code` | GET | `200` — single locale object, or `404` with `{ error, code }` |
| any non-GET | — | `405` — `{ error: "Method not allowed" }` |
| unknown path | — | `404` — `{ error: "Not found" }` |

### Locale object shape

```json
{
  "code": "en-AU",
  "language": "English",
  "country": "Australia",
  "currency": "AUD",
  "currencyName": "Australian dollar",
  "tld": ".au",
  "flag": "🇦🇺"
}
```

## Milestone state

| M | What | Status | Verification |
|---|---|---|---|
| M1 | API server + data + tests | ✅ Complete | `bash test/api-test.sh` — 12/12 pass |
| M2 | UI table with flag-icons, dark theme, 4 states, cache-busting | ✅ Complete | manual browser check + M1 tests pass |
| M3 | Client-side search/filter by code, country, language | ✅ Complete | live filter in browser + M1 tests pass |

## M2 UI behaviour

- **Loading:** Shows "Загрузка…" text while fetch in flight
- **Error:** Shows "Ошибка загрузки: {reason}" in red, `role="alert"`
- **Empty:** Shows "Нет данных." when API returns `[]`
- **Success:** Renders `<table>` with 6 columns: Flag, Code, Language, Country, Currency, TLD
- **Flags:** flag-icons CDN (`class="fi fi-xx"` derived from ISO suffix of locale code, e.g. `en-AU` → `fi fi-au`)
- **Colours:** Dark theme from `ui-starter.html` tokens (`--bg:#0f172a`, `--card:#1e293b`, etc.)
- **Search box:** Filters table rows by `input` event — code, country, or language (case-insensitive), client-side only, no API call
- **Cache:** Server sets `Cache-Control: no-cache` on `.html`. CSS/JS loaded with `?v=1` for cache-busting
- **HTML bugfix M2:** Duplicate `class` attr on `<table>` (HTML parser ignores second) → `class="locales hidden"`
- **Path bugfix:** `req.url` with `?v=1` broke `fs.readFile` → `req.url.split('?')[0]` before resolution

### M2 — manual checks

1. **Success** — 5 rows with dark background, flag-icons render, columns match starter
2. **Loading** — `<div id="loading">Загрузка…</div>` in HTML, visible before fetch resolves
3. **Empty** — `locales.json` → `[]`, restart server, page shows "Нет данных."
4. **Error** — kill server → red "Ошибка загрузки" with message
5. **Static assets** — style.css + app.js serve 200 with `?v=1`
6. **M1 contract** — `test/api-test.sh` 12/12 pass after all M2 changes

## M3 — Search / filter

**File changed:** `public/app.js` only. No HTML/CSS/server edits.

**How it works:**
- `allLocales` module-scoped array stores full dataset after fetch
- `input` event listener on `#search-input` calls `filterAndRender()`
- Filters by `code`, `language`, or `country` — case-insensitive substring match (`indexOf`)
- Empty query restores full list
- No matches → "Нет данных." empty state
- Table never re-fetches API during search

**Live filter checks (node simulation against `locales.json`):**

| Query | Result | Match field |
|---|---|---|
| `br` | pt-BR | code |
| `ja` | ja-JP | code |
| `aU` | en-AU | country (case-insensitive) |
| `german` | de-DE | language |
| `zzz` | empty — "Нет данных." | none |
| clear | all 5 rows | — |

**M1 contract:** 12/12 pass after M3 changes.

## Goal

Build small locale reference app for class project. API + static page with table of locales. No frameworks, no npm deps, no build step. Pure Node `http` module + vanilla HTML/CSS/JS.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| API style | RESTful, JSON, no Express | Zero dependencies, Node built-in `http` only |
| Data storage | Static `locales.json` read at startup | No DB needed for 5 locales, trivial to extend |
| Data seed | 5 locales (AU, BR, JP, DE, ES) | User asked for any 5 languages |
| Flag format | flag-icons CDN (`fi fi-XX` by ISO 3166 code suffix) | Accurate flags across OS/browser, no emoji oddities |
| Hosting | Localhost :3000 | No deploy target — class project |
| UI approach | Single HTML page, JS fetches API | Simple, separates concerns, no SSR needed |
| Error approach | try/catch in fetch, red `role="alert"` in DOM | Accessible, minimal code, survives server outage |
| Test tool | curl + node one-liners | No test framework dependency |
| Cache strategy | `?v=N` on static assets, `Cache-Control: no-cache` on HTML | Forces browser refresh in dev without build step |
| Flag derivation | `en-AU` → `fi fi-au` (ISO suffix from code, lowercase) | Keeps `flag` emoji field in API contract frozen |
| UI blueprint | `ui-starter.html` in repo — CSS tokens taken verbatim | Guarantees visual consistency, no invented styles |

## Tests / checks with precise results

### M1 — API (run: `bash test/api-test.sh`)

```
--- M1 API Smoke Tests ---
  ✓ GET /api/locales (HTTP 200)
  ✓ GET /api/locales/en-AU (HTTP 200)
  ✓ GET /api/locales/unknown (HTTP 404)
  ✓ GET /nonexistent (HTTP 404)
  ✓ Locale list count >= 5 (5 locales)
  ✓ en-AU code (code=en-AU)
  ✓ en-AU flag (flag=🇦🇺)
  ✓ en-AU tld (tld=.au)
  ✓ en-AU currency (currency=AUD)
  ✓ pt-BR code (code=pt-BR)
  ✓ pt-BR flag (flag=🇧🇷)
  ✓ ja-JP code (code=ja-JP)

--- Results ---
Passed: 12
Failed: 0
```

Also verified: `DELETE /api/locales` → HTTP 405.

## Known risks

| Risk | Impact | Mitigation |
|---|---|---|
| `locales.json` read once at startup | Server restart needed to pick up data changes | Acceptable for class project; add file watcher for M3+ |
| No rate limiting or caching | Simple DoS possible on API | Not a concern — local-only, no deployment |
| No content-type negotiation | Always returns JSON, never HTML/XML | Acceptable — single frontend client |
| Emoji flag rendering | OS/browser dependent (some show two-letter code) | ✅ Fixed — using flag-icons CDN (`fi fi-XX`), not emoji |
| Cache / stale browser CSS | Browser serves old style.css from disk cache, white background appears | Mitigated: `?v=1` query param on CSS/JS links, `Cache-Control: no-cache` on HTML |
| `req.url` with query string | `fs.readFile` path includes `?v=1`, file not found | Fixed: split `req.url` on `?` before path resolution |
| Single-process server | Blocks during slow requests (stale file read) | Not a bottleneck with 5 locales and < 1 KiB data |
| No input validation | `GET /api/locales/../` may traverse path | Mitigated: URL parsed via `URL` constructor, not raw pathname |

## One next step

Expand `locales.json` from 5 to 20+ locales. Add column sorting (click `th` to sort by code/country/currency). Add detail view on row click.
