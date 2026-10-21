import { useState } from 'react';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storage } from '../lib/storage';
import { Avatar } from './Avatar';
import { X, UserPlus, ShieldCheck, Trash2, KeyRound, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminUsersModal({ onClose }: { onClose: () => void }) {
  const { users, addUser, deleteUser, currentUser, avatarColorOf } = useAuth();
  const { toast } = useToast();

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState<Role>('member');
  const [initPwd, setInitPwd] = useState('ppki1234');
  const [error,   setError]   = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Email sudah terdaftar.');
      return;
    }
    addUser(name.trim(), email.trim(), role);
    setName('');
    setEmail('');
    setRole('member');
    setError('');
    toast(`Akun ${name.trim()} berhasil dibuat. Sandi awal: ${initPwd}`);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`Hapus anggota ${userName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const ok = deleteUser(userId);
    if (ok) toast(`${userName} telah dihapus dari tim.`, 'info');
    else toast('Tidak dapat menghapus akun yang sedang aktif.', 'error');
  };

  const handleResetAll = () => {
    if (!confirm('Reset semua data ke kondisi awal? Semua kartu dan aktivitas akan dikembalikan ke data default.')) return;
    storage.hardReset();
    toast('Data berhasil direset ke seed awal.', 'info');
    setTimeout(() => window.location.reload(), 600);
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Panel Admin Tim PPKI
              </h2>
              <p className="text-[11px] text-slate-500">Kelola akun anggota dan peran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add user form */}
          <form onSubmit={handleAdd} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Anggota Baru</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Akun</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rian@ppki.id"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Peran (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
                >
                  <option value="member">Anggota Tim</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kata Sandi Awal</label>
                <input
                  type="text"
                  value={initPwd}
                  onChange={(e) => setInitPwd(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Tambah Anggota
              </button>
            </div>
          </form>

          {/* User list */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2.5">
              Daftar Anggota Tim ({users.length})
            </p>
            <div className="space-y-2">
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={u.name}
                        initials={u.avatar}
                        colorClass={avatarColorOf(u.id)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          {isSelf && (
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-200">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          u.role === 'admin'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200',
                        )}
                      >
                        {u.role === 'admin' ? 'Admin' : 'Anggota'}
                      </span>

                      <button
                        onClick={() => toast(`Instruksi reset sandi dikirim ke ${u.email}.`, 'info')}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        title="Reset sandi anggota"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="border border-red-200 rounded-2xl p-4 bg-red-50/40 space-y-2">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Zona Berbahaya
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reset seluruh data aplikasi (kartu, aktivitas, akun anggota) kembali ke seed awal tim PPKI.
            </p>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Data ke Awal</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
