// API routes for odds, arbitrage, and edge-ranked opportunities
const express = require('express');
const { fetchOdds, findArbitrageOpportunities, findOddsSpreads, SPORT_KEYS } = require('../services/odds-api');
const { rankOpportunities } = require('../edge-ranker');

const router = express.Router();

// In-memory cache (will add DB caching later)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes — preserve API credits

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// GET /api/odds/:sport — raw odds for a sport
router.get('/odds/:sport', async (req, res) => {
  const { sport } = req.params;

  if (!SPORT_KEYS[sport]) {
    return res.status(400).json({ error: `Invalid sport. Use: ${Object.keys(SPORT_KEYS).join(', ')}` });
  }

  try {
    const cacheKey = `odds_${sport}`;
    let data = getCached(cacheKey);

    if (!data) {
      data = await fetchOdds(sport, process.env.ODDS_API_KEY);
      setCache(cacheKey, data);
    }

    res.json({ sport, games: data.length, data });
  } catch (err) {
    console.error(`Error fetching ${sport} odds:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/edges/:sport — edge-ranked opportunities for a sport
router.get('/edges/:sport', async (req, res) => {
  const { sport } = req.params;

  if (!SPORT_KEYS[sport]) {
    return res.status(400).json({ error: `Invalid sport. Use: ${Object.keys(SPORT_KEYS).join(', ')}` });
  }

  try {
    const cacheKey = `edges_${sport}`;
    let ranked = getCached(cacheKey);

    if (!ranked) {
      const games = await fetchOdds(sport, process.env.ODDS_API_KEY);

      // Find all opportunity types
      const arbs = findArbitrageOpportunities(games);
      const oddsSpreads = findOddsSpreads(games);

      // Combine and rank
      const allOpportunities = [...arbs, ...oddsSpreads];
      ranked = rankOpportunities(allOpportunities);
      setCache(cacheKey, ranked);
    }

    res.json({ sport, total: ranked.length, opportunities: ranked });
  } catch (err) {
    console.error(`Error computing edges for ${sport}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/edges — all sports combined, ranked
router.get('/edges', async (req, res) => {
  try {
    const cacheKey = 'edges_all';
    let ranked = getCached(cacheKey);

    if (!ranked) {
      const allOpportunities = [];

      for (const sport of Object.keys(SPORT_KEYS)) {
        try {
          const games = await fetchOdds(sport, process.env.ODDS_API_KEY);
          const arbs = findArbitrageOpportunities(games);
          const oddsSpreads = findOddsSpreads(games);
          allOpportunities.push(...arbs, ...oddsSpreads);
        } catch (err) {
          console.error(`Error fetching ${sport}:`, err.message);
        }
      }

      ranked = rankOpportunities(allOpportunities);
      setCache(cacheKey, ranked);
    }

    res.json({ total: ranked.length, opportunities: ranked });
  } catch (err) {
    console.error('Error computing all edges:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
