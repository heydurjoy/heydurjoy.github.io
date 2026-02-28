# Publication PDFs

Add your paper PDFs here and reference them in `data/override.json`.

## How to add a PDF

1. Add a PDF file to this folder, e.g. `papers/my-paper-2024.pdf`
2. Open `data/override.json` and add an entry:

```json
{
  "papers": [
    { "title": "Exact paper title from Semantic Scholar", "pdf": "papers/my-paper-2024.pdf" }
  ]
}
```

3. Match the `title` exactly to how it appears on Semantic Scholar (or very close).
4. Use `papers/filename.pdf` for local files, or a full URL for external links (e.g. Google Drive).
