import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { CardItem as CardItemType, ColumnStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_LABELS, INITIAL_COLUMNS } from '../lib/mockData';
import { 
  Calendar, 
  ArrowRight, 
  Lock, 
  Clock, 
  MoreHorizontal 
} from 'lucide-react';

interface CardItemProps {
  card: CardItemType;
  index: number;
  onClick: () => void;
  onMoveColumn: (cardId: string, targetColumn: ColumnStatus) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  index,
  onClick,
  onMoveColumn,
}) => {
  const { users, currentUser, isAdmin } = useAuth();
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  // Check if current user is allowed to edit/delete
  const canManage = isAdmin || card.createdBy === currentUser.id;

  // Resolve assignees
  const assignedUsers = users.filter((u) => card.assignedTo.includes(u.id));

  // Deadline formatting & status
  let isOverdue = false;
  let deadlineText = '';
  if (card.deadline) {
    const today = new Date().toISOString().split('T')[0];
    isOverdue = card.deadline < today && card.columnId !== 'done';
    const [, month, day] = card.deadline.split('-');
    deadlineText = `${day}/${month}`;
  }

  // Priority indicator color
  const getPriorityBorder = () => {
    switch (card.priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-amber-500';
      case 'medium':
        return 'border-l-indigo-500';
      default:
        return 'border-l-zinc-700';
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-sm hover:border-zinc-700 transition-all border-l-4 ${getPriorityBorder()} ${
            snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500/50 bg-zinc-850 scale-[1.02]' : ''
          }`}
          onClick={onClick}
        >
          {/* Top Label & Action Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1 items-center">
              {card.labels.map((lbl) => {
                const config = AVAILABLE_LABELS.find((l) => l.name === lbl);
                const colorClasses = config?.color || 'bg-zinc-800 text-zinc-300 border-zinc-700';
                return (
                  <span
                    key={lbl}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorClasses}`}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>

            {/* Quick Move Trigger for Mobile & Desktop */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Pindahkan status kolom"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoveMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMoveMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-40 p-1.5 text-xs">
                    <p className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
                      Pindah ke:
                    </p>
                    {INITIAL_COLUMNS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        disabled={col.id === card.columnId}
                        onClick={() => {
                          onMoveColumn(card.id, col.id);
                          setIsMoveMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          col.id === card.columnId
                            ? 'text-zinc-500 cursor-not-allowed bg-zinc-950/40'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <span>{col.title}</span>
                        {col.id !== card.columnId && (
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2 mb-1.5">
            {card.title}
          </h3>

          {/* Description Snippet */}
          {card.description && (
            <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Bottom Meta Row: Deadline & Assignees */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 mt-1">
            {/* Deadline */}
            {card.deadline ? (
              <div
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue
                    ? 'text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40'
                    : 'text-zinc-400'
                }`}
                title={`Batas Waktu: ${card.deadline}`}
              >
                <Calendar className="w-3 h-3" />
                <span>{deadlineText}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>Tanpa batas</span>
              </div>
            )}

            {/* Assignees & Creator lock indicator */}
            <div className="flex items-center gap-1.5">
              {!canManage && (
                <span title="Hanya pembuat atau admin yang dapat mengubah" className="text-zinc-400">
                  <Lock className="w-3 h-3" />
                </span>
              )}

              {assignedUsers.length > 0 ? (
                <div className="flex -space-x-1.5 overflow-hidden">
                  {assignedUsers.map((u) => (
                    <div
                      key={u.id}
                      title={`Ditugaskan ke: ${u.name}`}
                      className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-300 flex items-center justify-center border border-zinc-700 shadow-sm"
                    >
                      {u.avatar || u.name.charAt(0)}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-zinc-400">Unassigned</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
