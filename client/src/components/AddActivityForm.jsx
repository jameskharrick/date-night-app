import { useState } from 'react';
import { ADDED_BY_OPTIONS } from '../utils/constants';

const inputClass =
  'bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

export default function AddActivityForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [justification, setJustification] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        location: location.trim() || undefined,
        justification: justification.trim() || undefined,
        added_by: addedBy || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setLocation('');
      setJustification('');
      setAddedBy('');
      setNotes('');
      onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">Add an Activity</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Activity name *"
          required
          className={inputClass}
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className={inputClass}
        />
      </div>

      <input
        type="text"
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Why do you want to try this?"
        className={`w-full ${inputClass}`}
      />

      <select
        value={addedBy}
        onChange={(e) => setAddedBy(e.target.value)}
        className={`w-full ${inputClass}`}
      >
        <option value="">Added by...</option>
        {ADDED_BY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes..."
        rows={2}
        className={`w-full ${inputClass}`}
      />

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Activity
        </button>
      </div>
    </form>
  );
}
