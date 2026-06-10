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

export const PLATFORM_CLASS_MAP = PLATFORMS.reduce((acc, p) => {
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
  { value: 'both', label: 'Both' },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const DEFAULT_YEAR_FROM = 2000;
