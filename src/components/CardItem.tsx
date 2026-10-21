import { Draggable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnId } from '../types';
import { PRIORITY_CONFIG, getCardPastelTheme } from '../lib/constants';
import { cn } from '../lib/utils';

interface CardItemProps {
  card: CardItemType;
  index: number;
  onClick: () => void;
  onMoveColumn?: (cardId: string, targetColumnId: ColumnId) => void;
}

export function CardItem({ card, index, onClick }: CardItemProps) {
  const priorityCfg = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.medium;
  const pastelTheme = getCardPastelTheme(card.id);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'relative group border rounded-xl p-2.5 cursor-pointer shadow-2xs backdrop-blur-xs select-none',
            'transition-[background-color,border-color,box-shadow] duration-150',
            'border-l-[3.5px]',
            pastelTheme.bg,
            pastelTheme.border,
            priorityCfg.border,
            snapshot.isDragging && 'shadow-xl ring-2 ring-indigo-500/50 bg-white z-50 opacity-95'
          )}
        >
          {/* Judul Tugas */}
          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
            {card.title}
          </h3>

          {/* Deskripsi Singkat */}
          {card.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
