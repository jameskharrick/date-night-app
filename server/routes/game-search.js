const express = require('express');
const { igdbRequest } = require('../igdb');
const { toGameCardItem } = require('../igdbItems');

const router = express.Router();

// GET /api/game-search
router.get('/', async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery || !searchQuery.trim()) {
      return res.status(400).json({ error: 'query is required' });
    }

    const escaped = searchQuery.trim().replace(/"/g, '\\"');
    const query = `
search "${escaped}";
fields name, genres.name, platforms.id, cover.url, total_rating, total_rating_count, first_release_date;
where version_parent = null;
limit 40;
`;

    const results = await igdbRequest('/games', query);
    const mapped = results
      .map(toGameCardItem)
      .sort((a, b) => (b.igdb_score ?? 0) - (a.igdb_score ?? 0));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/game-search error:', err.message);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

module.exports = router;
