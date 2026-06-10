import { PLATFORMS, CONTENT_TYPES, CURRENT_YEAR } from '../utils/constants';

export default function FilterPanel({ filters, onChange, onSubmit, genreOptions, loading }) {
  const disabled = filters.surpriseMe;

  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  function toggleGenre(id) {
    const exists = filters.genres.includes(id);
    update({
      genres: exists ? filters.genres.filter((g) => g !== id) : [...filters.genres, id],
    });
  }

  function togglePlatform(name) {
    const exists = filters.platforms.includes(name);
    update({
      platforms: exists
        ? filters.platforms.filter((p) => p !== name)
        : [...filters.platforms, name],
    });
  }

  const genreList = (() => {
    if (filters.type === 'movie') return genreOptions.movie;
    if (filters.type === 'tv') return genreOptions.tv;

    const seen = new Map();
    [...genreOptions.movie, ...genreOptions.tv].forEach((g) => {
      if (!seen.has(g.id)) seen.set(g.id, g);
    });
    return [...seen.values()];
  })();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-6">
      {/* Content type */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Content Type</h3>
        <div className="flex gap-2">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.value}
              type="button"
              disabled={disabled}
              onClick={() => update({ type: ct.value })}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                filters.type === ct.value
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Genre</h3>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {genreList.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-slate-100"
            >
              <input
                type="checkbox"
                checked={filters.genres.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
                disabled={disabled}
                className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Streaming Platform</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = filters.platforms.includes(p.name);
            return (
              <button
                key={p.name}
                type="button"
                disabled={disabled}
                onClick={() => togglePlatform(p.name)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                  active ? p.className + ' border-transparent' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min score */}
      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">
          Minimum TMDB Score: <span className="text-amber-400">{filters.minScore.toFixed(1)}</span>
        </h3>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={filters.minScore}
          disabled={disabled}
          onChange={(e) => update({ minScore: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>

      {/* Year range */}
      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Release Year Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.yearFrom}
            disabled={disabled}
            onChange={(e) => update({ yearFrom: Number(e.target.value) })}
            min="1900"
            max={CURRENT_YEAR}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <span className="text-slate-500">to</span>
          <input
            type="number"
            value={filters.yearTo}
            disabled={disabled}
            onChange={(e) => update({ yearTo: Number(e.target.value) })}
            min="1900"
            max={CURRENT_YEAR}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Hide already seen */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Hide Already Seen</h3>
        <label className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 cursor-pointer">
          <span className="text-sm text-slate-300">Seen by James</span>
          <input
            type="checkbox"
            checked={filters.hideSeenJames}
            onChange={(e) => update({ hideSeenJames: e.target.checked })}
            className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
          />
        </label>
        <label className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 cursor-pointer">
          <span className="text-sm text-slate-300">Seen by Gurleen</span>
          <input
            type="checkbox"
            checked={filters.hideSeenGurleen}
            onChange={(e) => update({ hideSeenGurleen: e.target.checked })}
            className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
          />
        </label>
      </div>

      {/* Surprise me */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5">
        <span className="text-sm font-medium text-slate-300">Surprise me</span>
        <button
          type="button"
          onClick={() => update({ surpriseMe: !filters.surpriseMe })}
          className={`relative w-11 h-6 rounded-full transition ${
            filters.surpriseMe ? 'bg-amber-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              filters.surpriseMe ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg px-4 py-2.5 transition"
      >
        {loading ? 'Searching...' : 'Find something to watch'}
      </button>
    </div>
  );
}
