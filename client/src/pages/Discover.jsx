import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FilterPanel from '../components/FilterPanel';
import RecommendationCard from '../components/RecommendationCard';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { seenKey } from '../utils/seen';
import { CURRENT_YEAR, DEFAULT_YEAR_FROM } from '../utils/constants';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  type: 'both',
  genres: [],
  platforms: [],
  minScore: 0,
  yearFrom: DEFAULT_YEAR_FROM,
  yearTo: CURRENT_YEAR,
  surpriseMe: false,
  hideSeenJames: false,
  hideSeenGurleen: false,
};

function Pagination({ page, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>
      <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Discover({ watchlist, onWatchlistChange, seenStatus, onToggleSeen }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [genreOptions, setGenreOptions] = useState({ movie: [], tv: [] });
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    api
      .getGenres()
      .then(setGenreOptions)
      .catch((err) => toast.error(`Failed to load genres: ${err.message}`));
  }, []);

  function isHiddenBySeenFilters(item) {
    const seen = seenStatus[seenKey(item)];
    if (!seen) return false;
    if (filters.hideSeenJames && seen.seen_james) return true;
    if (filters.hideSeenGurleen && seen.seen_gurleen) return true;
    return false;
  }

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

      const fetched = await api.getRecommendations(params);
      const filtered = fetched.filter((item) => !isHiddenBySeenFilters(item));
      setResults(filtered);
      setPage(1);
      setHasSearched(true);

      if (filtered.length === 0) {
        toast('No matches found. Try adjusting your filters.', { icon: '🔍' });
      }
    } catch (err) {
      toast.error(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setSearchLoading(true);
    try {
      const fetched = await api.search({ query: trimmed, type: filters.type });
      const filtered = fetched.filter((item) => !isHiddenBySeenFilters(item));
      setSearchResults(filtered);
      setSearchPage(1);
      setSubmittedQuery(trimmed);

      if (filtered.length === 0) {
        toast('No matches found.', { icon: '🔍' });
      }
    } catch (err) {
      toast.error(`Search failed: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  }

  function handleClearSearch() {
    setSearchQuery('');
    setSubmittedQuery('');
    setSearchResults(null);
    setSearchPage(1);
  }

  function handleNotInterested(item) {
    const matches = (p) => p.tmdb_id === item.tmdb_id && p.type === item.type;
    setResults((prev) => {
      const next = prev.filter((p) => !matches(p));
      const totalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, totalPages));
      return next;
    });
    setSearchResults((prev) => {
      if (!prev) return prev;
      const next = prev.filter((p) => !matches(p));
      const totalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setSearchPage((p) => Math.min(p, totalPages));
      return next;
    });
  }

  async function handleToggleSeen(item, person) {
    const updated = await onToggleSeen(item, person);
    if (!updated) return;

    const shouldHide =
      (filters.hideSeenJames && updated.seen_james) ||
      (filters.hideSeenGurleen && updated.seen_gurleen);

    if (shouldHide) {
      const matches = (p) => p.tmdb_id === item.tmdb_id && p.type === item.type;
      setResults((prev) => {
        const next = prev.filter((p) => !matches(p));
        const totalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, totalPages));
        return next;
      });
      setSearchResults((prev) => {
        if (!prev) return prev;
        const next = prev.filter((p) => !matches(p));
        const totalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setSearchPage((p) => Math.min(p, totalPages));
        return next;
      });
    }
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

  const pagedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedSearch = searchResults?.slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE);

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
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          onClear={handleClearSearch}
          loading={searchLoading}
        />

        {searchLoading && <Spinner />}

        {!searchLoading && searchResults !== null && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Search results for &quot;{submittedQuery}&quot;
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center text-slate-400 py-20">
                <p className="text-lg">No results. Try a different search.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pagedSearch.map((item) => (
                    <RecommendationCard
                      key={`${item.type}-${item.tmdb_id}`}
                      item={item}
                      onAdd={handleAdd}
                      onNotInterested={handleNotInterested}
                      isAdded={isAdded(item)}
                      seen={seenStatus[seenKey(item)]}
                      onToggleSeen={handleToggleSeen}
                    />
                  ))}
                </div>
                <Pagination page={searchPage} total={searchResults.length} onChange={setSearchPage} />
              </>
            )}
          </>
        )}

        {!searchLoading && searchResults === null && (
          <>
            {loading && <Spinner />}

            {!loading && !hasSearched && (
              <div className="text-center text-slate-400 py-20">
                <p className="text-lg">Set your filters and hit "Find something to watch" to get started.</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && (
              <div className="text-center text-slate-400 py-20">
                <p className="text-lg">No results. Try different filters.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-200">Recommendations</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pagedResults.map((item) => (
                    <RecommendationCard
                      key={`${item.type}-${item.tmdb_id}`}
                      item={item}
                      onAdd={handleAdd}
                      onNotInterested={handleNotInterested}
                      isAdded={isAdded(item)}
                      seen={seenStatus[seenKey(item)]}
                      onToggleSeen={handleToggleSeen}
                    />
                  ))}
                </div>
                <Pagination page={page} total={results.length} onChange={setPage} />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
