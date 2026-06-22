const express = require('express');
const supabase = require('../db');
const { destroyAsset } = require('../utils/cloudinary');

const router = express.Router();

// PATCH /api/activity-media/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const { data, error } = await supabase
      .from('activity_media')
      .update({ caption })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/activity-media/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// DELETE /api/activity-media/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: media, error: fetchError } = await supabase
      .from('activity_media')
      .select('public_id, media_type')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    try {
      await destroyAsset(media.public_id, media.media_type === 'video' ? 'video' : 'image');
    } catch (cloudinaryErr) {
      console.error(`Failed to delete Cloudinary asset ${media.public_id}:`, cloudinaryErr.message);
    }

    const { error } = await supabase.from('activity_media').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/activity-media/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
