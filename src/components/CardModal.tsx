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

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <span>{label}</span>
    </div>
  );
}

export function CardModal({
  card,
  defaultColumnId = 'todo',
  activities,
  onClose,
  onSave,
  onDelete,
}: CardModalProps) {
  const { users, currentUser, isAdmin, avatarColorOf } = useAuth();

  const isEditing = Boolean(card);
  const canManage = !card || isAdmin || (currentUser ? card.createdBy === currentUser.id : false);

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

  const toggleLabel = (l: string) =>
    canManage && setLabels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));
  const toggleAssignee = (id: string) =>
    canManage && setAssignedTo((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi.');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      columnId,
      deadline: deadline || undefined,
      priority,
      labels,
      assignedTo,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              {isEditing ? 'Detail Kartu Tugas' : 'Buat Tugas Baru'}
            </p>
            {card && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {card.id.slice(0, 10)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <SectionLabel icon={AlignLeft} label="Judul Tugas *" />
            <input
              type="text"
              value={title}
              disabled={!canManage}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="Contoh: Desain wireframe navigasi mobile"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition-all shadow-2xs"
            />
          </div>

          {/* Description */}
          <div>
            <SectionLabel icon={AlignLeft} label="Deskripsi Pekerjaan" />
            <textarea
              rows={3}
              value={description}
              disabled={!canManage}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kebutuhan, kriteria selesai, atau catatan teknis..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Column & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SectionLabel icon={BarChart2} label="Kolom Status" />
              <select
                value={columnId}
                disabled={!canManage}
                onChange={(e) => setColumnId(e.target.value as ColumnId)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 shadow-2xs"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <SectionLabel icon={BarChart2} label="Prioritas" />
              <select
                value={priority}
                disabled={!canManage}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 shadow-2xs"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <SectionLabel icon={Calendar} label="Batas Waktu (Deadline)" />
            <input
              type="date"
              value={deadline}
              disabled={!canManage}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 shadow-2xs"
            />
          </div>

          {/* Labels */}
          <div>
            <SectionLabel icon={Tag} label="Kategori / Label" />
            <div className="flex flex-wrap gap-1.5">
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
                        ? `${lbl.color} ring-2 ring-indigo-500/20 shadow-2xs`
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800',
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
            <SectionLabel icon={Users} label="Penanggung Jawab (Tim PPKI)" />
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {users.map((u) => {
                const active = assignedTo.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleAssignee(u.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-xl border text-left transition-all',
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300',
                    )}
                  >
                    <Avatar
                      name={u.name}
                      initials={u.avatar}
                      colorClass={avatarColorOf(u.id)}
                      size="xs"
                    />
                    <span className="text-xs font-semibold truncate flex-1">{u.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          {isEditing && cardActivities.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Riwayat Kartu Ini</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {cardActivities.map((act) => (
                  <div
                    key={act.id}
                    className="text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed"
                  >
                    <span className="font-bold text-slate-900">{act.userName}</span>{' '}
                    {act.action}{' '}
                    <span className="text-slate-400">&bull; {formatTimestamp(act.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          {/* Delete action */}
          {isEditing && canManage && card ? (
            !confirmDel ? (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDelete(card.id)}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  Yakin Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDel(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 font-medium"
                >
                  Batal
                </button>
              </div>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Tutup
            </button>
            {canManage && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
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
