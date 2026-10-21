import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnId, BoardFilter } from '../types';
import { COLUMNS } from '../lib/constants';
import { storage } from '../lib/storage';
import { Column } from './Column';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Layers } from 'lucide-react';

interface KanbanBoardProps {
  cards: CardItemType[];
  filters: BoardFilter;
  onCardsChange: (cards: CardItemType[]) => void;
  onCardClick: (card: CardItemType) => void;
  onAddCardClick: (columnId: ColumnId) => void;
  onLogActivity: (cardId: string, action: string) => void;
}

export function KanbanBoard({
  cards, filters, onCardsChange, onCardClick, onAddCardClick, onLogActivity,
}: KanbanBoardProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ColumnId | 'all'>('all');

  // ── Filter cards ──────────────────────────────────────────────────────────
  const filtered = cards.filter((card) => {
    const q = filters.searchQuery.trim().toLowerCase();
    if (q && !card.title.toLowerCase().includes(q) && !card.description.toLowerCase().includes(q)) return false;
    if (filters.assignedToUserId === 'me' && !card.assignedTo.includes(currentUser.id)) return false;
    if (filters.assignedToUserId !== 'all' && filters.assignedToUserId !== 'me' && !card.assignedTo.includes(filters.assignedToUserId)) return false;
    if (filters.selectedLabel !== 'all' && !card.labels.includes(filters.selectedLabel)) return false;
    return true;
  });

  // ── Drag End ──────────────────────────────────────────────────────────────
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
      colCards.forEach((c, i) => { const t = updated.find((x) => x.id === c.id); if (t) t.orderIndex = i; });
    } else {
      const target = updated.find((c) => c.id === draggableId);
      if (target) { target.columnId = destColId; target.updatedAt = new Date().toISOString(); }
      const srcTitle  = COLUMNS.find((c) => c.id === srcColId)?.title  ?? srcColId;
      const destTitle = COLUMNS.find((c) => c.id === destColId)?.title ?? destColId;
      onLogActivity(draggableId, `memindahkan tugas dari "${srcTitle}" ke "${destTitle}"`);
    }

    onCardsChange(updated);
    storage.saveCards(updated);
  };

  // ── Quick move (mobile fallback) ──────────────────────────────────────────
  const handleQuickMove = (cardId: string, destColId: ColumnId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === destColId) return;
    const srcTitle  = COLUMNS.find((c) => c.id === card.columnId)?.title ?? card.columnId;
    const destTitle = COLUMNS.find((c) => c.id === destColId)?.title     ?? destColId;
    const updated   = cards.map((c) => c.id === cardId ? { ...c, columnId: destColId, updatedAt: new Date().toISOString() } : c);
    onLogActivity(cardId, `memindahkan tugas dari "${srcTitle}" ke "${destTitle}"`);
    onCardsChange(updated);
    storage.saveCards(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">
      {/* ── Column Tab Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {/* "All" tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
            activeTab === 'all'
              ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
              : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-zinc-200',
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Semua
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
            activeTab === 'all' ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-500',
          )}>{filtered.length}</span>
        </button>

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
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-zinc-200',
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', col.accentColor)} />
              {col.title}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                isActive ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-500',
              )}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Board ── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex flex-col sm:flex-row gap-3 overflow-x-auto pb-4 no-scrollbar">
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
