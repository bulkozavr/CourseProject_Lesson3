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

## Ready for M3

M3 can add:
- Search / filter by code or country name (client-side filter on existing fetch)
- Click-to-expand detail view or tooltip
- Column sorting
- Fancy styling / transitions
