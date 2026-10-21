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
  { name: 'Frontend', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { name: 'Backend',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Desain',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Dokumen',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Sistem',   color: 'bg-rose-50 text-rose-700 border-rose-200' },
] as const;

export type LabelName = typeof LABELS[number]['name'];

export const PRIORITY_CONFIG: Record<string, { label: string; border: string; badge: string }> = {
  low:    { label: 'Rendah',   border: 'border-l-slate-300',  badge: 'text-slate-600 bg-slate-100 border-slate-200' },
  medium: { label: 'Sedang',   border: 'border-l-indigo-500', badge: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  high:   { label: 'Tinggi',   border: 'border-l-amber-500',  badge: 'text-amber-800 bg-amber-50 border-amber-200' },
  urgent: { label: 'Mendesak', border: 'border-l-red-500',    badge: 'text-red-700 bg-red-50 border-red-200' },
};

/** Warna avatar unik per user berdasarkan index (Dominan terang & kontras tinggi) */
export const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-sky-100 text-sky-700 border-sky-200',
];
