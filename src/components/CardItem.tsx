import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnId } from '../types';
import { useAuth } from '../context/AuthContext';
import { LABELS, COLUMNS, PRIORITY_CONFIG } from '../lib/constants';
import { formatDate, isOverdue, cn } from '../lib/utils';
import { AvatarGroup } from './Avatar';
import { Calendar, ArrowRight, MoreHorizontal, AlertCircle, Lock } from 'lucide-react';

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
            'relative group bg-white border border-slate-200/90 rounded-2xl p-3.5 cursor-pointer shadow-2xs',
            'hover:border-slate-300 hover:shadow-md transition-all duration-150',
            'border-l-[3.5px]',
            priorityCfg.border,
            snapshot.isDragging && 'shadow-xl ring-2 ring-indigo-500/30 scale-[1.02] bg-white',
          )}
        >
          {/* Labels & Menu Row */}
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="flex flex-wrap gap-1 min-w-0">
              {card.labels.map((lbl) => {
                const cfg = LABELS.find((l) => l.name === lbl);
                return (
                  <span
                    key={lbl}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-tight',
                      cfg?.color ?? 'bg-slate-100 text-slate-700 border-slate-200'
                    )}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>

            {/* Quick move menu button */}
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-80 group-hover:opacity-100"
                title="Pindahkan status kolom"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-1.5 overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1 tracking-wider">
                      Pindah ke:
                    </p>
                    {COLUMNS.map((col) => {
                      const isCurrent = col.id === card.columnId;
                      return (
                        <button
                          key={col.id}
                          disabled={isCurrent}
                          onClick={() => {
                            onMoveColumn(card.id, col.id);
                            setMenuOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs transition-colors',
                            isCurrent
                              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full', col.accentColor)} />
                            <span>{col.title}</span>
                          </div>
                          {!isCurrent && <ArrowRight className="w-3 h-3 text-slate-400" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
            {card.title}
          </h3>

          {/* Description snippet */}
          {card.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
              {card.description}
            </p>
          )}

          {/* Bottom Row: Deadline & Assignees */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-1">
            {/* Deadline */}
            {card.deadline ? (
              <div
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium',
                  overdueFlag
                    ? 'text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md'
                    : 'text-slate-500'
                )}
              >
                {overdueFlag ? (
                  <AlertCircle className="w-3 h-3 text-red-600" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-400" />
                )}
                <span>{formatDate(card.deadline)}</span>
                {overdueFlag && (
                  <span className="text-[9px] font-bold uppercase tracking-wider">Lewat</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">Tanpa deadline</span>
            )}

            {/* Right side: Lock indicator + Avatar Group */}
            <div className="flex items-center gap-1.5">
              {!canManage && (
                <span title="Hanya pembuat atau admin yang dapat mengubah" className="inline-flex text-slate-400">
                  <Lock className="w-3 h-3" />
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
