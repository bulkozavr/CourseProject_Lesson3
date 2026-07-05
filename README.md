# Locale Reference

Class project — locale codes reference table. Vanilla stack: Node `http`, HTML/CSS/JS, no frameworks, no npm deps.

## Quick start

```bash
npm start
# → http://localhost:3000
```

## Structure

| Path | What |
|---|---|
| `server.js` | HTTP server: `GET /api/locales` + `public/` static |
| `locales.json` | 5 seed locales (AU, BR, JP, DE, ES) |
| `public/index.html` | App shell with flag-icons CDN |
| `public/style.css` | Dark theme from `ui-starter.html` tokens |
| `public/app.js` | Fetch → table + live search by code/country/language |
| `test/api-test.sh` | 12 smoke tests (curl + node) |

## API

`GET /api/locales` — array of `{ code, language, country, currency, tld, flag }`  
`GET /api/locales/en-AU` — single locale or `404`

API contract frozen. No auth. No DB.

## Test

```bash
bash test/api-test.sh
```
