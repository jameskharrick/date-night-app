// Fallback TMDB genre id <-> name maps (TMDB's genre lists rarely change).
// Used to translate cached genre names back to TMDB ids, and to label
// genre_ids returned by /discover endpoints.

const MOVIE_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const TV_GENRES = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

function buildNameToIdMap(genreObj) {
  const map = {};
  for (const [id, name] of Object.entries(genreObj)) {
    map[name] = Number(id);
  }
  return map;
}

const MOVIE_NAME_TO_ID = buildNameToIdMap(MOVIE_GENRES);
const TV_NAME_TO_ID = buildNameToIdMap(TV_GENRES);

module.exports = {
  MOVIE_GENRES,
  TV_GENRES,
  MOVIE_NAME_TO_ID,
  TV_NAME_TO_ID,
};
