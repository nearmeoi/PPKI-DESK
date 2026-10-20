import React from 'react';
import type { BoardFilter } from '../types';
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_LABELS } from '../lib/mockData';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  filters: BoardFilter;
  onFilterChange: (filters: BoardFilter) => void;
  onClose: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClose,
}) => {
  const { users, currentUser } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleAssigneeChange = (value: string) => {
    onFilterChange({ ...filters, assignedToUserId: value });
  };

  const handleLabelChange = (value: string) => {
    onFilterChange({ ...filters, selectedLabel: value });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      assignedToUserId: 'all',
      selectedLabel: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.assignedToUserId !== 'all' ||
    filters.selectedLabel !== 'all';

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-3 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari kartu berdasarkan judul..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Assignee Filter */}
        <div className="flex-1 min-w-[130px]">
          <select
            value={filters.assignedToUserId}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Anggota</option>
            <option value="me">Tugas Saya ({currentUser.name})</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Label Filter */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={filters.selectedLabel}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Label</option>
            {AVAILABLE_LABELS.map((lbl) => (
              <option key={lbl.name} value={lbl.name}>
                {lbl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button if active */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-950/40 border border-indigo-900/50"
          >
            Reset
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800"
          title="Tutup Filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
