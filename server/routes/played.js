const express = require('express');
const supabase = require('../db');

const router = express.Router();

const PLAYED_COLUMNS = {
  james: 'played_james',
  gurleen: 'played_gurleen',
};

// GET /api/played
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('played_status')
      .select('igdb_id, played_james, played_gurleen');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/played error:', err.message);
    res.status(500).json({ error: 'Failed to fetch played status' });
  }
});

// POST /api/played/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { igdb_id, person } = req.body;
    const column = PLAYED_COLUMNS[person];

    if (!igdb_id || !column) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('played_status')
      .select('played_james, played_gurleen')
      .eq('igdb_id', igdb_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const next = {
      played_james: existing?.played_james ?? false,
      played_gurleen: existing?.played_gurleen ?? false,
    };
    next[column] = !next[column];

    const { data, error } = await supabase
      .from('played_status')
      .upsert(
        { igdb_id, ...next, updated_at: new Date().toISOString() },
        { onConflict: 'igdb_id' }
      )
      .select('igdb_id, played_james, played_gurleen')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('POST /api/played/toggle error:', err.message);
    res.status(500).json({ error: 'Failed to update played status' });
  }
});

module.exports = router;
