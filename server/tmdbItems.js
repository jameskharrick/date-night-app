const tmdb = require('./tmdb');
const { MOVIE_GENRES, TV_GENRES } = require('./genreMap');
const { PLATFORM_NAME_MAP } = require('./platformMap');

async function getWatchProviders(mediaType, id) {
  try {
    const { data } = await tmdb.get(`/${mediaType}/${id}/watch/providers`);
    const us = data.results?.US;
    if (!us) return [];

    const providers = [
      ...(us.flatrate || []),
      ...(us.ads || []),
      ...(us.free || []),
    ];

    const names = new Set();
    for (const provider of providers) {
      const canonical = PLATFORM_NAME_MAP[provider.provider_name];
      if (canonical) names.add(canonical);
    }

    return [...names];
  } catch (err) {
    console.error(`Failed to fetch watch providers for ${mediaType}/${id}:`, err.message);
    return [];
  }
}

// Converts a raw TMDB result (annotated with _mediaType) into the item shape
// shared by the recommendations and search responses.
async function toCardItem(item) {
  const mediaType = item._mediaType;
  const genreMap = mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const genreNames = (item.genre_ids || [])
    .map((gid) => genreMap[gid])
    .filter(Boolean);
  const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date;
  const platforms = await getWatchProviders(mediaType, item.id);

  return {
    tmdb_id: item.id,
    type: mediaType,
    title: mediaType === 'movie' ? item.title : item.name,
    poster_path: item.poster_path || null,
    genres: genreNames,
    platforms,
    tmdb_score: item.vote_average,
    year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
  };
}

module.exports = { getWatchProviders, toCardItem };
