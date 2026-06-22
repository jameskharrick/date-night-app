const express = require('express');
const supabase = require('../db');

const router = express.Router();

// GET /api/watchlist
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('added_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// POST /api/watchlist
router.post('/', async (req, res) => {
  try {
    const { tmdb_id, type, title, poster_path, genres, platforms, tmdb_score } = req.body;

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        tmdb_id,
        type,
        title,
        poster_path,
        genres: JSON.stringify(genres ?? []),
        platforms: JSON.stringify(platforms ?? []),
        tmdb_score,
        status: 'want_to_watch',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// PATCH /api/watchlist/reorder
router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0)
      return res.status(400).json({ error: 'orderedIds must be a non-empty array' });

    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('watchlist')
          .update({ position: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/watchlist/reorder error:', err.message);
    res.status(500).json({ error: 'Failed to reorder watchlist' });
  }
});

// PATCH /api/watchlist/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, personal_score, note } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (personal_score !== undefined) updates.personal_score = personal_score;
    if (note !== undefined) updates.note = note;

    const { data, error } = await supabase
      .from('watchlist')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/watchlist/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update watchlist entry' });
  }
});

// DELETE /api/watchlist/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('watchlist').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/watchlist/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete watchlist entry' });
  }
});

module.exports = router;
