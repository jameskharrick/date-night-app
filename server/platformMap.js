// Maps the various provider_name strings TMDB returns (US watch/providers)
// to the canonical platform names used throughout this app.

const PLATFORM_NAME_MAP = {
  Netflix: 'Netflix',
  'Netflix Kids': 'Netflix',
  Hulu: 'Hulu',
  'Disney Plus': 'Disney+',
  'Disney+': 'Disney+',
  Max: 'Max',
  'HBO Max': 'Max',
  'Amazon Prime Video': 'Prime Video',
  'Prime Video': 'Prime Video',
  Peacock: 'Peacock',
  'Peacock Premium': 'Peacock',
  'Peacock Premium Plus': 'Peacock',
  'Paramount Plus': 'Paramount+',
  'Paramount+': 'Paramount+',
  'Paramount+ with Showtime': 'Paramount+',
  'Apple TV Plus': 'Apple TV+',
  'Apple TV+': 'Apple TV+',
};

const SUPPORTED_PLATFORMS = [
  'Netflix',
  'Hulu',
  'Disney+',
  'Max',
  'Prime Video',
  'Peacock',
  'Paramount+',
  'Apple TV+',
];

module.exports = {
  PLATFORM_NAME_MAP,
  SUPPORTED_PLATFORMS,
};
