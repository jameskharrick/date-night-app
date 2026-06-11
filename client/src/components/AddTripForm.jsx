import { useState } from 'react';

const inputClass =
  'bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400';

export default function AddTripForm({ onAdd, onCancel }) {
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!city.trim()) return;

    setSubmitting(true);
    try {
      await onAdd({
        city: city.trim(),
        region: region.trim() || undefined,
        country: country.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      setCity('');
      setRegion('');
      setCountry('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">Add a Trip</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City *"
          required
          className={inputClass}
        />
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region / State"
          className={inputClass}
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
      </div>

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
          disabled={submitting || !city.trim()}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Trip
        </button>
      </div>
    </form>
  );
}
