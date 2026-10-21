import { useState, useMemo } from 'react';
import type { CardItem, ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  CalendarClock,
  FolderKanban,
  LayoutGrid,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TimelineViewProps {
  cards: CardItem[];
  projects: ProjectItem[];
  onCardClick: (card: CardItem) => void;
  onProjectClick: (project: ProjectItem) => void;
  onAddCardClick: () => void;
}

interface TimelineEntry {
  id: string;
  type: 'card' | 'milestone';
  title: string;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  sourceLabel: string;
  priority?: string;
  assigneeIds: string[];
  originalCard?: CardItem;
  originalProject?: ProjectItem;
}

export function TimelineView({
  cards,
  projects,
  onCardClick,
  onProjectClick,
  onAddCardClick,
}: TimelineViewProps) {
  const { users, avatarColorOf } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'card' | 'milestone'>('all');

  // Format date helper: "23 Okt 2026"
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
  };

  // Calculate relative days
  const getRelativeDay = (dateStr: string, isCompleted: boolean) => {
    if (isCompleted) return { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Terlewat ${Math.abs(diffDays)} hari`, color: 'bg-rose-100 text-rose-800' };
    }
    if (diffDays === 0) {
      return { label: 'Hari ini', color: 'bg-amber-100 text-amber-900 font-bold' };
    }
    if (diffDays === 1) {
      return { label: 'Besok', color: 'bg-indigo-100 text-indigo-900' };
    }
    return { label: `${diffDays} hari lagi`, color: 'bg-slate-100 text-slate-700' };
  };

  // Compile timeline items
  const timelineEntries = useMemo<TimelineEntry[]>(() => {
    const list: TimelineEntry[] = [];

    // 1. Cards with deadlines
    cards.forEach((card) => {
      if (card.deadline) {
        list.push({
          id: `card-${card.id}`,
          type: 'card',
          title: card.title,
          date: card.deadline,
          isCompleted: card.columnId === 'done',
          sourceLabel:
            card.columnId === 'done'
              ? 'Tugas Selesai'
              : card.columnId === 'in_progress'
              ? 'Tugas Berjalan'
              : card.columnId === 'review'
              ? 'Tugas Review'
              : 'Tugas To Do',
          priority: card.priority,
          assigneeIds: card.assignedTo,
          originalCard: card,
        });
      }
    });

    // 2. Project milestones
    projects.forEach((prj) => {
      prj.milestones.forEach((m) => {
        if (m.dueDate) {
          list.push({
            id: `ms-${m.id}`,
            type: 'milestone',
            title: m.title,
            date: m.dueDate,
            isCompleted: m.completed,
            sourceLabel: prj.title,
            assigneeIds: prj.teamMembers,
            originalProject: prj,
          });
        }
      });
    });

    // Sort chronologically
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [cards, projects]);

  const filteredEntries = useMemo(() => {
    if (filterType === 'all') return timelineEntries;
    return timelineEntries.filter((e) => e.type === filterType);
  }, [timelineEntries, filterType]);

  const stats = useMemo(() => {
    const total = timelineEntries.length;
    const completed = timelineEntries.filter((e) => e.isCompleted).length;
    const upcoming = total - completed;
    return { total, completed, upcoming };
  }, [timelineEntries]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 p-4 space-y-4 overflow-y-auto">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Jadwal & Timeline Progres
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Urutan kronologis target pekerjaan dan milestone tim PPKI
            </p>
          </div>
          <button
            onClick={onAddCardClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas</span>
          </button>
        </div>

        {/* Quick KPI badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold block">Total Agenda</span>
            <span className="text-base font-bold text-slate-900">{stats.total}</span>
          </div>
          <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100/60">
            <span className="text-[10px] text-indigo-700 font-semibold block">Mendatang</span>
            <span className="text-base font-bold text-indigo-900">{stats.upcoming}</span>
          </div>
          <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
            <span className="text-[10px] text-emerald-700 font-semibold block">Telah Selesai</span>
            <span className="text-base font-bold text-emerald-900">{stats.completed}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Semua ({timelineEntries.length})
          </button>
          <button
            onClick={() => setFilterType('card')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              filterType === 'card'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Tenggat Tugas
          </button>
          <button
            onClick={() => setFilterType('milestone')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              filterType === 'milestone'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Milestone Proyek
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
          <CalendarClock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Agenda Jadwal</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tambahkan tenggat waktu pada kartu tugas kanban atau buat milestone pada proyek untuk melihat jadwal di sini.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />

          {filteredEntries.map((entry) => {
            const rel = getRelativeDay(entry.date, entry.isCompleted);

            return (
              <div key={entry.id} className="relative group">
                {/* Node marker on vertical line */}
                <div
                  className={cn(
                    'absolute -left-6 top-3 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all z-10',
                    entry.isCompleted
                      ? 'border-emerald-500 text-emerald-500 bg-emerald-50'
                      : 'border-indigo-600 text-indigo-600 ring-2 ring-indigo-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      entry.isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'
                    )}
                  />
                </div>

                {/* Timeline Card */}
                <div
                  onClick={() => {
                    if (entry.type === 'card' && entry.originalCard) {
                      onCardClick(entry.originalCard);
                    } else if (entry.type === 'milestone' && entry.originalProject) {
                      onProjectClick(entry.originalProject);
                    }
                  }}
                  className={cn(
                    'bg-white border rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group-hover:border-indigo-200',
                    entry.isCompleted
                      ? 'border-slate-200/80 bg-slate-50/40 opacity-85'
                      : 'border-slate-200/90'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-900 font-mono">
                          {formatDateIndo(entry.date)}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.2 rounded-full leading-tight',
                            rel.color
                          )}
                        >
                          {rel.label}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          'text-xs font-bold transition-colors line-clamp-2',
                          entry.isCompleted
                            ? 'text-slate-600 line-through'
                            : 'text-slate-900 group-hover:text-indigo-600'
                        )}
                      >
                        {entry.title}
                      </h4>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0 mt-1" />
                  </div>

                  {/* Metadata footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {entry.type === 'card' ? (
                        <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="font-semibold text-slate-700">{entry.sourceLabel}</span>
                    </div>

                    {/* Assignee Avatars */}
                    {entry.assigneeIds.length > 0 && (
                      <div className="flex items-center -space-x-1.5">
                        {entry.assigneeIds.slice(0, 3).map((uid) => {
                          const u = users.find((x) => x.id === uid);
                          if (!u) return null;
                          return (
                            <Avatar
                              key={u.id}
                              name={u.name}
                              initials={u.avatar}
                              colorClass={avatarColorOf(u.id)}
                              size="xs"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
