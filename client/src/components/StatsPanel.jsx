function safeParse(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function StatsPanel({ watchlist }) {
  const watched = watchlist.filter((w) => w.status === 'watched');
  const completed = watchlist.filter((w) => w.status === 'watched' || w.status === 'dropped');

  const scored = watchlist.filter((w) => w.personal_score !== null && w.personal_score !== undefined);
  const avgScore =
    scored.length > 0
      ? (scored.reduce((sum, w) => sum + Number(w.personal_score), 0) / scored.length).toFixed(1)
      : null;

  const genreCounts = {};
  watched.forEach((w) => {
    safeParse(w.genres).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const recentCompletions = [...completed]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-5">
      <h2 className="text-lg font-semibold text-slate-200">Stats</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{watched.length}</p>
          <p className="text-xs text-slate-400 mt-1">Watched</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{avgScore ?? '–'}</p>
          <p className="text-xs text-slate-400 mt-1">Avg. Score</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Top Genres</h3>
        {topGenres.length > 0 ? (
          <ul className="space-y-1">
            {topGenres.map((g, i) => (
              <li key={g} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No watched titles yet</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Recent Completions</h3>
        {recentCompletions.length > 0 ? (
          <ul className="space-y-1.5">
            {recentCompletions.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-slate-300 truncate">{item.title}</span>
                <span className="text-slate-500 text-xs flex-shrink-0">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No completions yet</p>
        )}
      </div>
    </div>
  );
}
