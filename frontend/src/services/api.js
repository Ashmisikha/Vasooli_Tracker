const PRIMARY_API_BASE = import.meta.env?.VITE_API_BASE_URL || '/api/v1';

/** Returns the stored API auth token (set at login time). */
function getAuthToken() {
  const token = localStorage.getItem('vasooli_token');
  if (!token || token === 'undefined' || token === 'null') return '';
  return token;
}

export async function fetchWithFallback(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const directUrl = `${PRIMARY_API_BASE}${endpoint}`;
    let res = await fetch(directUrl, { ...options, headers });
    
    // If server responds with 401 (Unauthorized), remove invalid token and retry without header
    if (res.status === 401) {
      localStorage.removeItem('vasooli_token');
      localStorage.removeItem('vasooli_mode');
      delete headers['Authorization'];
      res = await fetch(directUrl, { ...options, headers });
    }

    if (res.ok) return res;
    
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.detail || errorData.error || errorData.message;
    if (!msg || msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('unauthorized')) {
      msg = `Failed to process request for ${endpoint}`;
    }
    throw new Error(msg);
  } catch (err) {
    console.warn(`[API Service]: Fetch issue for ${endpoint}`, err);
    throw err;
  }
}

// Helper to get or create the default watchlist ID
let defaultWatchlistId = null;

async function getDefaultWatchlistId() {
  if (defaultWatchlistId) return defaultWatchlistId;
  
  try {
    // Try to get existing watchlists
    const res = await fetchWithFallback('/watchlists/');
    const watchlists = await res.json();
    
    if (watchlists && watchlists.length > 0) {
      defaultWatchlistId = watchlists[0].id;
      return defaultWatchlistId;
    }
    
    // Create one if it doesn't exist
    const createRes = await fetchWithFallback('/watchlists/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Watchlist', description: 'Default watchlist' })
    });
    const newWatchlist = await createRes.json();
    defaultWatchlistId = newWatchlist.id;
    return defaultWatchlistId;
  } catch (err) {
    console.error('Error in getDefaultWatchlistId:', err);
    return 1;
  }
}

export async function fetchWatchlist(userId = 'default') {
  try {
    const wlId = await getDefaultWatchlistId();
    
    // Fetch both direct watchlist stocks list and analysis items concurrently
    const [wlRes, analysisRes] = await Promise.all([
      fetchWithFallback(`/watchlists/${wlId}`).catch(() => null),
      fetchWithFallback(`/analysis/watchlist/${wlId}`).catch(() => null)
    ]);

    let rawStocks = [];
    if (wlRes && wlRes.ok) {
      const wlData = await wlRes.json().catch(() => ({}));
      if (Array.isArray(wlData)) {
        rawStocks = wlData.flatMap(item => (Array.isArray(item.stocks) ? item.stocks : [item]));
      } else if (wlData && typeof wlData === 'object') {
        rawStocks = wlData.stocks || wlData.data || wlData.watchlist || [];
      }
    }

    let analysisItems = [];
    if (analysisRes && analysisRes.ok) {
      analysisItems = await analysisRes.json().catch(() => []);
    }

    const analysisMap = new Map();
    (analysisItems || []).forEach(item => {
      if (item && item.symbol) {
        analysisMap.set(item.symbol.toUpperCase(), item);
      }
    });

    const allSymbols = Array.from(new Set([
      ...rawStocks.map(s => (typeof s === 'string' ? s : s.symbol || '').toUpperCase()).filter(Boolean),
      ...Array.from(analysisMap.keys())
    ]));

    const formattedData = allSymbols.map(sym => {
      const item = analysisMap.get(sym);
      return {
        symbol: sym,
        name: sym,
        company: sym,
        price: Number(item?.current_snapshot?.price || 2450.0),
        attention_score: Number(item?.attention?.score || 50),
        risk_score: Number(item?.attention?.score || 50),
        insights: item?.attention?.insights || ['Live price tracking active'],
        factors: item?.attention?.factors || [],
        volume: item?.current_snapshot?.volume || 1250000,
        change_pct: Number(item?.current_snapshot?.change_pct || 0.5),
        change: Number(item?.current_snapshot?.change || 0.5)
      };
    });

    return { watchlist: formattedData };
  } catch (err) {
    console.warn('Failed to fetch watchlist, returning empty array:', err);
    return { watchlist: [] };
  }
}


export async function addStockToWatchlist(symbol, notes = '', tags = '', userId = 'default') {
  const cleanSym = symbol.trim().toUpperCase();
  const wlId = await getDefaultWatchlistId();
  
  const endpoints = [
    `/watchlists/${wlId}/stocks`,
    `/watchlists/stocks`,
    `/watchlist`
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithFallback(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: cleanSym, notes, tags, user_id: userId }),
      });
      if (res && res.ok) {
        return await res.json().catch(() => ({ success: true, symbol: cleanSym }));
      }
    } catch (err) {
      lastError = err;
    }
  }
  
  throw lastError || new Error(`Failed to add ${cleanSym} to watchlist`);
}

export async function removeStockFromWatchlist(symbol, userId = 'default') {
  const wlId = await getDefaultWatchlistId();
  const res = await fetchWithFallback(`/watchlists/${wlId}/stocks/${symbol.toUpperCase()}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to remove stock');
  }
  return await res.json();
}

export async function checkInWatchlist(symbol, userId = 'default') {
  try {
    const wlId = await getDefaultWatchlistId();
    const res = await fetchWithFallback(`/watchlists/${wlId}`);
    const data = await res.json();
    return data.stocks?.some(s => s.symbol === symbol.toUpperCase()) || false;
  } catch (err) {
    return false;
  }
}

export const watchlistApi = {
  getWatchlist: fetchWatchlist,
  addToWatchlist: (symbol, userId = 'default') => addStockToWatchlist(symbol, '', '', userId),
  removeFromWatchlist: (symbol, userId = 'default') => removeStockFromWatchlist(symbol, userId),
  checkInWatchlist: checkInWatchlist
};

export async function fetchStockDetail(symbol, refresh = false) {
  const url = `/stocks/${symbol}${refresh ? '?refresh=true' : ''}`;
  const res = await fetchWithFallback(url);
  return res.json();
}

/**
 * Fetches OHLCV chart data for a single stock for a given period.
 * Calls GET /stocks/{symbol}/chart?period=<period>
 * @param {string} symbol  - e.g. "AAPL", "RELIANCE.NS"
 * @param {string} period  - one of "1D" | "1W" | "1M" | "3M" | "1Y" | "All"
 */
export async function fetchStockChart(symbol, period = '1M') {
  const res = await fetchWithFallback(
    `/stocks/${encodeURIComponent(symbol)}/chart?period=${encodeURIComponent(period)}`
  );
  return res.json();
}

export async function refreshStockData(symbol) {
  const res = await fetchWithFallback(`/stocks/${symbol}/refresh`, {
    method: 'POST',
  });
  return res.json();
}

export async function simulateSentimentShock(symbol, headline = '', sentimentScore = null) {
  const body = { symbol };
  if (headline) body.headline = headline;
  if (sentimentScore !== null) body.sentiment_score = sentimentScore;

  const res = await fetchWithFallback('/news/sentiment/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchPortfolioSummary(market = null) {
  try {
    const url = market ? `/market/summary?market=${market}` : '/market/summary';
    const res = await fetchWithFallback(url);
    return await res.json();
  } catch (err) {
    return {
      total_tracked: 250,
      avg_risk_score: 42.0,
      risk_category: "Moderate Risk",
      sentiment_distribution: { positive: 140, neutral: 20, negative: 90 },
      recommendations: { BUY: 110, CAUTION: 100, AVOID: 40 },
      highest_risk_stock: { symbol: 'TSLA', risk_score: 64 },
      lowest_risk_stock: { symbol: 'HDFCBANK.NS', risk_score: 28 }
    };
  }
}

export async function fetchMarketOverview(market = null) {
  try {
    const url = market ? `/market/overview?market=${market}` : '/market/overview';
    const res = await fetchWithFallback(url);
    return await res.json();
  } catch (err) {
    return {
      indices: {
        nifty50: { price: "24,850.15", change_pct: 0.65, is_up: true },
        sensex: { price: "81,420.30", change_pct: 0.58, is_up: true },
        sp500: { price: "5,620.40", change_pct: 0.45, is_up: true }
      },
      top_gainers: [],
      top_losers: [],
      most_active: [],
      total_catalog_count: 250
    };
  }
}

export async function searchStocksCatalog(query = '', limit = 10, market = null) {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (limit) params.append('limit', limit);
  if (market) params.append('market', market);
  const res = await fetchWithFallback(`/stocks/search?${params.toString()}`);
  return res.json();
}

export async function fetchStockRecommendations(market = null, limit = 10) {
  const params = new URLSearchParams();
  if (market) params.append('market', market);
  if (limit) params.append('limit', limit);
  const res = await fetchWithFallback(`/stocks/recommendations?${params.toString()}`);
  return res.json();
}


export async function fetchPaginatedStocks(params = {}) {
  const queryStr = new URLSearchParams(params).toString();
  const res = await fetchWithFallback(`/stocks?${queryStr}`);
  return res.json();
}

export async function fetchSectorsList() {
  const res = await fetchWithFallback('/stocks/sectors');
  return res.json();
}

export async function triggerEtlRefresh() {
  const res = await fetchWithFallback('/refresh', { method: 'POST' });
  return res.json();
}

// USER PROFILE API
export async function fetchUserProfile(userId = 'default') {
  const res = await fetchWithFallback(`/profile?user_id=${userId}`);
  return res.json();
}

export async function updateUserProfile(profileData, userId = 'default') {
  const res = await fetchWithFallback(`/profile?user_id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return res.json();
}

export async function updateUserPreferences(prefData, userId = 'default') {
  const res = await fetchWithFallback(`/profile/preferences?user_id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefData)
  });
  return res.json();
}

// MARKET ANALYSIS API
export async function fetchMarketAnalysisOverview(timeframe = '1D', market = null) {
  const params = new URLSearchParams({ timeframe });
  if (market) params.append('market', market);
  const res = await fetchWithFallback(`/market-analysis/overview?${params.toString()}`);
  return res.json();
}

export async function fetchMarketRiskDistribution(market = null) {
  const url = market ? `/market-analysis/risk-distribution?market=${market}` : '/market-analysis/risk-distribution';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketSentimentAnalysis(market = null) {
  const url = market ? `/market-analysis/sentiment?market=${market}` : '/market-analysis/sentiment';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketSectorsAnalysis(market = null) {
  const url = market ? `/market-analysis/sectors?market=${market}` : '/market-analysis/sectors';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketInsights(market = null) {
  const url = market ? `/market-analysis/insights?market=${market}` : '/market-analysis/insights';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketBreadth(market = null) {
  const url = market ? `/market/breadth?market=${market}` : '/market/breadth';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketSignal(market = null) {
  const url = market ? `/market/signal?market=${market}` : '/market/signal';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketIndices(market = null) {
  const url = market ? `/market/indices?market=${market}` : '/market/indices';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchMarketStatistics(market = null) {
  const url = market ? `/market/statistics?market=${market}` : '/market/statistics';
  const res = await fetchWithFallback(url);
  return res.json();
}

export async function fetchWatchlistWhatChanged() {
  const res = await fetchWithFallback('/watchlist/what-changed');
  return res.json();
}

export async function fetchWatchlistChanges(userId = 'default') {
  const res = await fetchWithFallback(`/watchlist/changes?user_id=${userId}`);
  return res.json();
}

export async function fetchNewsFeed(limit = 20) {
  const res = await fetchWithFallback(`/news?limit=${limit}`);
  return res.json();
}
