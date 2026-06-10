import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import PasswordGate from './components/PasswordGate';
import Navigation from './components/Navigation';
import Discover from './pages/Discover';
import Watchlist from './pages/Watchlist';
import { getStoredPassword } from './utils/password';
import { api } from './utils/api';

export default function App() {
  const [hasPassword] = useState(() => Boolean(getStoredPassword()));
  const [activeTab, setActiveTab] = useState('discover');
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

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

  useEffect(() => {
    if (hasPassword) loadWatchlist();
  }, [hasPassword, loadWatchlist]);

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

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'discover' ? (
          <Discover watchlist={watchlist} onWatchlistChange={loadWatchlist} />
        ) : (
          <Watchlist watchlist={watchlist} loading={watchlistLoading} onChange={loadWatchlist} />
        )}
      </main>
    </div>
  );
}
