const axios = require('axios');

const { UNSPLASH_ACCESS_KEY } = process.env;

if (!UNSPLASH_ACCESS_KEY) {
  console.warn(
    'Warning: UNSPLASH_ACCESS_KEY is not set. Trip header photos will be skipped until this is configured in server/.env'
  );
}

function locationQuery(city, region, country) {
  return [city, region, country].filter(Boolean).join(', ');
}

async function getCityPhoto(query) {
  if (!UNSPLASH_ACCESS_KEY || !query) return null;

  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    return res.data.results?.[0]?.urls?.regular || null;
  } catch (err) {
    console.error('Unsplash photo lookup failed:', err.message);
    return null;
  }
}

async function getRandomCityPhoto(query) {
  if (!UNSPLASH_ACCESS_KEY || !query) return null;

  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 20, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    const results = res.data.results || [];
    if (results.length === 0) return null;

    const pick = results[Math.floor(Math.random() * results.length)];
    return pick?.urls?.regular || null;
  } catch (err) {
    console.error('Unsplash random photo lookup failed:', err.message);
    return null;
  }
}

module.exports = { getCityPhoto, getRandomCityPhoto, locationQuery };
