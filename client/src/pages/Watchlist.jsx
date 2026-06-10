import { useState } from 'react';
import toast from 'react-hot-toast';
import WatchlistItem from '../components/WatchlistItem';
import StatsPanel from '../components/StatsPanel';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { seenKey } from '../utils/seen';

export default function Watchlist({ watchlist, loading, onChange, seenStatus, onToggleSeen }) {
  const [hideSeenJames, setHideSeenJames] = useState(false);
  const [hideSeenGurleen, setHideSeenGurleen] = useState(false);

  const visibleWatchlist = watchlist.filter((item) => {
    const seen = seenStatus[seenKey(item)];
    if (!seen) return true;
    if (hideSeenJames && seen.seen_james) return false;
    if (hideSeenGurleen && seen.seen_gurleen) return false;
    return true;
  });

  async function handleUpdate(id, updates) {
    try {
      await api.updateWatchlistItem(id, updates);
      toast.success('Watchlist updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to update: ${err.message}`);
    }
  }

  async function handleRemove(id) {
    try {
      await api.removeFromWatchlist(id);
      toast.success('Removed from watchlist');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Your Watchlist</h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Hide seen by:</span>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hideSeenJames}
                onChange={(e) => setHideSeenJames(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
              />
              James
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hideSeenGurleen}
                onChange={(e) => setHideSeenGurleen(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
              />
              Gurleen
            </label>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-lg">Your watchlist is empty.</p>
            <p className="text-sm mt-1">Head to Discover to find something to watch together.</p>
          </div>
        ) : visibleWatchlist.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-lg">Nothing to show with these filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleWatchlist.map((item) => (
              <WatchlistItem
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                seen={seenStatus[seenKey(item)]}
                onToggleSeen={onToggleSeen}
              />
            ))}
          </div>
        )}
      </section>

      <aside>
        <StatsPanel watchlist={watchlist} />
      </aside>
    </div>
  );
}
