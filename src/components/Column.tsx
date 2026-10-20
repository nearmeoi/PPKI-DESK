import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnData, ColumnStatus } from '../types';
import { CardItem } from './CardItem';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnData;
  cards: CardItemType[];
  onCardClick: (card: CardItemType) => void;
  onAddCardClick: (columnId: ColumnStatus) => void;
  onMoveColumn: (cardId: string, targetColumn: ColumnStatus) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  cards,
  onCardClick,
  onAddCardClick,
  onMoveColumn,
}) => {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-full bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-3 shadow-inner">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            {column.title}
          </h2>
          <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700/60">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddCardClick(column.id)}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={`Tambah tugas ke ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2.5 min-h-[120px] rounded-xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20 ring-1 ring-indigo-500/30' : ''
            }`}
          >
            {cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                onClick={() => onCardClick(card)}
                onMoveColumn={onMoveColumn}
              />
            ))}
            {provided.placeholder}

            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 border border-dashed border-zinc-800/80 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <p className="text-xs text-zinc-400 font-medium">Tidak ada kartu</p>
                <button
                  onClick={() => onAddCardClick(column.id)}
                  className="mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + Tambah tugas baru
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
