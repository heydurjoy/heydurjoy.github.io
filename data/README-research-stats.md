# research-stats.json

Static fallback for research statistics. Used by both `index.html` and `research.html`.

## Stats priority chain (research page)

1. **SerpAPI** — Live Google Scholar via SerpAPI (needs API key in `data/scholar-config.json`)
2. **This JSON file** — Served statically, update manually when stats change
3. **Google Sheet "stats" tab** — Fetched from opensheet.elk.sh

The localStorage cache is updated only when a source provides **higher** numbers, so stats never regress.
