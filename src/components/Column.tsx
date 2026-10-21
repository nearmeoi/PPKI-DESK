import { Droppable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnData, ColumnId } from '../types';
import { CardItem } from './CardItem';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnData;
  cards: CardItemType[];
  onCardClick: (card: CardItemType) => void;
  onAddCardClick: (columnId: ColumnId) => void;
  onMoveColumn: (cardId: string, targetColumnId: ColumnId) => void;
}

export function Column({
  column,
  cards,
  onCardClick,
  onAddCardClick,
  onMoveColumn,
}: ColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-full bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-200/70 bg-white/60">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', column.accentColor)} />
          <h2 className="text-xs font-bold text-slate-800 tracking-wide">
            {column.title}
          </h2>
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs',
              cards.length > 0
                ? 'bg-white text-slate-700 border-slate-200'
                : 'bg-slate-100 text-slate-400 border-slate-200/60',
            )}
          >
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddCardClick(column.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={`Tambah tugas ke ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable cards area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2.5 space-y-2.5 min-h-[160px] transition-colors duration-150',
              snapshot.isDraggingOver && 'bg-indigo-50/50 ring-1 ring-indigo-200 rounded-xl',
            )}
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

            {/* Empty state */}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <button
                onClick={() => onAddCardClick(column.id)}
                className="w-full h-24 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white/60 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">Tambah tugas</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
