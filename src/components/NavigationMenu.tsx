import type { AppView } from '../types';
import { LayoutGrid, CalendarClock, FolderKanban } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationMenuProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  cardsCount: number;
  projectsCount: number;
  timelineCount: number;
}

export function NavigationMenu({
  currentView,
  onViewChange,
  cardsCount,
  projectsCount,
  timelineCount,
}: NavigationMenuProps) {
  const tabs = [
    {
      id: 'kanban' as AppView,
      label: 'Papan Tugas',
      icon: LayoutGrid,
      count: cardsCount,
    },
    {
      id: 'timeline' as AppView,
      label: 'Jadwal',
      icon: CalendarClock,
      count: timelineCount,
    },
    {
      id: 'projects' as AppView,
      label: 'Proyek',
      icon: FolderKanban,
      count: projectsCount,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200/90 px-3 py-2 sticky top-[57px] z-20 shadow-2xs">
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5 flex-shrink-0',
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                )}
              />
              <span className="truncate">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none',
                    isActive
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
