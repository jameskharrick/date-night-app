const express = require('express');
const supabase = require('../db');

const router = express.Router();

// GET /api/games
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('added_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/games error:', err.message);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// POST /api/games
router.post('/', async (req, res) => {
  try {
    const { igdb_id, title, cover_path, genres, platforms, igdb_score, status } = req.body;

    const { data, error } = await supabase
      .from('games')
      .insert({
        igdb_id,
        title,
        cover_path,
        genres: JSON.stringify(genres ?? []),
        platforms: JSON.stringify(platforms ?? []),
        igdb_score,
        status: status || 'want_to_play',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/games error:', err.message);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// PATCH /api/games/reorder
router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0)
      return res.status(400).json({ error: 'orderedIds must be a non-empty array' });

    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('games')
          .update({ position: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/games/reorder error:', err.message);
    res.status(500).json({ error: 'Failed to reorder games' });
  }
});

// PATCH /api/games/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, personal_score, note } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (personal_score !== undefined) updates.personal_score = personal_score;
    if (note !== undefined) updates.note = note;

    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/games/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// DELETE /api/games/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('games').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/games/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

module.exports = router;
