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
    <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 space-y-2.5">
      {/* Search input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Cari judul atau isi tugas..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
        >
          <option value="all">Semua anggota</option>
          <option value="me">Tugas saya {currentUser ? `(${currentUser.name})` : ''}</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={filters.selectedLabel}
          onChange={(e) => onChange({ ...filters, selectedLabel: e.target.value })}
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
        >
          <option value="all">Semua label</option>
          {LABELS.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
        </select>

        {isActive && (
          <button
            onClick={reset}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-colors shadow-2xs"
          >
            Reset
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          title="Tutup Filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
