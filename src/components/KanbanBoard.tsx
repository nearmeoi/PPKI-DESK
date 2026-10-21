import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnId, BoardFilter } from '../types';
import { COLUMNS } from '../lib/constants';
import { storage } from '../lib/storage';
import { Column } from './Column';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { Layers } from 'lucide-react';

interface KanbanBoardProps {
  cards: CardItemType[];
  filters: BoardFilter;
  onCardsChange: (cards: CardItemType[]) => void;
  onCardClick: (card: CardItemType) => void;
  onAddCardClick: (columnId: ColumnId) => void;
  onLogActivity: (cardId: string, action: string) => void;
  onFilterUserChange?: (userId: string) => void;
}

const TAB_ACTIVE_STYLES: Record<ColumnId, string> = {
  todo: 'bg-slate-700 text-white border-slate-700 shadow-xs',
  in_progress: 'bg-indigo-600 text-white border-indigo-600 shadow-xs',
  review: 'bg-amber-600 text-white border-amber-600 shadow-xs',
  done: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
};

export function KanbanBoard({
  cards,
  filters,
  onCardsChange,
  onCardClick,
  onAddCardClick,
  onLogActivity,
  onFilterUserChange,
}: KanbanBoardProps) {
  const { currentUser, users, avatarColorOf } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ColumnId | 'all'>('all');

  // Filter cards
  const filtered = cards.filter((card) => {
    const q = filters.searchQuery.trim().toLowerCase();
    if (q && !card.title.toLowerCase().includes(q) && !card.description.toLowerCase().includes(q)) {
      return false;
    }
    if (filters.assignedToUserId === 'me' && (!currentUser || !card.assignedTo.includes(currentUser.id))) {
      return false;
    }
    if (
      filters.assignedToUserId !== 'all' &&
      filters.assignedToUserId !== 'me' &&
      !card.assignedTo.includes(filters.assignedToUserId)
    ) {
      return false;
    }
    if (filters.selectedLabel !== 'all' && !card.labels.includes(filters.selectedLabel)) {
      return false;
    }
    return true;
  });

  // Handle Drag & Drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcColId  = source.droppableId as ColumnId;
    const destColId = destination.droppableId as ColumnId;
    const movedCard = cards.find((c) => c.id === draggableId);
    if (!movedCard) return;

    const updated = [...cards];

    if (srcColId === destColId) {
      const colCards = updated.filter((c) => c.columnId === srcColId).sort((a, b) => a.orderIndex - b.orderIndex);
      const [removed] = colCards.splice(source.index, 1);
      colCards.splice(destination.index, 0, removed);
      colCards.forEach((c, i) => {
        const t = updated.find((x) => x.id === c.id);
        if (t) t.orderIndex = i;
      });
    } else {
      // 1. Re-index source column without the moved card
      const srcCards = updated
        .filter((c) => c.columnId === srcColId && c.id !== draggableId)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      srcCards.forEach((c, i) => {
        const item = updated.find((x) => x.id === c.id);
        if (item) item.orderIndex = i;
      });

      // 2. Insert into destination column at destination.index and re-index
      const destCards = updated
        .filter((c) => c.columnId === destColId && c.id !== draggableId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      const target = updated.find((c) => c.id === draggableId);
      if (target) {
        target.columnId = destColId;
        target.updatedAt = new Date().toISOString();
        destCards.splice(destination.index, 0, target);
        destCards.forEach((c, i) => {
          const item = updated.find((x) => x.id === c.id);
          if (item) item.orderIndex = i;
        });
      }

      const srcTitle  = COLUMNS.find((c) => c.id === srcColId)?.title  ?? srcColId;
      const destTitle = COLUMNS.find((c) => c.id === destColId)?.title ?? destColId;
      onLogActivity(draggableId, `memindahkan tugas dari "${srcTitle}" ke "${destTitle}"`);
      toast(`Tugas dipindahkan ke ${destTitle}`);
    }

    onCardsChange(updated);
    storage.saveCards(updated);
  };

  // Quick move fallback
  const handleQuickMove = (cardId: string, destColId: ColumnId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === destColId) return;
    const srcTitle  = COLUMNS.find((c) => c.id === card.columnId)?.title ?? card.columnId;
    const destTitle = COLUMNS.find((c) => c.id === destColId)?.title     ?? destColId;
    const updated   = cards.map((c) =>
      c.id === cardId ? { ...c, columnId: destColId, updatedAt: new Date().toISOString() } : c
    );
    onLogActivity(cardId, `memindahkan tugas dari "${srcTitle}" ke "${destTitle}"`);
    toast(`Tugas dipindahkan ke ${destTitle}`);
    onCardsChange(updated);
    storage.saveCards(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3.5 gap-3.5 bg-slate-50/40">
      {/* Column Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {/* All Tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
            activeTab === 'all'
              ? 'bg-white text-slate-900 border-slate-300 shadow-xs font-bold'
              : 'bg-white/70 text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-white',
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua</span>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
              activeTab === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-400',
            )}
          >
            {filtered.length}
          </span>
        </button>

        {/* Individual Columns Tab with Distinct Status Accent */}
        {COLUMNS.map((col) => {
          const count    = filtered.filter((c) => c.columnId === col.id).length;
          const isActive = activeTab === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveTab(col.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                isActive
                  ? TAB_ACTIVE_STYLES[col.id]
                  : 'bg-white/70 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-white',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shadow-2xs', col.accentColor)} />
              <span>{col.title}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Team Member Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
          Anggota:
        </span>
        <button
          onClick={() => onFilterUserChange && onFilterUserChange('all')}
          className={cn(
            'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex-shrink-0',
            filters.assignedToUserId === 'all'
              ? 'bg-slate-800 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Semua
        </button>
        {users.map((u) => {
          const isSelected = filters.assignedToUserId === u.id;
          return (
            <button
              key={u.id}
              onClick={() => onFilterUserChange && onFilterUserChange(isSelected ? 'all' : u.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex-shrink-0',
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
              )}
            >
              <Avatar
                name={u.name}
                initials={u.avatar}
                colorClass={avatarColorOf(u.id)}
                size="xs"
              />
              <span>{u.name}</span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Columns View */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex flex-col sm:flex-row gap-3.5 overflow-x-auto pb-4 no-scrollbar">
          {COLUMNS.map((col) => {
            if (activeTab !== 'all' && activeTab !== col.id) return null;
            const colCards = filtered
              .filter((c) => c.columnId === col.id)
              .sort((a, b) => a.orderIndex - b.orderIndex);
            return (
              <Column
                key={col.id}
                column={col}
                cards={colCards}
                onCardClick={onCardClick}
                onAddCardClick={onAddCardClick}
                onMoveColumn={handleQuickMove}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
