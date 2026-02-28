# Iframely Embed Setup

The Google Scholar and ResearchGate bento cards use **Iframely** to show live preview cards.

## If embeds are blank

Iframely requires an API key for client-side embeds. Free tier at [iframely.com](https://iframely.com):

1. **Sign up** at [app.iframely.com](https://app.iframely.com)
2. **Get your API key** from Settings → API Keys
3. **Add your domain** in Settings → Allow Origins: `heydurjoy.github.io`
4. **Use the MD5 hash** of your key (shown as `key` in the dashboard) for client-side
5. **Update index.html** – change the script tag to:
   ```html
   <script async charset="utf-8" src="https://cdn.iframe.ly/embed.js?key=YOUR_MD5_HASH"></script>
   ```

## Links used

- Google Scholar: `https://scholar.google.com/citations?user=sdsnA6oAAAAJ&hl=en`
- ResearchGate: `https://www.researchgate.net/profile/Durjoy-Mistry`
