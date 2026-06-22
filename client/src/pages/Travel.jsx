import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TripItem from '../components/TripItem';
import AddTripForm from '../components/AddTripForm';
import SortableWrapper from '../components/SortableWrapper';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { applyTabReorder } from '../utils/dragHelpers';
import { TRIP_STATUS_OPTIONS } from '../utils/constants';

export default function Travel({ trips, loading, onChange }) {
  const [activeStatus, setActiveStatus] = useState(TRIP_STATUS_OPTIONS[0].value);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderedTrips, setOrderedTrips] = useState(trips);
  const isReorderingRef = useRef(false);

  useEffect(() => { setOrderedTrips(trips); }, [trips]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  async function handleAddTrip(tripData) {
    try {
      await api.addTrip(tripData);
      toast.success('Trip added');
      onChange();
    } catch (err) {
      toast.error(`Failed to add trip: ${err.message}`);
    }
  }

  async function handleUpdate(id, updates) {
    try {
      await api.updateTrip(id, updates);
      toast.success('Trip updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to update: ${err.message}`);
    }
  }

  async function handleRemove(id) {
    try {
      await api.removeTrip(id);
      toast.success('Trip removed');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || isReorderingRef.current) return;
    const tabTrips = orderedTrips.filter((t) => t.status === activeStatus);
    const oldIndex = tabTrips.findIndex((t) => t.id === active.id);
    const newIndex = tabTrips.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const { newAllItems, reorderedIds } = applyTabReorder(orderedTrips, tabTrips, oldIndex, newIndex);
    const previous = orderedTrips;
    setOrderedTrips(newAllItems);
    isReorderingRef.current = true;
    try {
      await api.reorderTrips(reorderedIds);
    } catch {
      toast.error('Failed to save order');
      setOrderedTrips(previous);
    } finally {
      isReorderingRef.current = false;
    }
  }

  if (loading && trips.length === 0) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Your Trips</h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950"
        >
          <Plus className="w-4 h-4" />
          Add Trip
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4">
          <AddTripForm onAdd={handleAddTrip} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {orderedTrips.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
          <p className="text-lg">No trips yet.</p>
          <p className="text-sm mt-1">Start planning your next adventure together.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 bg-slate-900 rounded-lg p-1 mb-4 overflow-x-auto">
            {TRIP_STATUS_OPTIONS.map((opt) => {
              const count = orderedTrips.filter((t) => t.status === opt.value).length;
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
            const activeTrips = orderedTrips.filter((t) => t.status === activeStatus);

            if (activeTrips.length === 0) {
              return (
                <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
                  <p className="text-lg">Nothing here yet.</p>
                </div>
              );
            }

            return (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={activeTrips.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {activeTrips.map((trip) => (
                      <SortableWrapper key={trip.id} id={trip.id}>
                        <TripItem trip={trip} onUpdate={handleUpdate} onRemove={handleRemove} onChange={onChange} />
                      </SortableWrapper>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            );
          })()}
        </>
      )}
    </div>
  );
}
