const express = require('express');
const supabase = require('../db');
const tmdb = require('../tmdb');
const { MOVIE_NAME_TO_ID, TV_NAME_TO_ID } = require('../genreMap');

const router = express.Router();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

router.get('/', async (req, res) => {
  try {
    const { data: cached, error: cacheError } = await supabase
      .from('genre_cache')
      .select('*')
      .order('fetched_at', { ascending: false });

    if (cacheError) throw cacheError;

    const newestFetchedAt = cached && cached.length > 0 ? new Date(cached[0].fetched_at) : null;
    const isFresh = newestFetchedAt && Date.now() - newestFetchedAt.getTime() < SEVEN_DAYS_MS;

    if (cached && cached.length > 0 && isFresh) {
      const movie = cached
        .filter((row) => row.type === 'movie')
        .map((row) => ({ id: MOVIE_NAME_TO_ID[row.name] ?? null, name: row.name }))
        .filter((g) => g.id !== null);

      const tv = cached
        .filter((row) => row.type === 'tv')
        .map((row) => ({ id: TV_NAME_TO_ID[row.name] ?? null, name: row.name }))
        .filter((g) => g.id !== null);

      return res.json({ movie, tv });
    }

    const [movieRes, tvRes] = await Promise.all([
      tmdb.get('/genre/movie/list', { params: { language: 'en-US' } }),
      tmdb.get('/genre/tv/list', { params: { language: 'en-US' } }),
    ]);

    const movie = movieRes.data.genres || [];
    const tv = tvRes.data.genres || [];

    const rows = [
      ...movie.map((g) => ({ name: g.name, type: 'movie', fetched_at: new Date().toISOString() })),
      ...tv.map((g) => ({ name: g.name, type: 'tv', fetched_at: new Date().toISOString() })),
    ];

    await supabase.from('genre_cache').delete().neq('id', 0);
    const { error: insertError } = await supabase.from('genre_cache').insert(rows);
    if (insertError) throw insertError;

    res.json({ movie, tv });
  } catch (err) {
    console.error('GET /api/genres error:', err.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

module.exports = router;
