import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnId } from '../types';
import { useAuth } from '../context/AuthContext';
import { LABELS, COLUMNS, PRIORITY_CONFIG } from '../lib/constants';
import { formatDate, isOverdue, cn } from '../lib/utils';
import { AvatarGroup } from './Avatar';
import { Calendar, ArrowRight, MoreHorizontal, AlertTriangle, Lock } from 'lucide-react';

interface CardItemProps {
  card: CardItemType;
  index: number;
  onClick: () => void;
  onMoveColumn: (cardId: string, targetColumnId: ColumnId) => void;
}

export function CardItem({ card, index, onClick, onMoveColumn }: CardItemProps) {
  const { users, currentUser, isAdmin, avatarColorOf } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const canManage     = isAdmin || card.createdBy === currentUser.id;
  const overdueFlag   = card.deadline ? isOverdue(card.deadline, card.columnId) : false;
  const priorityCfg   = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'relative group bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3.5 cursor-pointer',
            'hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-150',
            'border-l-[3px]',
            priorityCfg.border,
            snapshot.isDragging && 'shadow-2xl ring-2 ring-indigo-500/40 scale-[1.02] rotate-[0.5deg]',
          )}
        >
          {/* Labels & menu row */}
          <div className="flex items-start justify-between gap-1.5 mb-2.5">
            <div className="flex flex-wrap gap-1 min-w-0">
              {card.labels.map((lbl) => {
                const cfg = LABELS.find((l) => l.name === lbl);
                return (
                  <span
                    key={lbl}
                    className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none', cfg?.color ?? 'bg-zinc-800 text-zinc-300 border-zinc-700')}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>

            {/* Quick move menu */}
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Pindahkan tugas"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-40 p-1.5 overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1.5 tracking-wider">
                      Pindah ke kolom
                    </p>
                    {COLUMNS.map((col) => {
                      const isCurrent = col.id === card.columnId;
                      return (
                        <button
                          key={col.id}
                          disabled={isCurrent}
                          onClick={() => { onMoveColumn(card.id, col.id); setMenuOpen(false); }}
                          className={cn(
                            'w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors',
                            isCurrent
                              ? 'text-zinc-600 cursor-not-allowed'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn('w-1.5 h-1.5 rounded-full', col.accentColor)} />
                            {col.title}
                          </div>
                          {!isCurrent && <ArrowRight className="w-3 h-3 text-zinc-500" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2 mb-1">
            {card.title}
          </h3>

          {/* Description */}
          {card.description && (
            <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-2.5">
              {card.description}
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-800/50">
            {/* Deadline */}
            {card.deadline ? (
              <div className={cn(
                'flex items-center gap-1 text-[11px] font-medium',
                overdueFlag
                  ? 'text-red-400'
                  : 'text-zinc-500',
              )}>
                {overdueFlag
                  ? <AlertTriangle className="w-3 h-3" />
                  : <Calendar className="w-3 h-3" />
                }
                <span>{formatDate(card.deadline)}</span>
                {overdueFlag && <span className="text-[9px] uppercase font-bold tracking-wide">Terlambat</span>}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-600">Tanpa deadline</span>
            )}

            {/* Right side: lock + avatars */}
            <div className="flex items-center gap-1.5">
              {!canManage && (
                <span title="Hanya pembuat atau admin yang dapat mengubah" className="inline-flex">
                  <Lock className="w-3 h-3 text-zinc-600" />
                </span>
              )}
              <AvatarGroup
                userIds={card.assignedTo}
                users={users}
                avatarColorOf={avatarColorOf}
                max={3}
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
