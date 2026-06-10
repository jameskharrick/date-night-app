import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Shuffle } from 'lucide-react';
import FilterPanel from '../components/FilterPanel';
import RecommendationCard from '../components/RecommendationCard';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { pickRandomSubset } from '../utils/shuffle';
import { CURRENT_YEAR, DEFAULT_YEAR_FROM } from '../utils/constants';

const DEFAULT_FILTERS = {
  type: 'both',
  genres: [],
  platforms: [],
  minScore: 0,
  yearFrom: DEFAULT_YEAR_FROM,
  yearTo: CURRENT_YEAR,
  surpriseMe: false,
};

export default function Discover({ watchlist, onWatchlistChange }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [genreOptions, setGenreOptions] = useState({ movie: [], tv: [] });
  const [pool, setPool] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    api
      .getGenres()
      .then(setGenreOptions)
      .catch((err) => toast.error(`Failed to load genres: ${err.message}`));
  }, []);

  async function handleFindMovies() {
    setLoading(true);
    try {
      const params = {
        type: filters.type,
        surpriseMe: filters.surpriseMe ? 'true' : 'false',
      };

      if (!filters.surpriseMe) {
        if (filters.genres.length > 0) params.genres = filters.genres.join(',');
        if (filters.platforms.length > 0) params.platforms = filters.platforms.join(',');
        params.minScore = filters.minScore;
        params.yearFrom = filters.yearFrom;
        params.yearTo = filters.yearTo;
      }

      const results = await api.getRecommendations(params);
      setPool(results);
      setDisplayed(pickRandomSubset(results));
      setHasSearched(true);

      if (results.length === 0) {
        toast('No matches found. Try adjusting your filters.', { icon: '🔍' });
      }
    } catch (err) {
      toast.error(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReshuffle() {
    setDisplayed(pickRandomSubset(pool));
  }

  function handleNotInterested(item) {
    setPool((prev) => prev.filter((p) => !(p.tmdb_id === item.tmdb_id && p.type === item.type)));
    setDisplayed((prev) =>
      prev.filter((p) => !(p.tmdb_id === item.tmdb_id && p.type === item.type))
    );
  }

  async function handleAdd(item) {
    try {
      await api.addToWatchlist({
        tmdb_id: item.tmdb_id,
        type: item.type,
        title: item.title,
        poster_path: item.poster_path,
        genres: item.genres,
        platforms: item.platforms,
        tmdb_score: item.tmdb_score,
      });
      toast.success(`Added "${item.title}" to watchlist`);
      onWatchlistChange();
    } catch (err) {
      toast.error(`Failed to add: ${err.message}`);
    }
  }

  function isAdded(item) {
    return watchlist.some((w) => w.tmdb_id === item.tmdb_id && w.type === item.type);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onSubmit={handleFindMovies}
          genreOptions={genreOptions}
          loading={loading}
        />
      </aside>

      <section>
        {loading && <Spinner />}

        {!loading && !hasSearched && (
          <div className="text-center text-slate-400 py-20">
            <p className="text-lg">Set your filters and hit "Find movies" to get started.</p>
          </div>
        )}

        {!loading && hasSearched && displayed.length === 0 && (
          <div className="text-center text-slate-400 py-20">
            <p className="text-lg">No results. Try different filters.</p>
          </div>
        )}

        {!loading && displayed.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Recommendations</h2>
              <button
                onClick={handleReshuffle}
                className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                <Shuffle className="w-4 h-4" /> Reshuffle
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((item) => (
                <RecommendationCard
                  key={`${item.type}-${item.tmdb_id}`}
                  item={item}
                  onAdd={handleAdd}
                  onNotInterested={handleNotInterested}
                  isAdded={isAdded(item)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
