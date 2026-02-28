/**
 * Research stats: Google Scholar (via SerpAPI) or Semantic Scholar.
 * Set serpapiKey in data/scholar-config.json to use your Google Scholar profile.
 * Profile: https://scholar.google.com/citations?user=tfKIiZoAAAAJ
 */
const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
const AUTHOR_QUERY = 'Durjoy Mistry';
const CACHE_KEY = 's2_papers_cache';
const CACHE_STATS_KEY = 's2_stats_cache';
const CACHE_GS_STATS_KEY = 'gs_stats_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let scholarConfig = null;
async function loadScholarConfig() {
  if (scholarConfig !== null) return scholarConfig;
  try {
    const res = await fetch('data/scholar-config.json');
    if (res.ok) scholarConfig = await res.json();
  } catch (e) {}
  scholarConfig = scholarConfig || {};
  return scholarConfig;
}

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      expires: Date.now() + CACHE_TTL_MS
    }));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

/**
 * Search for author by name and return authorId
 */
async function searchAuthor(query = AUTHOR_QUERY) {
  const res = await fetch(`${S2_BASE}/author/search?query=${encodeURIComponent(query)}&limit=1`);
  const json = await res.json();
  if (!json.data?.length) return null;
  return json.data[0].authorId;
}

/**
 * Fetch all papers for an author from Semantic Scholar
 */
async function fetchPapersFromS2(authorId) {
  const fields = 'title,year,citationCount,venue,url,openAccessPdf,authors';
  const allPapers = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${S2_BASE}/author/${authorId}/papers?fields=${fields}&limit=100&offset=${offset}`
    );
    const json = await res.json();
    const papers = json.data || [];
    allPapers.push(...papers);
    offset = json.next ?? offset + papers.length;
    hasMore = papers.length === 100 && offset < 10000;
  }

  return allPapers;
}

/**
 * Compute H-index from papers sorted by citation count
 */
function computeHIndex(papers) {
  const sorted = papers
    .map(p => (p.citationCount || 0))
    .filter(c => c > 0)
    .sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) h = i + 1;
    else break;
  }
  return h;
}

function normalizeTitle(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Convert S2 papers to card format and merge with override (PDF URLs)
 */
function mapPapersToCards(papers, override = {}) {
  const overrideMap = {};
  (override.papers || []).forEach(o => {
    const key = normalizeTitle(o.title);
    if (key) overrideMap[key] = o.pdf;
  });

  return papers.map(p => {
    const title = p.title || '';
    const key = normalizeTitle(title);
    const pdf = overrideMap[key] || (p.openAccessPdf?.url || null);
    const link = p.paperId ? `https://www.semanticscholar.org/paper/${p.paperId}` : null;

    return {
      Papers: title,
      Citations: p.citationCount || 0,
      Ranking: p.venue || '',
      ' Position': p.authors?.map(a => a.name).join(', ') || '',
      'Link  to Paper': link,
      PDF: pdf,
      year: p.year
    };
  });
}

/**
 * Fetch papers and stats from Semantic Scholar. Uses cache if valid.
 */
async function fetchPapers(useCache = true) {
  if (useCache) {
    const cached = getCached(CACHE_KEY);
    if (cached) return cached;
  }

  const authorId = await searchAuthor();
  if (!authorId) {
    console.warn('Author not found in Semantic Scholar');
    return [];
  }

  const papers = await fetchPapersFromS2(authorId);

  // Load override for PDF paths
  let override = { papers: [] };
  try {
    const res = await fetch('data/override.json');
    if (res.ok) override = await res.json();
  } catch (e) {
    console.warn('Override not loaded:', e);
  }

  const cards = mapPapersToCards(papers, override);
  setCache(CACHE_KEY, cards);
  return cards;
}

/**
 * Fetch stats (totalCitations, paperCount, hIndex) from Semantic Scholar
 */
async function fetchS2Stats(useCache = true) {
  if (useCache) {
    const cached = getCached(CACHE_STATS_KEY);
    if (cached) return cached;
  }

  const authorId = await searchAuthor();
  if (!authorId) {
    return { totalCitations: 0, paperCount: 0, hIndex: 0 };
  }

  const papers = await fetchPapersFromS2(authorId);
  const totalCitations = papers.reduce((sum, p) => sum + (p.citationCount || 0), 0);
  const hIndex = computeHIndex(papers);

  const stats = {
    totalCitations,
    paperCount: papers.length,
    hIndex
  };

  setCache(CACHE_STATS_KEY, stats);
  return stats;
}

/**
 * Fetch stats from Google Scholar via SerpAPI.
 * Requires serpapiKey in data/scholar-config.json (free tier: 100 calls/month).
 */
async function fetchGoogleScholarStats(useCache = true) {
  if (useCache) {
    const cached = getCached(CACHE_GS_STATS_KEY);
    if (cached) return cached;
  }

  const config = await loadScholarConfig();
  const apiKey = (config.serpapiKey || '').trim();
  const authorId = (config.googleScholarAuthorId || 'tfKIiZoAAAAJ').trim();
  if (!apiKey) return null;

  try {
    const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${encodeURIComponent(authorId)}&api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) {
      console.warn('SerpAPI error:', json.error);
      return null;
    }

    const table = json.cited_by?.table || [];
    const citationsRow = table.find(r => r.citations);
    const hIndexRow = table.find(r => r.indice_h || r.h_index);
    const totalCitations = citationsRow?.citations?.all ?? 0;
    const hIndex = hIndexRow?.indice_h?.all ?? hIndexRow?.h_index?.all ?? 0;
    const paperCount = Array.isArray(json.articles) ? json.articles.length : 0;

    const stats = { totalCitations, paperCount, hIndex };
    setCache(CACHE_GS_STATS_KEY, stats);
    return stats;
  } catch (e) {
    console.warn('Google Scholar fetch failed:', e);
    return null;
  }
}

/**
 * Fetch stats: prefers Google Scholar (SerpAPI) when configured, else Semantic Scholar.
 */
async function fetchScholarStats(useCache = true) {
  const gs = await fetchGoogleScholarStats(useCache);
  if (gs) return gs;
  return fetchS2Stats(useCache);
}

/**
 * Clear cache (useful for refresh)
 */
function clearS2Cache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_STATS_KEY);
  localStorage.removeItem(CACHE_GS_STATS_KEY);
}
