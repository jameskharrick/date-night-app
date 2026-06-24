const express = require('express');
const { igdbRequest } = require('../igdb');
const { toGameCardItem, IGDB_PLATFORM_NAME_TO_ID } = require('../igdbItems');

const router = express.Router();

// GET /api/game-recommendations
router.get('/', async (req, res) => {
  try {
    const { genres, platforms, minScore, yearFrom, yearTo, surpriseMe } = req.query;

    const whereClauses = ['total_rating_count > 5', 'version_parent = null'];

    if (surpriseMe !== 'true') {
      if (genres) {
        whereClauses.push(`genres = (${genres})`);
      }
      if (platforms) {
        const platformIds = platforms
          .split(',')
          .map((name) => IGDB_PLATFORM_NAME_TO_ID[name.trim()])
          .filter(Boolean);
        if (platformIds.length > 0) {
          whereClauses.push(`platforms = (${platformIds.join(',')})`);
        }
      }
      if (minScore && Number(minScore) > 0) {
        whereClauses.push(`total_rating >= ${Number(minScore) * 10}`);
      }
      if (yearFrom) {
        const ts = Math.floor(new Date(`${yearFrom}-01-01`).getTime() / 1000);
        whereClauses.push(`first_release_date >= ${ts}`);
      }
      if (yearTo) {
        const ts = Math.floor(new Date(`${yearTo}-12-31`).getTime() / 1000);
        whereClauses.push(`first_release_date <= ${ts}`);
      }
    }

    const randomOffset = Math.floor(Math.random() * 100);

    const query = `
fields name, genres.name, platforms.id, cover.url, total_rating, total_rating_count, first_release_date;
where ${whereClauses.join(' & ')};
sort total_rating desc;
limit 40;
offset ${randomOffset};
`;

    const results = await igdbRequest('/games', query);
    res.json(results.map(toGameCardItem));
  } catch (err) {
    console.error('GET /api/game-recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch game recommendations' });
  }
});

module.exports = router;
