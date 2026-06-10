import toast from 'react-hot-toast';
import WatchlistItem from '../components/WatchlistItem';
import StatsPanel from '../components/StatsPanel';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';

export default function Watchlist({ watchlist, loading, onChange }) {
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
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Your Watchlist</h2>

        {watchlist.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-lg">Your watchlist is empty.</p>
            <p className="text-sm mt-1">Head to Discover to find something to watch together.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item) => (
              <WatchlistItem
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
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
