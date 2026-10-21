import { useState } from 'react';
import type { ProjectItem, ProjectStatus, ProjectMilestone } from '../types';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProjectItem>) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ProjectDetailModalProps) {
  const { users, currentUser, isAdmin, avatarColorOf } = useAuth();

  const isEditing = Boolean(project);
  const canManage = isAdmin || (project && currentUser ? project.leaderId === currentUser.id : true);

  const [title, setTitle] = useState(project?.title ?? '');
  const [code, setCode] = useState(project?.code ?? 'PRJ-');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'in_progress');
  const [startDate, setStartDate] = useState(project?.startDate ?? '');
  const [targetDate, setTargetDate] = useState(project?.targetDate ?? '');
  const [leaderId, setLeaderId] = useState(project?.leaderId ?? (currentUser?.id ?? ''));
  const [teamMembers, setTeamMembers] = useState<string[]>(project?.teamMembers ?? [currentUser?.id ?? '']);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(project?.milestones ?? []);
  const [notes, setNotes] = useState(project?.notes ?? '');

  // New milestone inline form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  if (!isOpen) return null;

  // Toggle milestone completion
  const handleToggleMilestone = (mId: string) => {
    const updated = milestones.map((m) =>
      m.id === mId ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);

    // Auto-calculate progress
    const completedCount = updated.filter((m) => m.completed).length;
    const progressPct = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;

    if (project) {
      onSave({
        milestones: updated,
        progress: progressPct,
        status: progressPct === 100 ? 'completed' : status === 'completed' ? 'in_progress' : status,
      });
    }
  };

  // Add new milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM: ProjectMilestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate || targetDate,
      completed: false,
    };

    const nextList = [...milestones, newM];
    setMilestones(nextList);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    setShowAddMilestone(false);

    if (project) {
      const completedCount = nextList.filter((m) => m.completed).length;
      const progressPct = Math.round((completedCount / nextList.length) * 100);
      onSave({ milestones: nextList, progress: progressPct });
    }
  };

  // Save whole project
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const completedCount = milestones.filter((m) => m.completed).length;
    const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    onSave({
      title: title.trim(),
      code: code.trim(),
      description: description.trim(),
      status,
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      leaderId,
      teamMembers,
      milestones,
      progress: progressPct,
      notes: notes.trim(),
    });
    onClose();
  };

  // Toggle team member
  const toggleMember = (uId: string) => {
    if (!canManage) return;
    setTeamMembers((prev) =>
      prev.includes(uId) ? prev.filter((id) => id !== uId) : [...prev, uId]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              {isEditing ? `Rincian Proyek ${project?.code}` : 'Rencanakan Proyek Baru'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {isEditing ? project?.title : 'Formulir Proyek PPKI'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title & Code */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Kode</label>
              <input
                type="text"
                value={code}
                disabled={!canManage}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PRJ-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Judul Proyek</label>
              <input
                type="text"
                value={title}
                disabled={!canManage}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Portal Web PPKI 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Deskripsi Proyek</label>
            <textarea
              rows={2}
              value={description}
              disabled={!canManage}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tujuan, ruang lingkup, dan hasil yang diharapkan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Status & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Status</label>
              <select
                value={status}
                disabled={!canManage}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="planning">Perencanaan</option>
                <option value="in_progress">Sedang Berjalan</option>
                <option value="completed">Selesai</option>
                <option value="on_hold">Ditunda</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                disabled={!canManage}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Target Selesai</label>
              <input
                type="date"
                value={targetDate}
                disabled={!canManage}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Project Leader */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Penanggung Jawab (PIC / Lead)</label>
            <select
              value={leaderId}
              disabled={!canManage}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'admin' ? 'Admin' : 'Anggota'})
                </option>
              ))}
            </select>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Tim yang Terlibat</label>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => {
                const isSelected = teamMembers.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={!canManage}
                    onClick={() => toggleMember(u.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <Avatar
                      name={u.name}
                      initials={u.avatar}
                      colorClass={avatarColorOf(u.id)}
                      size="xs"
                    />
                    <span className="truncate flex-1">{u.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestones Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target & Milestone Proyek ({milestones.filter((m) => m.completed).length}/{milestones.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Centang untuk memperbarui progres proyek secara instan
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              )}
            </div>

            {/* Add milestone inline subform */}
            {showAddMilestone && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="Nama milestone target..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Simpan Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Milestone items list */}
            <div className="space-y-1.5">
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Belum ada milestone target.</p>
              ) : (
                milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer',
                      m.completed
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium truncate',
                          m.completed ? 'line-through text-slate-500' : 'text-slate-800'
                        )}
                      >
                        {m.title}
                      </span>
                    </div>
                    {m.dueDate && (
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-2">
                        {m.dueDate}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Catatan Proyek</label>
            <input
              type="text"
              value={notes}
              disabled={!canManage}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk tim..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            {project && onDelete && canManage ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin menghapus proyek ini?')) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Proyek</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              {canManage && (
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Buat Proyek'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
