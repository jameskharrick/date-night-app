const express = require('express');
const tmdb = require('../tmdb');
const { toCardItem } = require('../tmdbItems');
const { SUPPORTED_PLATFORMS } = require('../platformMap');

const router = express.Router();

const PAGES_PER_TYPE = 2; // 20 results per page from TMDB discover
const MAX_PAGE_POOL = 10; // pick random pages from this range for variety between requests

function pickRandomPages(maxPage, count) {
  const pages = new Set();
  while (pages.size < Math.min(count, maxPage)) {
    pages.add(Math.floor(Math.random() * maxPage) + 1);
  }
  return [...pages];
}

async function discover(mediaType, { genres, minScore, yearFrom, yearTo, surpriseMe }) {
  const params = {
    sort_by: 'popularity.desc',
    include_adult: false,
    'vote_count.gte': 50,
  };

  if (!surpriseMe) {
    if (genres) params.with_genres = genres;
    if (minScore) params['vote_average.gte'] = minScore;

    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    if (yearFrom) params[`${dateField}.gte`] = `${yearFrom}-01-01`;
    if (yearTo) params[`${dateField}.lte`] = `${yearTo}-12-31`;
  }

  const pages = pickRandomPages(MAX_PAGE_POOL, PAGES_PER_TYPE);
  const requests = pages.map((page) =>
    tmdb.get(`/discover/${mediaType}`, { params: { ...params, page } })
  );

  const responses = await Promise.all(requests);
  const results = responses.flatMap((r) => r.data.results || []);

  return results.map((item) => ({ ...item, _mediaType: mediaType }));
}

router.get('/', async (req, res) => {
  try {
    const {
      type = 'both',
      genres = '',
      platforms = '',
      minScore = '0',
      yearFrom,
      yearTo,
      surpriseMe = 'false',
    } = req.query;

    const isSurpriseMe = surpriseMe === 'true' || surpriseMe === true;

    const requestedPlatforms = platforms
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => SUPPORTED_PLATFORMS.includes(p));

    const filterOptions = {
      genres,
      minScore: Number(minScore) || 0,
      yearFrom,
      yearTo,
      surpriseMe: isSurpriseMe,
    };

    const mediaTypes = type === 'both' ? ['movie', 'tv'] : [type];

    const discoverResults = (
      await Promise.all(mediaTypes.map((mt) => discover(mt, filterOptions)))
    ).flat();

    const withProviders = await Promise.all(discoverResults.map(toCardItem));

    let filtered = withProviders;

    const shouldFilterByPlatform = !isSurpriseMe && requestedPlatforms.length > 0;
    if (shouldFilterByPlatform) {
      filtered = filtered.filter((item) =>
        item.platforms.some((p) => requestedPlatforms.includes(p))
      );
    }

    res.json(filtered);
  } catch (err) {
    console.error('GET /api/recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
