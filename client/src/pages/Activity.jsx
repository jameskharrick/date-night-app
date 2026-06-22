import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import ActivityItem from '../components/ActivityItem';
import AddActivityForm from '../components/AddActivityForm';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { ACTIVITY_STATUS_OPTIONS } from '../utils/constants';

export default function Activity({ activities, loading, onChange }) {
  const [activeStatus, setActiveStatus] = useState(ACTIVITY_STATUS_OPTIONS[0].value);
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleAddActivity(activityData) {
    try {
      await api.addActivity(activityData);
      toast.success('Activity added');
      onChange();
    } catch (err) {
      toast.error(`Failed to add activity: ${err.message}`);
    }
  }

  async function handleUpdate(id, updates) {
    try {
      await api.updateActivity(id, updates);
      toast.success('Activity updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to update: ${err.message}`);
    }
  }

  async function handleRemove(id) {
    try {
      await api.removeActivity(id);
      toast.success('Activity removed');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  }

  if (loading && activities.length === 0) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Your Activities</h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4">
          <AddActivityForm onAdd={handleAddActivity} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
          <p className="text-lg">No activities yet.</p>
          <p className="text-sm mt-1">Start adding things you'd like to try together.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 bg-slate-900 rounded-lg p-1 mb-4 overflow-x-auto">
            {ACTIVITY_STATUS_OPTIONS.map((opt) => {
              const count = activities.filter((a) => a.status === opt.value).length;
              const active = activeStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveStatus(opt.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                    active ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  {opt.label} <span className={active ? 'text-slate-800' : 'text-slate-500'}>({count})</span>
                </button>
              );
            })}
          </div>

          {(() => {
            const activeActivities = activities.filter((a) => a.status === activeStatus);

            if (activeActivities.length === 0) {
              return (
                <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
                  <p className="text-lg">Nothing here yet.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {activeActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                    onChange={onChange}
                  />
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
