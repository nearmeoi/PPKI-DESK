import { useState } from 'react';
import type { ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  User,
  Plus,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onOpenAdminUsers: () => void;
  onOpenAccount: () => void;
  onQuickAdd: () => void;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
  totalCards: number;
  activities: ActivityLog[];
}

export function Header({
  onOpenAdminUsers,
  onOpenAccount,
  onQuickAdd,
  onToggleFilter,
  isFilterOpen,
  totalCards,
  activities,
}: HeaderProps) {
  const { currentUser, users, switchUser, isAdmin, avatarColorOf } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-50 p-1 border border-slate-200/90 shadow-2xs flex items-center justify-center flex-shrink-0">
            <img
              src="/icon.png"
              alt="PPKI"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                PPKI Progress
              </h1>
              <span className="inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200/70">
                Tim
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {totalCards} Tugas Terbuka
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Add Button */}
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>

          {/* Search & Filter Toggle */}
          <button
            onClick={onToggleFilter}
            className={cn(
              'p-2 rounded-xl border text-xs transition-colors',
              isFilterOpen
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900',
            )}
            title="Pencarian & Filter"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Bell with Dropdown Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className={cn(
                'relative p-2 rounded-xl border text-xs transition-colors shadow-2xs',
                notificationsOpen
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900',
              )}
              title="Pemberitahuan & Aktivitas"
            >
              <Bell className="w-4 h-4" />
              {activities.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Popover Drops directly from this Bell icon */}
            <NotificationDropdown
              activities={activities}
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* Profile & Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Avatar
                name={currentUser.name}
                initials={currentUser.avatar}
                colorClass={avatarColorOf(currentUser.id)}
                size="xs"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                  {/* Active user header */}
                  <div className="p-3.5 bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={currentUser.name}
                        initials={currentUser.avatar}
                        colorClass={avatarColorOf(currentUser.id)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <User className="w-3 h-3 text-slate-500" /> Anggota
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Management links */}
                  <div className="p-1.5 space-y-0.5">
                    {/* Admin panel option inside profile menu */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAdminUsers();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Users className="w-4 h-4 text-amber-600" />
                        <span>Kelola Anggota & Tim</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAccount();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Pengaturan Akun & Sandi</span>
                    </button>
                  </div>

                  {/* Switch user simulation */}
                  <div className="p-2">
                    <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Beralih Pengguna
                    </p>
                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u);
                            setProfileDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs transition-colors',
                            u.id === currentUser.id
                              ? 'bg-indigo-50 text-indigo-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50',
                          )}
                        >
                          <Avatar
                            name={u.name}
                            initials={u.avatar}
                            colorClass={avatarColorOf(u.id)}
                            size="xs"
                          />
                          <span className="flex-1 truncate">{u.name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
