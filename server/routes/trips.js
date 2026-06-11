const express = require('express');
const multer = require('multer');
const supabase = require('../db');
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const TRIP_SELECT = '*, trip_links(*), trip_media(*)';

// GET /api/trips
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .order('added_at', { ascending: false })
      .order('created_at', { foreignTable: 'trip_links', ascending: true })
      .order('created_at', { foreignTable: 'trip_media', ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /api/trips error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST /api/trips
router.post('/', async (req, res) => {
  try {
    const { city, region, country, start_date, end_date, notes } = req.body;

    const { data, error } = await supabase
      .from('trips')
      .insert({
        city,
        region: region || null,
        country: country || null,
        start_date: start_date || null,
        end_date: end_date || null,
        notes: notes || null,
        status: 'want_to_visit',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ...data, trip_links: [], trip_media: [] });
  } catch (err) {
    console.error('POST /api/trips error:', err.message);
    res.status(500).json({ error: 'Failed to add trip' });
  }
});

// PATCH /api/trips/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, city, region, country, start_date, end_date, rating, notes } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (city !== undefined) updates.city = city;
    if (region !== undefined) updates.region = region;
    if (country !== undefined) updates.country = country;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (rating !== undefined) updates.rating = rating;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('PATCH /api/trips/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: media, error: mediaError } = await supabase
      .from('trip_media')
      .select('public_id, media_type')
      .eq('trip_id', id);

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

    const { error } = await supabase.from('trips').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trips/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// POST /api/trips/:id/links
router.post('/:id/links', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, label, url } = req.body;

    const { data, error } = await supabase
      .from('trip_links')
      .insert({ trip_id: id, category, label, url })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/trips/:id/links error:', err.message);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// POST /api/trips/:id/media
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
    });

    const { data, error } = await supabase
      .from('trip_media')
      .insert({
        trip_id: id,
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
    console.error('POST /api/trips/:id/media error:', err.message);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

module.exports = router;
