import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableWrapper({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
      }}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 rounded text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none transition"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
}
