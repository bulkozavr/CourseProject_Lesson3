Goal: Single-page web app showing locale cards. Each card: code (en-AU), language, country, currency symbol + name, TLD, flag emoji. Node HTTP server serves static files + JSON API. No npm, no frameworks, no build step.

Data: Static JSON — ~50–100 locales hand-authored (or generated). Server reads on startup, serves over HTTP.
