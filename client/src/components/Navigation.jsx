import { Wine } from 'lucide-react';

const TABS = [
  { id: 'discover', label: 'Discover' },
  { id: 'watchlist', label: 'Watchlist' },
];

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Wine className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl font-bold text-slate-100">James &amp; Gurleen Date Night</h1>
        </div>

        <nav className="flex gap-2 bg-slate-900 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
