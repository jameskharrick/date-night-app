const IGDB_PLATFORM_MAP = {
  167: 'PS5',
  48: 'PS4',
  169: 'Xbox Series X/S',
  49: 'Xbox One',
  130: 'Switch',
  6: 'PC',
  39: 'iOS',
  34: 'Android',
};

const IGDB_PLATFORM_NAME_TO_ID = Object.fromEntries(
  Object.entries(IGDB_PLATFORM_MAP).map(([id, name]) => [name, Number(id)])
);

function toGameCardItem(igdbGame) {
  return {
    igdb_id: igdbGame.id,
    type: 'game',
    title: igdbGame.name,
    cover_path: igdbGame.cover
      ? `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`
      : null,
    genres: (igdbGame.genres || []).map((g) => g.name),
    platforms: (igdbGame.platforms || [])
      .map((p) => IGDB_PLATFORM_MAP[p.id])
      .filter(Boolean),
    igdb_score: igdbGame.total_rating != null
      ? Math.round(igdbGame.total_rating) / 10
      : null,
    year: igdbGame.first_release_date
      ? new Date(igdbGame.first_release_date * 1000).getFullYear()
      : null,
  };
}

module.exports = { toGameCardItem, IGDB_PLATFORM_MAP, IGDB_PLATFORM_NAME_TO_ID };
