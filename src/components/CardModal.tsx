import { useState } from 'react';
import type { CardItem, ColumnId, Priority, ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { LABELS, COLUMNS, PRIORITY_CONFIG } from '../lib/constants';
import { formatTimestamp, cn } from '../lib/utils';
import { Avatar } from './Avatar';
import {
  X, Trash2, Check, AlertCircle, History,
  Calendar, AlignLeft, Tag, Users, BarChart2,
} from 'lucide-react';

interface CardModalProps {
  card: CardItem | null;
  defaultColumnId?: ColumnId;
  activities: ActivityLog[];
  onClose: () => void;
  onSave: (data: Partial<CardItem>) => void;
  onDelete: (cardId: string) => void;
}

type Field = { icon: React.ElementType; label: string };
const FIELDS: Record<string, Field> = {
  title:       { icon: AlignLeft,  label: 'Judul Tugas' },
  description: { icon: AlignLeft,  label: 'Deskripsi' },
  column:      { icon: BarChart2,  label: 'Status' },
  priority:    { icon: BarChart2,  label: 'Prioritas' },
  deadline:    { icon: Calendar,   label: 'Deadline' },
  labels:      { icon: Tag,        label: 'Label' },
  assignees:   { icon: Users,      label: 'Penanggung Jawab' },
};

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-1.5">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}

export function CardModal({ card, defaultColumnId = 'todo', activities, onClose, onSave, onDelete }: CardModalProps) {
  const { users, currentUser, isAdmin, avatarColorOf } = useAuth();

  const isEditing = Boolean(card);
  const canManage = !card || isAdmin || card.createdBy === currentUser.id;

  const [title,       setTitle]       = useState(card?.title       ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [columnId,    setColumnId]    = useState<ColumnId>(card?.columnId ?? defaultColumnId);
  const [deadline,    setDeadline]    = useState(card?.deadline     ?? '');
  const [priority,    setPriority]    = useState<Priority>(card?.priority ?? 'medium');
  const [labels,      setLabels]      = useState<string[]>(card?.labels ?? []);
  const [assignedTo,  setAssignedTo]  = useState<string[]>(card?.assignedTo ?? []);
  const [error,       setError]       = useState('');
  const [confirmDel,  setConfirmDel]  = useState(false);

  const cardActivities = activities.filter((a) => a.cardId === card?.id);

  const toggleLabel    = (l: string) => canManage && setLabels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  const toggleAssignee = (id: string) => canManage && setAssignedTo((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Judul tugas wajib diisi.'); return; }
    onSave({ title: title.trim(), description: description.trim(), columnId, deadline: deadline || undefined, priority, labels, assignedTo });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              {isEditing ? 'Detail Kartu Tugas' : 'Buat Tugas Baru'}
            </p>
            {card && <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{card.id.slice(0, 12)}…</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-900/50 text-red-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <SectionLabel icon={FIELDS.title.icon} label={FIELDS.title.label} />
            <input
              type="text"
              value={title}
              disabled={!canManage}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="Judul pekerjaan yang jelas dan singkat…"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <SectionLabel icon={FIELDS.description.icon} label={FIELDS.description.label} />
            <textarea
              rows={3}
              value={description}
              disabled={!canManage}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Konteks, langkah implementasi, kriteria selesai, atau catatan penting…"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SectionLabel icon={FIELDS.column.icon} label="Status Kolom" />
              <select
                value={columnId}
                disabled={!canManage}
                onChange={(e) => setColumnId(e.target.value as ColumnId)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <SectionLabel icon={FIELDS.priority.icon} label="Prioritas" />
              <select
                value={priority}
                disabled={!canManage}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <SectionLabel icon={FIELDS.deadline.icon} label={FIELDS.deadline.label} />
            <input
              type="date"
              value={deadline}
              disabled={!canManage}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Labels */}
          <div>
            <SectionLabel icon={FIELDS.labels.icon} label={FIELDS.labels.label} />
            <div className="flex flex-wrap gap-2">
              {LABELS.map((lbl) => {
                const active = labels.includes(lbl.name);
                return (
                  <button
                    key={lbl.name}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleLabel(lbl.name)}
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border font-semibold transition-all',
                      active
                        ? `${lbl.color} ring-2 ring-white/10`
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300',
                    )}
                  >
                    {lbl.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <SectionLabel icon={FIELDS.assignees.icon} label={FIELDS.assignees.label} />
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => {
                const active = assignedTo.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleAssignee(u.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all',
                      active
                        ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700',
                    )}
                  >
                    <Avatar name={u.name} initials={u.avatar} colorClass={avatarColorOf(u.id)} size="xs" />
                    <span className="text-xs truncate flex-1">{u.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity log */}
          {isEditing && cardActivities.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2">
                <History className="w-3.5 h-3.5" />
                Riwayat Aktivitas
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {cardActivities.map((act) => (
                  <div key={act.id} className="text-[11px] text-zinc-400 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800/60 leading-relaxed">
                    <span className="font-semibold text-zinc-200">{act.userName}</span>{' '}
                    {act.action}{' '}
                    <span className="text-zinc-600">&bull; {formatTimestamp(act.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal footer */}
        <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-between gap-2">
          {/* Delete */}
          {isEditing && canManage && card ? (
            !confirmDel ? (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 font-medium px-2.5 py-1.5 rounded-xl hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(card.id)}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  Yakin hapus?
                </button>
                <button type="button" onClick={() => setConfirmDel(false)} className="text-xs text-zinc-400 px-2 py-1.5 hover:text-zinc-200">
                  Batal
                </button>
              </div>
            )
          ) : <div />}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
              Tutup
            </button>
            {canManage && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors active:scale-95"
              >
                {isEditing ? 'Simpan' : 'Buat Kartu'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
