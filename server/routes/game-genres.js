const express = require('express');
const { igdbRequest } = require('../igdb');

const router = express.Router();

let genreCache = { data: null, fetchedAt: 0 };
const CACHE_TTL = 24 * 60 * 60 * 1000;

// GET /api/game-genres
router.get('/', async (req, res) => {
  try {
    if (genreCache.data && Date.now() - genreCache.fetchedAt < CACHE_TTL) {
      return res.json(genreCache.data);
    }

    const genres = await igdbRequest('/genres', 'fields id, name, slug; limit 40;');
    const sorted = genres.sort((a, b) => a.name.localeCompare(b.name));

    genreCache = { data: sorted, fetchedAt: Date.now() };
    res.json(sorted);
  } catch (err) {
    console.error('GET /api/game-genres error:', err.message);
    res.status(500).json({ error: 'Failed to fetch game genres' });
  }
});

module.exports = router;
