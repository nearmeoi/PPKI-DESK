import { useState } from 'react';
import type { ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatTimestamp } from '../lib/utils';
import { Avatar } from './Avatar';
import { Bell, CheckCheck, Clock, Inbox, X } from 'lucide-react';

interface NotificationDropdownProps {
  activities: ActivityLog[];
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ activities, isOpen, onClose }: NotificationDropdownProps) {
  const { users, currentUser, avatarColorOf } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'me'>('all');
  const [readIds, setReadIds] = useState<string[]>([]);

  if (!isOpen || !currentUser) return null;

  // Filter activities
  const displayedActivities = activities.filter((act) => {
    if (filterType === 'me') {
      return act.userName.toLowerCase().includes(currentUser.name.toLowerCase());
    }
    return true;
  });

  const markAllAsRead = () => {
    setReadIds(activities.map((a) => a.id));
  };

  const unreadCount = activities.filter((a) => !readIds.includes(a.id)).length;

  return (
    <>
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover anchored right below the notification icon */}
      <div 
        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-800">Pemberitahuan</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Baca semua</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter sub-bar */}
        <div className="px-3 py-1.5 bg-slate-50 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({activities.length})
          </button>
          <button
            onClick={() => setFilterType('me')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              filterType === 'me'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Saya ({currentUser.name})
          </button>
        </div>

        {/* Activity list */}
        <div className="max-h-72 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-slate-50">
          {displayedActivities.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Inbox className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Belum ada notifikasi</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Semua progres tugas sudah terpantau.</p>
            </div>
          ) : (
            displayedActivities.map((act) => {
              const userObj = users.find((u) => u.id === act.userId);
              const isUnread = !readIds.includes(act.id);

              return (
                <div
                  key={act.id}
                  onClick={() => setReadIds((prev) => [...prev, act.id])}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50/80'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <Avatar
                    name={act.userName}
                    initials={userObj?.avatar || act.userName.slice(0, 2).toUpperCase()}
                    colorClass={avatarColorOf(act.userId)}
                    size="xs"
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">
                      <span className="font-bold text-slate-900">{act.userName}</span>{' '}
                      {act.action}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(act.timestamp)}</span>
                    </div>
                  </div>
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
