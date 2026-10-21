import { useState, useEffect, useRef, useMemo } from 'react';
import type { CardItem, ProjectItem, AppView } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  LayoutGrid,
  CalendarClock,
  FolderKanban,
  User,
  Plus,
  ShieldCheck,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  projects: ProjectItem[];
  onSelectCard: (card: CardItem) => void;
  onSelectProject: (project: ProjectItem) => void;
  onNavigateView: (view: AppView) => void;
  onQuickAddCard: () => void;
  onQuickAddProject: () => void;
  onOpenAdminUsers: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

interface SearchItem {
  id: string;
  category: 'Tugas' | 'Proyek' | 'Jadwal' | 'Navigasi' | 'Aksi' | 'Tim';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export function SpotlightSearch({
  isOpen,
  onClose,
  cards,
  projects,
  onSelectCard,
  onSelectProject,
  onNavigateView,
  onQuickAddCard,
  onQuickAddProject,
  onOpenAdminUsers,
  onOpenProfile,
  onLogout,
}: SpotlightSearchProps) {
  const { users, isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const searchBtn = document.getElementById('spotlight-search-trigger');
          searchBtn?.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search items calculation
  const searchResults = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchItem[] = [];

    // Base actions & navigations always available or filtered
    const navigations: SearchItem[] = [
      {
        id: 'nav-kanban',
        category: 'Navigasi',
        title: 'Buka Papan Tugas (Kanban)',
        subtitle: 'Lihat seluruh kolom To Do, In Progress, Review, dan Done',
        icon: LayoutGrid,
        badge: 'Navigasi',
        action: () => {
          onNavigateView('kanban');
          onClose();
        },
      },
      {
        id: 'nav-timeline',
        category: 'Navigasi',
        title: 'Buka Jadwal & Timeline',
        subtitle: 'Pantau urutan agenda, milestone, dan deadline tim',
        icon: CalendarClock,
        badge: 'Navigasi',
        action: () => {
          onNavigateView('timeline');
          onClose();
        },
      },
      {
        id: 'nav-projects',
        category: 'Navigasi',
        title: 'Buka Daftar Proyek',
        subtitle: 'Kelola perencanaan proyek dan rincian target tim',
        icon: FolderKanban,
        badge: 'Navigasi',
        action: () => {
          onNavigateView('projects');
          onClose();
        },
      },
      {
        id: 'nav-profile',
        category: 'Navigasi',
        title: 'Buka Profil & Pengaturan Akun',
        subtitle: 'Ubah nama tampilan dan perbarui kata sandi terenkripsi',
        icon: User,
        badge: 'Pengaturan',
        action: () => {
          onOpenProfile();
          onClose();
        },
      },
      {
        id: 'act-add-card',
        category: 'Aksi',
        title: 'Tambah Tugas Baru',
        subtitle: 'Buat kartu tugas baru di papan kanban',
        icon: Plus,
        badge: 'Aksi Cepat',
        action: () => {
          onQuickAddCard();
          onClose();
        },
      },
      {
        id: 'act-add-project',
        category: 'Aksi',
        title: 'Rencanakan Proyek Baru',
        subtitle: 'Buat proyek baru beserta milestone targetnya',
        icon: Plus,
        badge: 'Aksi Cepat',
        action: () => {
          onQuickAddProject();
          onClose();
        },
      },
    ];

    if (isAdmin) {
      navigations.push({
        id: 'act-admin-users',
        category: 'Aksi',
        title: 'Kelola Pengguna & Tim (Admin CRUD)',
        subtitle: 'Tambah, edit peran, reset sandi, dan kelola akun anggota tim',
        icon: ShieldCheck,
        badge: 'Admin',
        badgeColor: 'bg-amber-600 text-white',
        action: () => {
          onOpenAdminUsers();
          onClose();
        },
      });
    }

    navigations.push({
      id: 'act-logout',
      category: 'Aksi',
      title: 'Keluar dari Akun (Logout)',
      subtitle: 'Akhiri sesi aktif pada peramban ini',
      icon: LogOut,
      badge: 'Sesi',
      badgeColor: 'bg-rose-600 text-white',
      action: () => {
        onLogout();
        onClose();
      },
    });

    // If query is empty, show navigation & quick actions
    if (!q) {
      return navigations;
    }

    // 1. Search in Cards
    cards.forEach((card) => {
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchDesc = card.description.toLowerCase().includes(q);
      const matchLabel = card.labels.some((l) => l.toLowerCase().includes(q));

      if (matchTitle || matchDesc || matchLabel) {
        const colLabels: Record<string, string> = {
          todo: 'To Do',
          in_progress: 'In Progress',
          review: 'Review',
          done: 'Done',
        };

        items.push({
          id: `card-${card.id}`,
          category: 'Tugas',
          title: card.title,
          subtitle: `${colLabels[card.columnId] || 'Tugas'} ${
            card.deadline ? `• Tenggat: ${card.deadline}` : ''
          }`,
          icon: LayoutGrid,
          badge: colLabels[card.columnId],
          badgeColor:
            card.columnId === 'done'
              ? 'bg-emerald-600 text-white'
              : card.columnId === 'in_progress'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700 text-white',
          action: () => {
            onSelectCard(card);
            onClose();
          },
        });
      }
    });

    // 2. Search in Projects
    projects.forEach((prj) => {
      const matchTitle = prj.title.toLowerCase().includes(q);
      const matchCode = prj.code.toLowerCase().includes(q);
      const matchDesc = prj.description.toLowerCase().includes(q);
      const matchTags = prj.tags.some((t) => t.toLowerCase().includes(q));

      if (matchTitle || matchCode || matchDesc || matchTags) {
        items.push({
          id: `prj-${prj.id}`,
          category: 'Proyek',
          title: prj.title,
          subtitle: `Progres: ${prj.progress}% • Target: ${prj.targetDate}`,
          icon: FolderKanban,
          badge: `${prj.progress}% Selesai`,
          badgeColor: 'bg-indigo-600 text-white',
          action: () => {
            onSelectProject(prj);
            onClose();
          },
        });
      }
    });

    // 3. Search in Timeline events (Cards with deadlines & Project milestones)
    cards
      .filter((c) => c.deadline && c.deadline.includes(q))
      .forEach((c) => {
        items.push({
          id: `timeline-card-${c.id}`,
          category: 'Jadwal',
          title: `Tenggat Tugas: ${c.title}`,
          subtitle: `Tanggal: ${c.deadline}`,
          icon: CalendarClock,
          badge: 'Tenggat',
          action: () => {
            onSelectCard(c);
            onClose();
          },
        });
      });

    // 4. Search in Team Members
    users.forEach((u) => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);

      if (matchName || matchEmail) {
        items.push({
          id: `user-${u.id}`,
          category: 'Tim',
          title: u.name,
          subtitle: `${u.email} • Peran: ${u.role === 'admin' ? 'Admin' : 'Anggota'}`,
          icon: User,
          badge: u.role === 'admin' ? 'Admin' : 'Anggota',
          badgeColor: u.role === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white',
          action: () => {
            onOpenProfile();
            onClose();
          },
        });
      }
    });

    // 5. Match Navigations & Actions
    navigations.forEach((nav) => {
      if (
        nav.title.toLowerCase().includes(q) ||
        nav.subtitle.toLowerCase().includes(q) ||
        nav.category.toLowerCase().includes(q)
      ) {
        items.push(nav);
      }
    });

    return items;
  }, [
    query,
    cards,
    projects,
    users,
    isAdmin,
    onNavigateView,
    onSelectCard,
    onSelectProject,
    onQuickAddCard,
    onQuickAddProject,
    onOpenAdminUsers,
    onOpenProfile,
    onLogout,
    onClose,
  ]);

  // Adjust selected index if it exceeds list size
  useEffect(() => {
    if (selectedIndex >= searchResults.length) {
      setSelectedIndex(Math.max(0, searchResults.length - 1));
    }
  }, [searchResults.length, selectedIndex]);

  // Handle keyboard navigation within the list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        selected.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac-style Spotlight Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari tugas, proyek, timeline, menu, aksi, atau anggota..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 px-1 py-0.5"
              >
                Hapus
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 max-h-[60vh] divide-y divide-slate-50">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Coba gunakan kata kunci lain seperti nama tugas, kode proyek, atau peran anggota.
              </p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
                        isSelected
                          ? 'bg-white border-indigo-200 text-indigo-700 shadow-2xs'
                          : 'bg-slate-100 border-slate-200/80 text-slate-500'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-xs font-bold truncate',
                          isSelected ? 'text-indigo-950' : 'text-slate-900'
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          item.badgeColor
                            ? `${item.badgeColor} border-transparent`
                            : 'bg-white text-slate-600 border-slate-200'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Mac-style Spotlight Footer Hints */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded">
                &uarr;&darr;
              </kbd>
              <span>Pilih</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded">
                &crarr;
              </kbd>
              <span>Buka</span>
            </span>
          </div>
          <span className="font-semibold text-slate-400">Pencarian Universal PPKI</span>
        </div>
      </div>
    </div>
  );
}
