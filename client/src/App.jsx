import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import PasswordGate from './components/PasswordGate';
import Navigation from './components/Navigation';
import Discover from './pages/Discover';
import Watchlist from './pages/Watchlist';
import Travel from './pages/Travel';
import Activity from './pages/Activity';
import { getStoredPassword, clearStoredPassword } from './utils/password';
import { seenKey } from './utils/seen';
import { api } from './utils/api';

export default function App() {
  const [hasPassword] = useState(() => Boolean(getStoredPassword()));
  const [activeTab, setActiveTab] = useState('discover');
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [seenStatus, setSeenStatus] = useState({});

  const loadWatchlist = useCallback(async () => {
    setWatchlistLoading(true);
    try {
      const data = await api.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist:', err.message);
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setTripsLoading(true);
    try {
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err.message);
    } finally {
      setTripsLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const data = await api.getActivities();
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err.message);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const loadSeenStatus = useCallback(async () => {
    try {
      const data = await api.getSeenStatus();
      const map = {};
      for (const row of data) {
        map[seenKey(row)] = { seen_james: row.seen_james, seen_gurleen: row.seen_gurleen };
      }
      setSeenStatus(map);
    } catch (err) {
      console.error('Failed to load seen status:', err.message);
    }
  }, []);

  useEffect(() => {
    if (hasPassword) {
      loadWatchlist();
      loadTrips();
      loadActivities();
      loadSeenStatus();
    }
  }, [hasPassword, loadWatchlist, loadTrips, loadActivities, loadSeenStatus]);

  async function handleToggleSeen(item, person) {
    try {
      const updated = await api.toggleSeen(item.tmdb_id, item.type, person);
      setSeenStatus((prev) => ({
        ...prev,
        [seenKey(updated)]: { seen_james: updated.seen_james, seen_gurleen: updated.seen_gurleen },
      }));
      return updated;
    } catch (err) {
      toast.error(`Failed to update seen status: ${err.message}`);
      return null;
    }
  }

  function handleSignOut() {
    clearStoredPassword();
    window.location.reload();
  }

  if (!hasPassword) {
    return <PasswordGate />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'discover' ? (
          <Discover
            watchlist={watchlist}
            onWatchlistChange={loadWatchlist}
            seenStatus={seenStatus}
            onToggleSeen={handleToggleSeen}
          />
        ) : activeTab === 'watchlist' ? (
          <Watchlist
            watchlist={watchlist}
            loading={watchlistLoading}
            onChange={loadWatchlist}
            seenStatus={seenStatus}
            onToggleSeen={handleToggleSeen}
          />
        ) : activeTab === 'travel' ? (
          <Travel trips={trips} loading={tripsLoading} onChange={loadTrips} />
        ) : (
          <Activity activities={activities} loading={activitiesLoading} onChange={loadActivities} />
        )}
      </main>
    </div>
  );
}
