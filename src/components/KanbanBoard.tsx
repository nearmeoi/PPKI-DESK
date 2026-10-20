import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnStatus, BoardFilter } from '../types';
import { INITIAL_COLUMNS } from '../lib/mockData';
import { Column } from './Column';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../lib/storage';
import { Layers } from 'lucide-react';

interface KanbanBoardProps {
  cards: CardItemType[];
  filters: BoardFilter;
  onCardsChange: (newCards: CardItemType[]) => void;
  onCardClick: (card: CardItemType) => void;
  onAddCardClick: (columnId: ColumnStatus) => void;
  onLogActivity: (cardId: string, action: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  filters,
  onCardsChange,
  onCardClick,
  onAddCardClick,
  onLogActivity,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ColumnStatus | 'all'>('all');

  // Filter cards according to active search, assignee, and label
  const filteredCards = cards.filter((card) => {
    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchDesc = card.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Assignee
    if (filters.assignedToUserId === 'me') {
      if (!card.assignedTo.includes(currentUser.id)) return false;
    } else if (filters.assignedToUserId !== 'all') {
      if (!card.assignedTo.includes(filters.assignedToUserId)) return false;
    }

    // 3. Label
    if (filters.selectedLabel !== 'all') {
      if (!card.labels.includes(filters.selectedLabel)) return false;
    }

    return true;
  });

  // Handle Drag & Drop completion
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColId = source.droppableId as ColumnStatus;
    const destColId = destination.droppableId as ColumnStatus;

    const sourceColumnCards = cards
      .filter((c) => c.columnId === sourceColId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const movedCard = cards.find((c) => c.id === draggableId);
    if (!movedCard) return;

    const updatedCards = [...cards];

    if (sourceColId === destColId) {
      // Reorder within the same column
      const newColCards = Array.from(sourceColumnCards);
      const [reorderedItem] = newColCards.splice(source.index, 1);
      newColCards.splice(destination.index, 0, reorderedItem);

      // Re-assign order index
      newColCards.forEach((c, idx) => {
        const target = updatedCards.find((x) => x.id === c.id);
        if (target) target.orderIndex = idx;
      });
    } else {
      // Moving to different column
      const targetCard = updatedCards.find((c) => c.id === draggableId);
      if (targetCard) {
        targetCard.columnId = destColId;
        targetCard.updatedAt = new Date().toISOString();
      }

      // Log activity
      const sourceTitle = INITIAL_COLUMNS.find((c) => c.id === sourceColId)?.title || sourceColId;
      const destTitle = INITIAL_COLUMNS.find((c) => c.id === destColId)?.title || destColId;
      onLogActivity(movedCard.id, `memindahkan tugas dari ${sourceTitle} ke ${destTitle}`);
    }

    onCardsChange(updatedCards);
    storageService.saveCards(updatedCards);
  };

  // Quick Move Card (fallback without drag & drop, especially for mobile)
  const handleQuickMove = (cardId: string, targetColumn: ColumnStatus) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === targetColumn) return;

    const sourceTitle = INITIAL_COLUMNS.find((c) => c.id === card.columnId)?.title || card.columnId;
    const destTitle = INITIAL_COLUMNS.find((c) => c.id === targetColumn)?.title || targetColumn;

    const updatedCards = cards.map((c) =>
      c.id === cardId
        ? { ...c, columnId: targetColumn, updatedAt: new Date().toISOString() }
        : c
    );

    onLogActivity(card.id, `memindahkan tugas dari ${sourceTitle} ke ${destTitle}`);
    onCardsChange(updatedCards);
    storageService.saveCards(updatedCards);
  };

  return (
    <div className="flex-1 flex flex-col p-3 space-y-3">
      {/* Column Switcher Tab Bar (Mobile First Navigation) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua Kolom</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
            {filteredCards.length}
          </span>
        </button>

        {INITIAL_COLUMNS.map((col) => {
          const count = filteredCards.filter((c) => c.columnId === col.id).length;
          const isActive = activeTab === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveTab(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <span>{col.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Droppable Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex flex-col sm:flex-row gap-3 overflow-x-auto pb-6 no-scrollbar">
          {INITIAL_COLUMNS.map((col) => {
            // If user selected a specific tab on mobile, show only that column
            if (activeTab !== 'all' && activeTab !== col.id) {
              return null;
            }

            const colCards = filteredCards
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
};
