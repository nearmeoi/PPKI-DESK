import type { ColumnData } from '../types';

/** Versi skema data localStorage. Naikkan angka ini untuk reset data lama pengguna. */
export const SCHEMA_VERSION = 2;

export const COLUMNS: ColumnData[] = [
  { id: 'todo',        title: 'To Do',       order: 0, accentColor: 'bg-zinc-500' },
  { id: 'in_progress', title: 'In Progress', order: 1, accentColor: 'bg-indigo-500' },
  { id: 'review',      title: 'Review',      order: 2, accentColor: 'bg-amber-500' },
  { id: 'done',        title: 'Done',        order: 3, accentColor: 'bg-emerald-500' },
];

export const LABELS = [
  { name: 'Frontend', color: 'bg-sky-950 text-sky-300 border-sky-800/60' },
  { name: 'Backend',  color: 'bg-emerald-950 text-emerald-300 border-emerald-800/60' },
  { name: 'Desain',   color: 'bg-purple-950 text-purple-300 border-purple-800/60' },
  { name: 'Dokumen',  color: 'bg-amber-950 text-amber-300 border-amber-800/60' },
  { name: 'Sistem',   color: 'bg-rose-950 text-rose-300 border-rose-800/60' },
] as const;

export type LabelName = typeof LABELS[number]['name'];

export const PRIORITY_CONFIG: Record<string, { label: string; border: string; badge: string }> = {
  low:    { label: 'Rendah',   border: 'border-l-zinc-600',   badge: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
  medium: { label: 'Sedang',   border: 'border-l-indigo-500', badge: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/60' },
  high:   { label: 'Tinggi',   border: 'border-l-amber-500',  badge: 'text-amber-300 bg-amber-950/60 border-amber-800/60' },
  urgent: { label: 'Mendesak', border: 'border-l-red-500',    badge: 'text-red-300 bg-red-950/60 border-red-800/60' },
};

/** Warna avatar unik per user berdasarkan index */
export const AVATAR_COLORS = [
  'bg-indigo-900 text-indigo-200 border-indigo-700',
  'bg-emerald-900 text-emerald-200 border-emerald-700',
  'bg-amber-900 text-amber-200 border-amber-700',
  'bg-rose-900 text-rose-200 border-rose-700',
  'bg-purple-900 text-purple-200 border-purple-700',
  'bg-sky-900 text-sky-200 border-sky-700',
];
