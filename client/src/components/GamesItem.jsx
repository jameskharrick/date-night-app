import { useState } from 'react';
import { Trash2, Star, Check } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import { GAME_STATUS_OPTIONS } from '../utils/constants';

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

export default function GamesItem({ item, onUpdate, onRemove, played, onTogglePlayed }) {
  const platforms = safeParse(item.platforms);
  const [note, setNote] = useState(item.note || '');

  const showScoreAndNote = item.status === 'played';

  function handleStatusChange(status) {
    onUpdate(item.id, { status });
  }

  function handleScoreChange(e) {
    const value = e.target.value === '' ? null : Number(e.target.value);
    onUpdate(item.id, { personal_score: value });
  }

  function handleNoteBlur() {
    if (note !== (item.note || '')) {
      onUpdate(item.id, { note });
    }
  }

  function handleRemove() {
    if (window.confirm(`Remove "${item.title}" from your games list?`)) {
      onRemove(item.id);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4">
      <div className="w-20 h-28 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
        {item.cover_path ? (
          <img
            src={item.cover_path}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-1 text-center">
            <span className="text-xs text-slate-300 font-medium">{item.title}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-100">{item.title}</h3>
            {item.igdb_score != null && (
              <p className="text-xs text-slate-400">IGDB: {item.igdb_score.toFixed(1)} / 10</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-slate-500 hover:text-red-400 transition flex-shrink-0"
            aria-label="Remove from games list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {platforms.map((p) => (
              <PlatformBadge key={p} name={p} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-0.5">Played by:</span>
          <button
            onClick={() => onTogglePlayed(item, 'james')}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
              played?.played_james
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {played?.played_james && <Check className="w-3 h-3" />} James
          </button>
          <button
            onClick={() => onTogglePlayed(item, 'gurleen')}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
              played?.played_gurleen
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {played?.played_gurleen && <Check className="w-3 h-3" />} Gurleen
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GAME_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                item.status === opt.value
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {showScoreAndNote && (
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <label className="flex items-center gap-1.5 text-sm text-slate-300">
              <Star className="w-4 h-4 text-amber-400" />
              <select
                value={item.personal_score ?? ''}
                onChange={handleScoreChange}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Score</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Add a note..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        {!showScoreAndNote && item.note && (
          <p className="text-sm text-slate-400 italic">"{item.note}"</p>
        )}
      </div>
    </div>
  );
}
