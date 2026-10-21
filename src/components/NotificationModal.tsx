import { useState } from 'react';
import type { ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatTimestamp } from '../lib/utils';
import { Avatar } from './Avatar';
import { X, Bell, CheckCheck, Clock, Inbox } from 'lucide-react';

interface NotificationModalProps {
  activities: ActivityLog[];
  onClose: () => void;
  onClearAll?: () => void;
}

export function NotificationModal({ activities, onClose }: NotificationModalProps) {
  const { users, currentUser, avatarColorOf } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'me'>('all');
  const [readIds, setReadIds] = useState<string[]>([]);

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
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">Notifikasi & Aktivitas</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Perkembangan terbaru di papan tim PPKI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({activities.length})
            </button>
            <button
              onClick={() => setFilterType('me')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'me'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saya ({currentUser.name})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai dibaca</span>
            </button>
          )}
        </div>

        {/* List of activities */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedActivities.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Tidak ada notifikasi</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Semua perkembangan tugas telah Anda pantau.</p>
            </div>
          ) : (
            displayedActivities.map((act) => {
              const userObj = users.find((u) => u.id === act.userId);
              const isUnread = !readIds.includes(act.id);

              return (
                <div
                  key={act.id}
                  onClick={() => setReadIds((prev) => [...prev, act.id])}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/70'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <Avatar
                    name={act.userName}
                    initials={userObj?.avatar || act.userName.slice(0, 2).toUpperCase()}
                    colorClass={avatarColorOf(act.userId)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">
                      <span className="font-bold text-slate-900">{act.userName}</span>{' '}
                      {act.action}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(act.timestamp)}</span>
                    </div>
                  </div>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Notifikasi otomatis dari papan kerja</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
