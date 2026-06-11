import { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Trash2, Star, Pencil, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import TripLinksSection from './TripLinksSection';
import TripMediaGallery from './TripMediaGallery';
import { api } from '../utils/api';
import { TRIP_STATUS_OPTIONS } from '../utils/constants';

const inputClass =
  'bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

function formatDateRange(start, end) {
  if (!start && !end) return null;
  const fmt = (d) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start || end);
}

export default function TripItem({ trip, onUpdate, onRemove, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(trip.notes || '');
  const [refreshingPhoto, setRefreshingPhoto] = useState(false);

  const [editCity, setEditCity] = useState(trip.city);
  const [editRegion, setEditRegion] = useState(trip.region || '');
  const [editCountry, setEditCountry] = useState(trip.country || '');
  const [editStart, setEditStart] = useState(trip.start_date || '');
  const [editEnd, setEditEnd] = useState(trip.end_date || '');

  const isVisited = trip.status === 'visited';
  const location = [trip.city, trip.region, trip.country].filter(Boolean).join(', ');
  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  function handleStatusChange(status) {
    onUpdate(trip.id, { status });
  }

  function handleRatingChange(e) {
    const value = e.target.value === '' ? null : Number(e.target.value);
    onUpdate(trip.id, { rating: value });
  }

  function handleNotesBlur() {
    if (notes !== (trip.notes || '')) {
      onUpdate(trip.id, { notes });
    }
  }

  async function handleRefreshPhoto() {
    setRefreshingPhoto(true);
    try {
      await api.refreshTripPhoto(trip.id);
      toast.success('Photo updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to refresh photo: ${err.message}`);
    } finally {
      setRefreshingPhoto(false);
    }
  }

  function handleRemove() {
    if (window.confirm(`Remove "${trip.city}" from your trips?`)) {
      onRemove(trip.id);
    }
  }

  function handleEditSave() {
    if (!editCity.trim()) return;
    onUpdate(trip.id, {
      city: editCity.trim(),
      region: editRegion.trim() || null,
      country: editCountry.trim() || null,
      start_date: editStart || null,
      end_date: editEnd || null,
    });
    setEditing(false);
  }

  function handleEditCancel() {
    setEditCity(trip.city);
    setEditRegion(trip.region || '');
    setEditCountry(trip.country || '');
    setEditStart(trip.start_date || '');
    setEditEnd(trip.end_date || '');
    setEditing(false);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
      <div className="relative">
        {trip.photo_url ? (
          <img src={trip.photo_url} alt={trip.city} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-16 bg-slate-700/50 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-slate-500" />
          </div>
        )}
        <button
          onClick={handleRefreshPhoto}
          disabled={refreshingPhoto}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-slate-200 hover:bg-slate-900/90 hover:text-amber-400 transition disabled:opacity-50"
          aria-label="Get a different photo"
          title="Get a different photo"
        >
          <RefreshCw className={`w-4 h-4 ${refreshingPhoto ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City *" className={inputClass} />
            <input
              type="text"
              value={editRegion}
              onChange={(e) => setEditRegion(e.target.value)}
              placeholder="Region / State"
              className={inputClass}
            />
            <input
              type="text"
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value)}
              placeholder="Country"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className={inputClass} />
            <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleEditCancel}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={!editCity.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 truncate">{location}</h3>
              {dateRange && <p className="text-xs text-slate-400">{dateRange}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 transition" aria-label="Edit trip details">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={handleRemove} className="text-slate-500 hover:text-red-400 transition" aria-label="Remove trip">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {TRIP_STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatusChange(opt.value)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
              trip.status === opt.value
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {isVisited && (
          <label className="flex items-center gap-1.5 text-sm text-slate-300">
            <Star className="w-4 h-4 text-amber-400" />
            <select value={trip.rating ?? ''} onChange={handleRatingChange} className={inputClass}>
              <option value="">Rating</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              handleNotesBlur();
              setEditingNotes(false);
            }}
            placeholder="Add notes about this trip..."
            rows={2}
            autoFocus
            className={`flex-1 ${inputClass}`}
          />
        ) : (
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <p className="text-sm text-slate-400 italic flex-1 min-w-0">
              {notes ? `"${notes}"` : 'No notes yet.'}
            </p>
            <button
              onClick={() => setEditingNotes(true)}
              className="text-slate-500 hover:text-slate-300 transition flex-shrink-0"
              aria-label="Edit notes"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-700">
        <TripMediaGallery tripId={trip.id} media={trip.trip_media} onChange={onChange} />
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition self-start"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Hide links' : 'Show links'}
      </button>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-slate-700">
          <TripLinksSection tripId={trip.id} links={trip.trip_links} onChange={onChange} />
        </div>
      )}
      </div>
    </div>
  );
}
