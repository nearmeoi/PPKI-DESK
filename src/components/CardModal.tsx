import React, { useState } from 'react';
import type { CardItem, ColumnStatus, Priority, ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_LABELS, INITIAL_COLUMNS } from '../lib/mockData';
import { 
  X, 
  Trash2, 
  Check, 
  AlertCircle,
  History
} from 'lucide-react';

interface CardModalProps {
  card: CardItem | null;
  defaultColumnId?: ColumnStatus;
  activities: ActivityLog[];
  onClose: () => void;
  onSave: (cardData: Partial<CardItem>) => void;
  onDelete: (cardId: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  defaultColumnId = 'todo',
  activities,
  onClose,
  onSave,
  onDelete,
}) => {
  const { users, currentUser, isAdmin } = useAuth();

  const isEditing = Boolean(card);
  const canManage = !card || isAdmin || card.createdBy === currentUser.id;

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [columnId, setColumnId] = useState<ColumnStatus>(card?.columnId || defaultColumnId);
  const [deadline, setDeadline] = useState(card?.deadline || '');
  const [priority, setPriority] = useState<Priority>(card?.priority || 'medium');
  const [labels, setLabels] = useState<string[]>(card?.labels || []);
  const [assignedTo, setAssignedTo] = useState<string[]>(card?.assignedTo || []);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter activities related to this card
  const cardActivities = activities.filter((act) => act.cardId === card?.id);

  const toggleLabel = (labelName: string) => {
    if (!canManage) return;
    setLabels((prev) =>
      prev.includes(labelName) ? prev.filter((l) => l !== labelName) : [...prev, labelName]
    );
  };

  const toggleAssignee = (userId: string) => {
    if (!canManage) return;
    setAssignedTo((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              {isEditing ? 'Detail Kartu Tugas' : 'Buat Tugas Baru'}
            </span>
            <p className="text-xs text-zinc-400">
              {card ? `ID: ${card.id.slice(0, 8)}` : 'Tambahkan pekerjaan ke dalam papan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-950/60 border border-red-900/60 text-red-300 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Judul Tugas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              disabled={!canManage}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Buat tampilan navigasi mobile"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Deskripsi Pekerjaan
            </label>
            <textarea
              rows={3}
              value={description}
              disabled={!canManage}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kebutuhan tugas, langkah implementasi, atau kriteria selesai..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60 transition-colors resize-none"
            />
          </div>

          {/* Column & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Kolom Status
              </label>
              <select
                value={columnId}
                disabled={!canManage}
                onChange={(e) => setColumnId(e.target.value as ColumnStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              >
                {INITIAL_COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                disabled={!canManage}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              >
                <option value="low">Rendah (Low)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="high">Tinggi (High)</option>
                <option value="urgent">Mendesak (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Batas Waktu (Deadline)
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                disabled={!canManage}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Labels Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Kategori / Label
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LABELS.map((lbl) => {
                const isSelected = labels.includes(lbl.name);
                return (
                  <button
                    key={lbl.name}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleLabel(lbl.name)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? `${lbl.color} ring-1 ring-white/20 font-semibold`
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {lbl.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Penanggung Jawab (Tim PPKI)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {users.map((u) => {
                const isAssigned = assignedTo.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleAssignee(u.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                      isAssigned
                        ? 'bg-indigo-950/40 border-indigo-700 text-indigo-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-200 flex items-center justify-center flex-shrink-0">
                      {u.avatar || u.name.charAt(0)}
                    </span>
                    <span className="text-xs truncate flex-1">{u.name}</span>
                    {isAssigned && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Activity Log */}
          {isEditing && cardActivities.length > 0 && (
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2">
                <History className="w-3.5 h-3.5" />
                <span>Riwayat Aktivitas Kartu</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {cardActivities.map((act) => {
                  const date = new Date(act.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={act.id}
                      className="text-[11px] text-zinc-400 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/80"
                    >
                      <span className="font-semibold text-zinc-200">{act.userName}</span>{' '}
                      {act.action} &bull; <span className="text-zinc-400">{date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
            {isEditing && canManage && card ? (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDelete(card.id)}
                      className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Yakin Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Tutup
              </button>

              {canManage && (
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Buat Kartu'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
