const axios = require('axios');

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  try {
    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });
    cachedToken = res.data.access_token;
    tokenExpiresAt = Date.now() + res.data.expires_in * 1000;
    return cachedToken;
  } catch (err) {
    console.error('Twitch token fetch failed:', err.response?.data ?? err.message);
    console.error('IGDB_CLIENT_ID set:', Boolean(process.env.IGDB_CLIENT_ID));
    console.error('IGDB_CLIENT_SECRET set:', Boolean(process.env.IGDB_CLIENT_SECRET));
    throw err;
  }
}

async function igdbRequest(endpoint, query) {
  const token = await getAccessToken();
  try {
    const res = await axios.post(`https://api.igdb.com/v4${endpoint}`, query, {
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });
    return res.data;
  } catch (err) {
    console.error('IGDB request failed:', err.response?.data ?? err.message);
    throw err;
  }
}

module.exports = { igdbRequest };
