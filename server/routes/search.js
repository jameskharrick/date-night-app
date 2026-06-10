const express = require('express');
const tmdb = require('../tmdb');
const { toCardItem } = require('../tmdbItems');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { query = '', type = 'both' } = req.query;
    const trimmed = query.trim();

    if (!trimmed) {
      return res.json([]);
    }

    const mediaTypes = type === 'both' ? ['movie', 'tv'] : [type];

    const responses = await Promise.all(
      mediaTypes.map((mt) =>
        tmdb.get(`/search/${mt}`, { params: { query: trimmed, include_adult: false } })
      )
    );

    const rawResults = responses
      .flatMap((r, i) => (r.data.results || []).map((item) => ({ ...item, _mediaType: mediaTypes[i] })))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    const items = await Promise.all(rawResults.map(toCardItem));

    res.json(items.slice(0, 50));
  } catch (err) {
    console.error('GET /api/search error:', err.message);
    res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;
