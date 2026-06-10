const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

module.exports = tmdb;
