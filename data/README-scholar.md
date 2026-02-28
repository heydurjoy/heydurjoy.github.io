# Google Scholar Citation Stats

Citation counts are fetched from **Google Scholar** when configured, otherwise from Semantic Scholar.

## Setup (Google Scholar)

1. Get a free SerpAPI key at [serpapi.com](https://serpapi.com) (100 calls/month).
2. Edit `scholar-config.json` and add your key:
   ```json
   {
     "googleScholarAuthorId": "sdsnA6oAAAAJ",
     "serpapiKey": "your_key_here"
   }
   ```
3. Use your Google Scholar author ID from: `https://scholar.google.com/citations?user=YOUR_ID`

If `serpapiKey` is empty, the site falls back to Semantic Scholar.
