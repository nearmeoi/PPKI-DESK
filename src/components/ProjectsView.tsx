import { useState, useMemo } from 'react';
import type { ProjectItem, ProjectStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  FolderKanban,
  Plus,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProjectsViewProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  onAddProjectClick: () => void;
}

export function ProjectsView({
  projects,
  onSelectProject,
  onAddProjectClick,
}: ProjectsViewProps) {
  const { users, avatarColorOf } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Selesai', color: 'bg-emerald-600 text-white' };
      case 'in_progress':
        return { label: 'Berjalan', color: 'bg-indigo-600 text-white' };
      case 'planning':
        return { label: 'Perencanaan', color: 'bg-slate-700 text-white' };
      case 'on_hold':
        return { label: 'Ditunda', color: 'bg-amber-600 text-white' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 p-4 space-y-4 overflow-y-auto">
      {/* Top Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Daftar Proyek & Inisiatif
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rencana strategis dan pemantauan milestone tim PPKI
            </p>
          </div>
          <button
            onClick={onAddProjectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Proyek Baru</span>
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0',
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0',
              statusFilter === 'in_progress'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Berjalan
          </button>
          <button
            onClick={() => setStatusFilter('planning')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0',
              statusFilter === 'planning'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Perencanaan
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0',
              statusFilter === 'completed'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Proyek</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Mulai rencanakan proyek baru untuk mengatur tugas dan milestone tim Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((prj) => {
            const badge = getStatusBadge(prj.status);
            const lead = users.find((u) => u.id === prj.leaderId);
            const completedMilestones = prj.milestones.filter((m) => m.completed).length;

            return (
              <div
                key={prj.id}
                onClick={() => onSelectProject(prj)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer hover:border-indigo-200 space-y-3 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                        {prj.code}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs',
                          badge.color
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {prj.title}
                    </h3>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0 mt-1" />
                </div>

                {/* Description */}
                {prj.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prj.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">
                      Milestone: {completedMilestones} dari {prj.milestones.length} Selesai
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {prj.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        prj.progress === 100
                          ? 'bg-emerald-500'
                          : prj.progress > 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      )}
                      style={{ width: `${prj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {prj.targetDate || 'Belum diatur'}</span>
                  </div>

                  {/* Team Members & Lead */}
                  <div className="flex items-center gap-2">
                    {lead && (
                      <span className="text-[10px] text-slate-400">
                        PIC: <strong className="text-slate-700">{lead.name}</strong>
                      </span>
                    )}
                    <div className="flex items-center -space-x-1.5">
                      {prj.teamMembers.slice(0, 3).map((uid) => {
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
