const express = require('express');
const supabase = require('../db');

const router = express.Router();

// PATCH /api/trip-links/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, label, url } = req.body;

    const updates = {};
    if (category !== undefined) updates.category = category;
    if (label !== undefined) updates.label = label;
    if (url !== undefined) updates.url = url;

    const { data, error } = await supabase
      .from('trip_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/trip-links/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// DELETE /api/trip-links/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('trip_links').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trip-links/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

module.exports = router;
