import { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Trash2, Star, Pencil, RefreshCw, User } from 'lucide-react';
import ActivityMediaGallery from './ActivityMediaGallery';
import { api } from '../utils/api';
import { ACTIVITY_STATUS_OPTIONS, ADDED_BY_OPTIONS } from '../utils/constants';

const inputClass =
  'bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

export default function ActivityItem({ activity, onUpdate, onRemove, onChange }) {
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(activity.notes || '');
  const [refreshingPhoto, setRefreshingPhoto] = useState(false);

  const [editName, setEditName] = useState(activity.name);
  const [editLocation, setEditLocation] = useState(activity.location || '');
  const [editJustification, setEditJustification] = useState(activity.justification || '');
  const [editAddedBy, setEditAddedBy] = useState(activity.added_by || '');

  const isTried = activity.status === 'tried';

  function handleStatusChange(status) {
    onUpdate(activity.id, { status });
  }

  function handleRatingChange(e) {
    const value = e.target.value === '' ? null : Number(e.target.value);
    onUpdate(activity.id, { rating: value });
  }

  function handleNotesBlur() {
    if (notes !== (activity.notes || '')) {
      onUpdate(activity.id, { notes });
    }
  }

  async function handleRefreshPhoto() {
    setRefreshingPhoto(true);
    try {
      await api.refreshActivityPhoto(activity.id);
      toast.success('Photo updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to refresh photo: ${err.message}`);
    } finally {
      setRefreshingPhoto(false);
    }
  }

  function handleRemove() {
    if (window.confirm(`Remove "${activity.name}" from your activities?`)) {
      onRemove(activity.id);
    }
  }

  function handleEditSave() {
    if (!editName.trim()) return;
    onUpdate(activity.id, {
      name: editName.trim(),
      location: editLocation.trim() || null,
      justification: editJustification.trim() || null,
      added_by: editAddedBy || null,
    });
    setEditing(false);
  }

  function handleEditCancel() {
    setEditName(activity.name);
    setEditLocation(activity.location || '');
    setEditJustification(activity.justification || '');
    setEditAddedBy(activity.added_by || '');
    setEditing(false);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
      <div className="relative">
        {activity.photo_url ? (
          <img src={activity.photo_url} alt={activity.name} className="w-full h-32 object-cover" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Activity name *"
                className={inputClass}
              />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Location"
                className={inputClass}
              />
            </div>
            <input
              type="text"
              value={editJustification}
              onChange={(e) => setEditJustification(e.target.value)}
              placeholder="Why do you want to try this?"
              className={`w-full ${inputClass}`}
            />
            <select
              value={editAddedBy}
              onChange={(e) => setEditAddedBy(e.target.value)}
              className={`w-full ${inputClass}`}
            >
              <option value="">Added by...</option>
              {ADDED_BY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleEditCancel}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editName.trim()}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 truncate">{activity.name}</h3>
              {activity.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400 truncate">{activity.location}</p>
                </div>
              )}
              {activity.justification && (
                <p className="text-xs text-slate-400 italic mt-1 line-clamp-2">"{activity.justification}"</p>
              )}
              {activity.added_by && (
                <div className="flex items-center gap-1 mt-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">Added by {activity.added_by}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 transition" aria-label="Edit activity">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={handleRemove} className="text-slate-500 hover:text-red-400 transition" aria-label="Remove activity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ACTIVITY_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                activity.status === opt.value
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {isTried && (
            <label className="flex items-center gap-1.5 text-sm text-slate-300">
              <Star className="w-4 h-4 text-amber-400" />
              <select value={activity.rating ?? ''} onChange={handleRatingChange} className={inputClass}>
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
              placeholder="Add notes about this activity..."
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
          <ActivityMediaGallery activityId={activity.id} media={activity.activity_media} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
