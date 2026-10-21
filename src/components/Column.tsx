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
    <div
      className={cn(
        'flex flex-col flex-1 min-w-[280px] max-w-full rounded-2xl border shadow-2xs overflow-hidden transition-all duration-150',
        column.containerBg,
        column.containerBorder,
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between px-3.5 py-3',
          column.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs', column.accentColor)} />
          <h2 className="text-xs font-bold text-slate-800 tracking-wide">
            {column.title}
          </h2>
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs',
              column.badgeBg,
              column.badgeText,
            )}
          >
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddCardClick(column.id)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors shadow-2xs"
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
              snapshot.isDraggingOver && cn('rounded-xl', column.dropHighlight),
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
                className="w-full h-24 border border-dashed border-slate-300/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-white/60 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-slate-700" />
                <span className="text-[11px] font-semibold">Tambah tugas</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
