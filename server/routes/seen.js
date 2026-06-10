const express = require('express');
const supabase = require('../db');

const router = express.Router();

const SEEN_COLUMNS = {
  james: 'seen_james',
  gurleen: 'seen_gurleen',
};

// GET /api/seen
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('seen_status')
      .select('tmdb_id, type, seen_james, seen_gurleen');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/seen error:', err.message);
    res.status(500).json({ error: 'Failed to fetch seen status' });
  }
});

// POST /api/seen/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { tmdb_id, type, person } = req.body;
    const column = SEEN_COLUMNS[person];

    if (!tmdb_id || !type || !column) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('seen_status')
      .select('seen_james, seen_gurleen')
      .eq('tmdb_id', tmdb_id)
      .eq('type', type)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const next = {
      seen_james: existing?.seen_james ?? false,
      seen_gurleen: existing?.seen_gurleen ?? false,
    };
    next[column] = !next[column];

    const { data, error } = await supabase
      .from('seen_status')
      .upsert(
        { tmdb_id, type, ...next, updated_at: new Date().toISOString() },
        { onConflict: 'tmdb_id,type' }
      )
      .select('tmdb_id, type, seen_james, seen_gurleen')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('POST /api/seen/toggle error:', err.message);
    res.status(500).json({ error: 'Failed to update seen status' });
  }
});

module.exports = router;
