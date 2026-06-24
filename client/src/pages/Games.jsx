import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import GamesItem from '../components/GamesItem';
import SortableWrapper from '../components/SortableWrapper';
import GameStatsPanel from '../components/GameStatsPanel';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { applyTabReorder } from '../utils/dragHelpers';
import { playedKey } from '../utils/played';
import { GAME_STATUS_OPTIONS } from '../utils/constants';

const PLAYED_FILTER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'played', label: 'Played' },
  { value: 'unplayed', label: 'Unplayed' },
];

export default function Games({ games, loading, onChange, playedStatus, onTogglePlayed }) {
  const [playedFilterJames, setPlayedFilterJames] = useState('any');
  const [playedFilterGurleen, setPlayedFilterGurleen] = useState('any');
  const [activeStatus, setActiveStatus] = useState(GAME_STATUS_OPTIONS[0].value);
  const [orderedGames, setOrderedGames] = useState(games);
  const isReorderingRef = useRef(false);

  useEffect(() => { setOrderedGames(games); }, [games]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const visibleGames = orderedGames.filter((item) => {
    const p = playedStatus[playedKey(item)];
    const playedJames = Boolean(p?.played_james);
    const playedGurleen = Boolean(p?.played_gurleen);

    if (playedFilterJames === 'played' && !playedJames) return false;
    if (playedFilterJames === 'unplayed' && playedJames) return false;
    if (playedFilterGurleen === 'played' && !playedGurleen) return false;
    if (playedFilterGurleen === 'unplayed' && playedGurleen) return false;

    return true;
  });

  async function handleUpdate(id, updates) {
    try {
      await api.updateGame(id, updates);
      toast.success('Games list updated');
      onChange();
    } catch (err) {
      toast.error(`Failed to update: ${err.message}`);
    }
  }

  async function handleRemove(id) {
    try {
      await api.removeFromGames(id);
      toast.success('Removed from games list');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || isReorderingRef.current) return;
    const activeItems = visibleGames.filter((item) => item.status === activeStatus);
    const oldIndex = activeItems.findIndex((i) => i.id === active.id);
    const newIndex = activeItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const { newAllItems, reorderedIds } = applyTabReorder(orderedGames, activeItems, oldIndex, newIndex);
    const previous = orderedGames;
    setOrderedGames(newAllItems);
    isReorderingRef.current = true;
    try {
      await api.reorderGames(reorderedIds);
    } catch {
      toast.error('Failed to save order');
      setOrderedGames(previous);
    } finally {
      isReorderingRef.current = false;
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Your Games</h2>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              Played by James:
              <select
                value={playedFilterJames}
                onChange={(e) => setPlayedFilterJames(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {PLAYED_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              Played by Gurleen:
              <select
                value={playedFilterGurleen}
                onChange={(e) => setPlayedFilterGurleen(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {PLAYED_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {orderedGames.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-lg">Your games list is empty.</p>
            <p className="text-sm mt-1">Head to Discover to find something to play together.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 bg-slate-900 rounded-lg p-1 mb-4 overflow-x-auto">
              {GAME_STATUS_OPTIONS.map((opt) => {
                const count = visibleGames.filter((item) => item.status === opt.value).length;
                const active = activeStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setActiveStatus(opt.value)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}{' '}
                    <span className={active ? 'text-slate-800' : 'text-slate-500'}>({count})</span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const activeItems = visibleGames.filter((item) => item.status === activeStatus);

              if (activeItems.length === 0) {
                return (
                  <div className="text-center text-slate-400 py-20 bg-slate-800 border border-slate-700 rounded-xl">
                    <p className="text-lg">Nothing to show with these filters.</p>
                  </div>
                );
              }

              return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={activeItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {activeItems.map((item) => (
                        <SortableWrapper key={item.id} id={item.id}>
                          <GamesItem
                            item={item}
                            onUpdate={handleUpdate}
                            onRemove={handleRemove}
                            played={playedStatus[playedKey(item)]}
                            onTogglePlayed={onTogglePlayed}
                          />
                        </SortableWrapper>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              );
            })()}
          </>
        )}
      </section>

      <aside>
        <GameStatsPanel games={games} />
      </aside>
    </div>
  );
}
