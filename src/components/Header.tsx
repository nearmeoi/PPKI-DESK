import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';
import {
  Users, Mail, Database, Search,
  ChevronDown, ShieldCheck, User, Plus,
} from 'lucide-react';

interface HeaderProps {
  onOpenAdminUsers: () => void;
  onOpenEmailPreview: () => void;
  onOpenSupabaseSetup: () => void;
  onOpenAccount: () => void;
  onQuickAdd: () => void;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
  totalCards: number;
}

export function Header({
  onOpenAdminUsers, onOpenEmailPreview, onOpenSupabaseSetup,
  onOpenAccount, onQuickAdd, onToggleFilter, isFilterOpen, totalCards,
}: HeaderProps) {
  const { currentUser, users, switchUser, isAdmin, avatarColorOf } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
      {/* Top brand strip */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/icon.png"
            alt="PPKI"
            className="w-8 h-8 rounded-lg object-contain bg-zinc-800 p-0.5 border border-zinc-700 flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">PPKI Progress</h1>
              <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded border border-indigo-800/60">
                Web
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              {totalCards} tugas aktif
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Add card */}
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>

          {/* Filter */}
          <button
            onClick={onToggleFilter}
            className={cn(
              'p-1.5 rounded-lg border text-xs transition-colors',
              isFilterOpen
                ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200',
            )}
            title="Pencarian & Filter"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Email */}
          <button
            onClick={onOpenEmailPreview}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Notifikasi Email"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Supabase status */}
          <button
            onClick={onOpenSupabaseSetup}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              isSupabaseConfigured
                ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
            )}
            title={isSupabaseConfigured ? 'Terkoneksi Supabase' : 'Setup Database'}
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Admin users panel */}
          {isAdmin && (
            <button
              onClick={onOpenAdminUsers}
              className="p-1.5 rounded-lg border border-amber-800/50 bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 transition-colors"
              title="Kelola Tim (Admin)"
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 transition-colors"
            >
              <Avatar
                name={currentUser.name}
                initials={currentUser.avatar}
                colorClass={avatarColorOf(currentUser.id)}
                size="xs"
              />
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Current user info */}
                  <div className="px-3.5 pt-3.5 pb-2.5 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={currentUser.name}
                        initials={currentUser.avatar}
                        colorClass={avatarColorOf(currentUser.id)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/50">
                          <ShieldCheck className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                          <User className="w-2.5 h-2.5" /> Anggota
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account settings */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); onOpenAccount(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      Pengaturan Akun & Sandi
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="px-3.5 pb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border-t border-zinc-800 pt-2">
                    Simulasi login sebagai
                  </div>

                  {/* User switcher */}
                  <div className="p-1.5 pt-0 max-h-48 overflow-y-auto space-y-0.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { switchUser(u); setDropdownOpen(false); }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-colors text-xs',
                          u.id === currentUser.id
                            ? 'bg-indigo-950/50 text-indigo-300 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800',
                        )}
                      >
                        <Avatar
                          name={u.name}
                          initials={u.avatar}
                          colorClass={avatarColorOf(u.id)}
                          size="xs"
                        />
                        <span className="flex-1 truncate">{u.name}</span>
                        <span className="text-[10px] text-zinc-500 capitalize">{u.role}</span>
                      </button>
                    ))}
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
