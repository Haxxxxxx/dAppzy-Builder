const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 60_000; // 1 minute
const RATE_LIMIT_MS = 1_500; // CoinGecko free tier limit

const cache = new Map();
let lastRequestTime = 0;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  return res.json();
}

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) return entry.data;
  return null;
}

export async function fetchTokenPrices(tokenIds = [], vsCurrency = 'usd') {
  if (!tokenIds.length) return {};
  const key = `prices:${[...tokenIds].sort().join(',')}:${vsCurrency}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const data = await rateLimitedFetch(
      `${COINGECKO_BASE}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true`
    );
    const result = {};
    for (const [id, info] of Object.entries(data)) {
      result[id] = {
        price: info[vsCurrency] || 0,
        change24h: info[`${vsCurrency}_24h_change`] || 0,
        marketCap: info[`${vsCurrency}_market_cap`] || 0,
      };
    }
    cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[CoinGecko] fetchTokenPrices failed:', err.message);
    const stale = cache.get(key);
    return stale?.data || {};
  }
}

export async function getTopTokens(limit = 10) {
  const key = `top:${limit}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const data = await rateLimitedFetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    const result = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      image: coin.image,
    }));
    cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[CoinGecko] getTopTokens failed:', err.message);
    const stale = cache.get(key);
    return stale?.data || [];
  }
}

export function clearCache() {
  cache.clear();
}
