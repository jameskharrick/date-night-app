export const PLATFORMS = [
  { name: 'Netflix', className: 'bg-red-600 text-white' },
  { name: 'Hulu', className: 'bg-green-500 text-slate-950' },
  { name: 'Disney+', className: 'bg-blue-600 text-white' },
  { name: 'Max', className: 'bg-purple-600 text-white' },
  { name: 'Prime Video', className: 'bg-cyan-500 text-slate-950' },
  { name: 'Peacock', className: 'bg-amber-400 text-slate-950' },
  { name: 'Paramount+', className: 'bg-blue-900 text-white' },
  { name: 'Apple TV+', className: 'bg-slate-500 text-white' },
];

export const GAMING_PLATFORMS = [
  { name: 'PS5', className: 'bg-blue-700 text-white' },
  { name: 'PS4', className: 'bg-blue-500 text-white' },
  { name: 'Xbox Series X/S', className: 'bg-green-700 text-white' },
  { name: 'Xbox One', className: 'bg-green-600 text-white' },
  { name: 'Switch', className: 'bg-red-500 text-white' },
  { name: 'PC', className: 'bg-slate-500 text-white' },
  { name: 'iOS', className: 'bg-slate-400 text-slate-950' },
  { name: 'Android', className: 'bg-emerald-600 text-white' },
];

export const PLATFORM_CLASS_MAP = [...PLATFORMS, ...GAMING_PLATFORMS].reduce((acc, p) => {
  acc[p.name] = p.className;
  return acc;
}, {});

export const STATUS_OPTIONS = [
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
  { value: 'dropped', label: 'Dropped' },
];

export const STATUS_LABEL_MAP = STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const CONTENT_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
  { value: 'game', label: 'Games' },
];

export const GAME_STATUS_OPTIONS = [
  { value: 'want_to_play', label: 'Want to Play' },
  { value: 'playing', label: 'Playing' },
  { value: 'played', label: 'Played' },
];

export const GAME_STATUS_LABEL_MAP = GAME_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const CURRENT_YEAR = new Date().getFullYear();
export const DEFAULT_YEAR_FROM = 2000;

export const TRIP_STATUS_OPTIONS = [
  { value: 'want_to_visit', label: 'Want to Visit' },
  { value: 'planning', label: 'Planning' },
  { value: 'visited', label: 'Visited' },
];

export const TRIP_STATUS_LABEL_MAP = TRIP_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const TRIP_LINK_CATEGORIES = [
  { value: 'itinerary', label: 'Itinerary' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'flight', label: 'Flights' },
  { value: 'car_rental', label: 'Car Rental' },
  { value: 'dining', label: 'Dining' },
  { value: 'activity', label: 'Activities' },
];

export const TRIP_LINK_CATEGORY_LABEL_MAP = TRIP_LINK_CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

export const ACTIVITY_STATUS_OPTIONS = [
  { value: 'want_to_try', label: 'Want To Try' },
  { value: 'planning', label: 'Planning' },
  { value: 'tried', label: 'Tried' },
];

export const ACTIVITY_STATUS_LABEL_MAP = ACTIVITY_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const ADDED_BY_OPTIONS = [
  { value: 'James', label: 'James' },
  { value: 'Gurleen', label: 'Gurleen' },
];
