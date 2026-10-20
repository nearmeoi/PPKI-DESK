import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Mail, 
  Database, 
  Search, 
  ChevronDown, 
  ShieldCheck, 
  User as UserIcon,
  Plus
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

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

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminUsers,
  onOpenEmailPreview,
  onOpenSupabaseSetup,
  onOpenAccount,
  onQuickAdd,
  onToggleFilter,
  isFilterOpen,
  totalCards,
}) => {
  const { currentUser, users, switchUser, isAdmin } = useAuth();
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img 
              src="/icon.png" 
              alt="PPKI Logo" 
              className="w-9 h-9 rounded-lg object-contain bg-zinc-800 p-0.5 border border-zinc-700 shadow-sm"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">PPKI Progress</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                MVP
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Tim PPKI &bull; {totalCards} Tugas
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Add Button */}
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
            title="Tambah kartu baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>

          {/* Toggle Search & Filter */}
          <button
            onClick={onToggleFilter}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isFilterOpen 
                ? 'bg-zinc-800 text-indigo-400 border-zinc-700' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title="Pencarian & Filter"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Email Notification Preview */}
          <button
            onClick={onOpenEmailPreview}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs transition-colors"
            title="Notifikasi Email Gmail"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseSetup}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isSupabaseConfigured
                ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title={isSupabaseConfigured ? 'Terkoneksi ke Supabase' : 'Status Database'}
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Admin User Management Button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminUsers}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800 text-xs transition-colors"
              title="Kelola Pengguna Tim (Admin)"
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          {/* User Profile / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSwitchUserOpen(!isSwitchUserOpen)}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-indigo-950 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-800">
                {currentUser.avatar || currentUser.name.charAt(0)}
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isSwitchUserOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsSwitchUserOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 p-2 text-xs">
                  <div className="px-2 py-2 border-b border-zinc-800 mb-1">
                    <p className="font-semibold text-zinc-100">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50">
                          <ShieldCheck className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                          <UserIcon className="w-2.5 h-2.5" /> Anggota
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsSwitchUserOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 mb-1"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Pengaturan Akun & Sandi</span>
                  </button>

                  <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-t border-zinc-800">
                    Beralih Pengguna (Simulasi)
                  </div>
                  <div className="space-y-0.5 max-h-44 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setIsSwitchUserOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-indigo-950/60 text-indigo-300 font-medium'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-300">
                            {u.avatar || u.name.charAt(0)}
                          </span>
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 capitalize">{u.role}</span>
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
};
