import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Map, Hotel, Plane, Car, Utensils, Compass, Plus, Pencil, Trash2, ExternalLink, Check, X, Save } from 'lucide-react';
import { TRIP_LINK_CATEGORIES } from '../utils/constants';
import { api } from '../utils/api';

const CATEGORY_ICONS = {
  itinerary: Map,
  lodging: Hotel,
  flight: Plane,
  car_rental: Car,
  dining: Utensils,
  activity: Compass,
};

const inputClass =
  'flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

function LinkRow({ link, onChange }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);

  async function handleSave() {
    if (!label.trim() || !url.trim()) return;
    try {
      await api.updateTripLink(link.id, { label: label.trim(), url: url.trim() });
      toast.success('Link updated');
      setEditing(false);
      onChange();
    } catch (err) {
      toast.error(`Failed to update link: ${err.message}`);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove "${link.label}"?`)) return;
    try {
      await api.removeTripLink(link.id);
      toast.success('Link removed');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove link: ${err.message}`);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col sm:flex-row gap-1.5">
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className={inputClass} />
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputClass} />
        <div className="flex gap-1 justify-end">
          <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300 transition" aria-label="Save link">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-300 transition" aria-label="Cancel edit">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition truncate min-w-0"
      >
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{link.label}</span>
      </a>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 transition" aria-label="Edit link">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDelete} className="text-slate-500 hover:text-red-400 transition" aria-label="Remove link">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddLinkForm({ category, onAdd, onCancel }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ category, label: label.trim(), url: url.trim() });
      setLabel('');
      setUrl('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-1.5">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (e.g. Hilton Downtown)"
        className={inputClass}
      />
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputClass} />
      <div className="flex gap-1 justify-end">
        <button
          type="submit"
          disabled={submitting || !label.trim() || !url.trim()}
          className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TripLinksSection({ tripId, links, onChange }) {
  const [addingCategory, setAddingCategory] = useState(null);
  const [localLinks, setLocalLinks] = useState(links || []);

  useEffect(() => {
    setLocalLinks(links || []);
  }, [links]);

  async function handleAddLink(link) {
    try {
      const created = await api.addTripLink(tripId, link);
      setLocalLinks((prev) => [...prev, created]);
      toast.success('Link added');
    } catch (err) {
      toast.error(`Failed to add link: ${err.message}`);
    }
  }

  const linksByCategory = {};
  localLinks.forEach((link) => {
    if (!linksByCategory[link.category]) linksByCategory[link.category] = [];
    linksByCategory[link.category].push(link);
  });

  const hasAnyLinks = localLinks.length > 0;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300">Links</h4>
      {!hasAnyLinks && <p className="text-sm text-slate-500">No links added yet.</p>}

      {TRIP_LINK_CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.value];
        const catLinks = linksByCategory[cat.value] || [];

        return (
          <div key={cat.value} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </span>
              {addingCategory !== cat.value && (
                <button
                  onClick={() => setAddingCategory(cat.value)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>
            {catLinks.map((link) => (
              <LinkRow key={link.id} link={link} onChange={onChange} />
            ))}
            {addingCategory === cat.value && (
              <AddLinkForm category={cat.value} onAdd={handleAddLink} onCancel={() => setAddingCategory(null)} />
            )}
          </div>
        );
      })}

      <button
        onClick={onChange}
        className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950"
      >
        <Save className="w-4 h-4" />
        Save
      </button>
    </div>
  );
}
