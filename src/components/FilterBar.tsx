import type { BoardFilter } from '../types';
import { useAuth } from '../context/AuthContext';
import { LABELS } from '../lib/constants';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  filters: BoardFilter;
  onChange: (f: BoardFilter) => void;
  onClose: () => void;
}

export function FilterBar({ filters, onChange, onClose }: FilterBarProps) {
  const { users, currentUser } = useAuth();

  const isActive =
    filters.searchQuery !== '' ||
    filters.assignedToUserId !== 'all' ||
    filters.selectedLabel !== 'all';

  const reset = () => onChange({ searchQuery: '', assignedToUserId: 'all', selectedLabel: 'all' });

  return (
    <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 py-3 space-y-2.5">
      {/* Search input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Cari judul atau deskripsi tugas…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-600 transition-colors"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selects row */}
      <div className="flex items-center gap-2">
        <select
          value={filters.assignedToUserId}
          onChange={(e) => onChange({ ...filters, assignedToUserId: e.target.value })}
          className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-600"
        >
          <option value="all">Semua anggota</option>
          <option value="me">Tugas saya ({currentUser.name})</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={filters.selectedLabel}
          onChange={(e) => onChange({ ...filters, selectedLabel: e.target.value })}
          className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-600"
        >
          <option value="all">Semua label</option>
          {LABELS.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
        </select>

        {isActive && (
          <button
            onClick={reset}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 whitespace-nowrap px-2 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 transition-colors"
          >
            Reset
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
