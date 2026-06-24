import { useState } from 'react';
import { Star, Plus, X, ExternalLink, Check, Gamepad2 } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import GenreTag from './GenreTag';
import { STATUS_OPTIONS, GAME_STATUS_OPTIONS } from '../utils/constants';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w300';

export default function RecommendationCard({
  item,
  onAdd,
  onNotInterested,
  isAdded,
  seen,
  onToggleSeen,
  isGameMode,
  played,
  onTogglePlayed,
}) {
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const tmdbUrl = !isGameMode
    ? `https://www.themoviedb.org/${item.type}/${item.tmdb_id}`
    : null;
  const igdbUrl = isGameMode
    ? `https://www.igdb.com/games/${item.igdb_id}`
    : null;

  const coverSrc = isGameMode
    ? item.cover_path
    : item.poster_path
      ? `${POSTER_BASE}${item.poster_path}`
      : null;

  const score = isGameMode ? item.igdb_score : item.tmdb_score;

  const statusOptions = isGameMode ? GAME_STATUS_OPTIONS : STATUS_OPTIONS;

  function handleAddClick() {
    setShowStatusPicker(true);
  }

  function handleStatusPick(status) {
    setShowStatusPicker(false);
    onAdd(item, status);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-amber-400/50 transition shadow-lg">
      <div className="aspect-[2/3] bg-slate-700 relative">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center bg-slate-700">
            <span className="text-slate-300 font-semibold">{item.title}</span>
          </div>
        )}

        {typeof score === 'number' && score > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            {score.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-slate-100 leading-tight">{item.title}</h3>
          <p className="text-xs text-slate-400">{item.year || 'Unknown year'}</p>
        </div>

        {item.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.genres.slice(0, 3).map((g) => (
              <GenreTag key={g} name={g} />
            ))}
          </div>
        )}

        {item.platforms?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.platforms.map((p) => (
              <PlatformBadge key={p} name={p} />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          {/* Seen / Played by buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => isGameMode ? onTogglePlayed(item, 'james') : onToggleSeen(item, 'james')}
              className={`flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition ${
                (isGameMode ? played?.played_james : seen?.seen_james)
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {(isGameMode ? played?.played_james : seen?.seen_james) && <Check className="w-3.5 h-3.5" />} James
            </button>

            <button
              onClick={() => isGameMode ? onTogglePlayed(item, 'gurleen') : onToggleSeen(item, 'gurleen')}
              className={`flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition ${
                (isGameMode ? played?.played_gurleen : seen?.seen_gurleen)
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {(isGameMode ? played?.played_gurleen : seen?.seen_gurleen) && <Check className="w-3.5 h-3.5" />} Gurleen
            </button>
          </div>

          {/* Add button / status picker */}
          {showStatusPicker ? (
            <div className="flex flex-col gap-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusPick(opt.value)}
                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setShowStatusPicker(false)}
                className="w-full text-xs font-medium px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              disabled={isAdded}
              className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : isGameMode ? (
                <>
                  <Gamepad2 className="w-4 h-4" /> Add to games list
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add to watchlist
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onNotInterested(item)}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            <X className="w-4 h-4" /> Not interested
          </button>

          {(tmdbUrl || igdbUrl) && (
            <a
              href={tmdbUrl || igdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              <ExternalLink className="w-4 h-4" /> {isGameMode ? 'View on IGDB' : 'View on TMDB'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
