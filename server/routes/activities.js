const express = require('express');
const multer = require('multer');
const supabase = require('../db');
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary');
const { getCityPhoto, getRandomCityPhoto } = require('../utils/unsplash');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const ACTIVITY_SELECT = '*, activity_media(*)';

function activityQuery(name) {
  return name || '';
}

// GET /api/activities
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(ACTIVITY_SELECT)
      .order('position', { ascending: true, nullsFirst: false })
      .order('added_at', { ascending: false })
      .order('created_at', { foreignTable: 'activity_media', ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/activities error:', err.message);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /api/activities
router.post('/', async (req, res) => {
  try {
    const { name, location, justification, added_by, notes } = req.body;

    const photo_url = await getCityPhoto(activityQuery(name, location));

    const { data, error } = await supabase
      .from('activities')
      .insert({
        name,
        location: location || null,
        justification: justification || null,
        added_by: added_by || null,
        notes: notes || null,
        status: 'want_to_try',
        photo_url,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ...data, activity_media: [] });
  } catch (err) {
    console.error('POST /api/activities error:', err.message);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// PATCH /api/activities/reorder
router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0)
      return res.status(400).json({ error: 'orderedIds must be a non-empty array' });

    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('activities')
          .update({ position: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/activities/reorder error:', err.message);
    res.status(500).json({ error: 'Failed to reorder activities' });
  }
});

// PATCH /api/activities/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, name, location, justification, added_by, notes, rating } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (justification !== undefined) updates.justification = justification;
    if (added_by !== undefined) updates.added_by = added_by;
    if (notes !== undefined) updates.notes = notes;
    if (rating !== undefined) updates.rating = rating;

    if (name !== undefined) {
      const { data: current, error: currentError } = await supabase
        .from('activities')
        .select('name')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;

      if (name !== current.name) {
        updates.photo_url = await getCityPhoto(activityQuery(name));
      }
    }

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/activities/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// POST /api/activities/:id/refresh-photo
router.post('/:id/refresh-photo', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('name')
      .eq('id', id)
      .single();

    if (activityError) throw activityError;

    const photo_url = await getRandomCityPhoto(activityQuery(activity.name));

    if (!photo_url) {
      return res.status(502).json({ error: 'No new photo found' });
    }

    const { data, error } = await supabase
      .from('activities')
      .update({ photo_url, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('POST /api/activities/:id/refresh-photo error:', err.message);
    res.status(500).json({ error: 'Failed to refresh photo' });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: media, error: mediaError } = await supabase
      .from('activity_media')
      .select('public_id, media_type')
      .eq('activity_id', id);

    if (mediaError) throw mediaError;

    if (media && media.length > 0) {
      const results = await Promise.allSettled(
        media.map((m) => destroyAsset(m.public_id, m.media_type === 'video' ? 'video' : 'image'))
      );
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`Failed to delete Cloudinary asset ${media[i].public_id}:`, result.reason);
        }
      });
    }

    const { error } = await supabase.from('activities').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/activities/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// POST /api/activities/:id/media
router.post('/:id/media', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large, max 25MB' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const media_type = req.file.mimetype.startsWith('video/')
      ? 'video'
      : req.file.mimetype.startsWith('image/')
      ? 'photo'
      : null;

    if (!media_type) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const result = await uploadBuffer(req.file.buffer, {
      resource_type: media_type === 'video' ? 'video' : 'image',
      folder: 'date-night-activities',
    });

    const { data, error } = await supabase
      .from('activity_media')
      .insert({
        activity_id: id,
        media_type,
        secure_url: result.secure_url,
        public_id: result.public_id,
        caption: req.body.caption || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/activities/:id/media error:', err.message);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

module.exports = router;
