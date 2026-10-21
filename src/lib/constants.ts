import type { ColumnData } from '../types';

/** Versi skema data localStorage. */
export const SCHEMA_VERSION = 2;

export const COLUMNS: ColumnData[] = [
  { id: 'todo',        title: 'To Do',       order: 0, accentColor: 'bg-slate-400' },
  { id: 'in_progress', title: 'In Progress', order: 1, accentColor: 'bg-indigo-600' },
  { id: 'review',      title: 'Review',      order: 2, accentColor: 'bg-amber-500' },
  { id: 'done',        title: 'Done',        order: 3, accentColor: 'bg-emerald-600' },
];

export const LABELS = [
  { name: 'Frontend', color: 'bg-sky-100/90 text-sky-800 border-sky-200' },
  { name: 'Backend',  color: 'bg-emerald-100/90 text-emerald-800 border-emerald-200' },
  { name: 'Desain',   color: 'bg-purple-100/90 text-purple-800 border-purple-200' },
  { name: 'Dokumen',  color: 'bg-amber-100/90 text-amber-800 border-amber-200' },
  { name: 'Sistem',   color: 'bg-rose-100/90 text-rose-800 border-rose-200' },
] as const;

export type LabelName = typeof LABELS[number]['name'];

export const PRIORITY_CONFIG: Record<string, { label: string; border: string; badge: string }> = {
  low:    { label: 'Rendah',   border: 'border-l-slate-300',  badge: 'text-slate-600 bg-white/80 border-slate-200' },
  medium: { label: 'Sedang',   border: 'border-l-indigo-500', badge: 'text-indigo-700 bg-white/80 border-indigo-200' },
  high:   { label: 'Tinggi',   border: 'border-l-amber-500',  badge: 'text-amber-800 bg-white/80 border-amber-200' },
  urgent: { label: 'Mendesak', border: 'border-l-red-500',    badge: 'text-red-700 bg-white/80 border-red-200' },
};

/** Warna avatar unik per user */
export const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-sky-100 text-sky-700 border-sky-200',
];

/**
 * Palet warna pastel yang lembut untuk kartu tugas.
 * Berbeda-beda tiap kartu agar menarik secara visual namun tetap bersih.
 */
export const PASTEL_CARD_THEMES = [
  {
    id: 'mint',
    bg: 'bg-emerald-50/75 hover:bg-emerald-50',
    border: 'border-emerald-200/80 hover:border-emerald-300',
  },
  {
    id: 'lavender',
    bg: 'bg-purple-50/75 hover:bg-purple-50',
    border: 'border-purple-200/80 hover:border-purple-300',
  },
  {
    id: 'honey',
    bg: 'bg-amber-50/75 hover:bg-amber-50',
    border: 'border-amber-200/80 hover:border-amber-300',
  },
  {
    id: 'sky',
    bg: 'bg-sky-50/75 hover:bg-sky-50',
    border: 'border-sky-200/80 hover:border-sky-300',
  },
  {
    id: 'rose',
    bg: 'bg-rose-50/75 hover:bg-rose-50',
    border: 'border-rose-200/80 hover:border-rose-300',
  },
  {
    id: 'indigo',
    bg: 'bg-indigo-50/70 hover:bg-indigo-50',
    border: 'border-indigo-200/80 hover:border-indigo-300',
  },
  {
    id: 'teal',
    bg: 'bg-teal-50/75 hover:bg-teal-50',
    border: 'border-teal-200/80 hover:border-teal-300',
  },
  {
    id: 'peach',
    bg: 'bg-orange-50/75 hover:bg-orange-50',
    border: 'border-orange-200/80 hover:border-orange-300',
  },
];

/** Menghasilkan tema pastel yang konsisten dan bervariasi untuk setiap kartu */
export function getCardPastelTheme(cardId: string) {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = (hash << 5) - hash + cardId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PASTEL_CARD_THEMES.length;
  return PASTEL_CARD_THEMES[idx];
}
