# HANDOFF_NOTE — Locale Reference

## Project structure

```
e:\Users\Rumata\javarush\6512068\locale\
├── package.json          # Node project metadata, start script
├── .gitignore            # node_modules/, .env, *.log
├── CLAUDE.md             # Conventions for this project
├── locales.json          # 5 static locales (source of truth)
├── server.js             # Node HTTP server — /api/* + public/*
├── test/
│   └── api-test.sh       # M1 smoke tests (12 checks, curl + node)
└── public/
    ├── index.html        # Shell — loading/error/empty/table states
    ├── style.css         # Minimal table layout, responsive
    └── app.js            # Fetch /api/locales → render table
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
| M2 | UI table with loading/error/empty states | ✅ Complete | `node server.js` → localhost:3000 |
| M3 | — | ⏳ Not started | — |

## M2 UI behaviour

- **Loading:** Shows "Loading locales…" text while fetch in flight
- **Error:** Shows "Failed to load locales. {reason}" in red, `role="alert"`
- **Empty:** Shows "No locales found." when API returns `[]`
- **Success:** Renders `<table>` with 6 columns (Code, Language, Country, Currency, TLD, Flag)
- **Responsive:** Table wrapper has `overflow-x: auto` — horizontal scroll on narrow screens, no breakage

### M2 — UI (manual checks)

All done against running server on `http://localhost:3000`:

1. **Success state** — Page loads table with 5 rows. Columns: Code, Language, Country, Currency, TLD, Flag. All 5 flags render as emoji.
2. **Loading state** — `<div id="loading">Loading locales…</div>` present in HTML, visible before JS resolves fetch.
3. **Empty state** — Replaced `locales.json` with `[]`, restarted server. `GET /api/locales` returns `[]`. Page shows "No locales found."
4. **Error state** — Kill server → fetch throws. Page shows red "Failed to load locales." with error detail.
5. **Static assets** — `GET /style.css` → 200, `GET /app.js` → 200.
6. **Responsive** — Table wrapper `overflow-x: auto` triggers horizontal scroll under ~500px width, no layout break.

## Goal

Build small locale reference app for class project. API + static page with table of locales. No frameworks, no npm deps, no build step. Pure Node `http` module + vanilla HTML/CSS/JS.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| API style | RESTful, JSON, no Express | Zero dependencies, Node built-in `http` only |
| Data storage | Static `locales.json` read at startup | No DB needed for 5 locales, trivial to extend |
| Data seed | 5 locales (AU, BR, JP, DE, ES) | User asked for any 5 languages |
| Flag format | Unicode emoji | Zero deps, renders in all modern browsers |
| Hosting | Localhost :3000 | No deploy target — class project |
| UI approach | Single HTML page, JS fetches API | Simple, separates concerns, no SSR needed |
| Error approach | try/catch in fetch, red `role="alert"` in DOM | Accessible, minimal code, survives server outage |
| Test tool | curl + node one-liners | No test framework dependency |

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
| Emoji flag rendering | OS/browser dependent (some show two-letter code instead) | No action — all modern browsers support flag emoji |
| Single-process server | Blocks during slow requests (stale file read) | Not a bottleneck with 5 locales and < 1 KiB data |
| No input validation | `GET /api/locales/../` may traverse path | Mitigated: URL parsed via `URL` constructor, not raw pathname |

## One next step: M3 — Search / filter input

Add search box in header. On `input` event, filter rendered table rows by code or country name. Client-side only — no new API endpoint. After M3, possible follow-ups: column sorting, detail view, expand data to 20+ locales.
