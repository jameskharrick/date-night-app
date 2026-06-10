import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, onClear, loading }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for a movie or show..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg px-4 text-sm transition"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
