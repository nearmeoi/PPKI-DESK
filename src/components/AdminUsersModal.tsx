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
    if (!name.trim() || !email.trim()) { setError('Nama dan email wajib diisi.'); return; }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Email sudah terdaftar.'); return;
    }
    addUser(name.trim(), email.trim(), role);
    setName(''); setEmail(''); setRole('member'); setError('');
    toast(`Akun ${name.trim()} berhasil dibuat. Sandi awal: ${initPwd}`);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`Hapus anggota ${userName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const ok = deleteUser(userId);
    if (ok) toast(`${userName} telah dihapus dari tim.`, 'info');
    else toast('Tidak dapat menghapus akun yang sedang aktif.', 'error');
  };

  const handleResetAll = () => {
    if (!confirm('Reset semua data ke kondisi awal? Semua kartu dan aktivitas akan dihapus.')) return;
    storage.hardReset();
    toast('Data berhasil direset ke seed awal.', 'info');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">Panel Admin</h2>
              <p className="text-[10px] text-zinc-400">Kelola anggota tim PPKI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add user form */}
          <form onSubmit={handleAdd} className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 mb-1">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Tambah Anggota Baru
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-950/50 border border-red-900/50 text-red-300 rounded-xl text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Nama Lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama anggota"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@ppki.id"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Peran</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  <option value="member">Anggota</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Kata Sandi Awal</label>
                <input type="text" value={initPwd} onChange={(e) => setInitPwd(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm active:scale-95">
                Tambah Anggota
              </button>
            </div>
          </form>

          {/* User list */}
          <div>
            <p className="text-xs font-semibold text-zinc-300 mb-2.5">Daftar Anggota ({users.length})</p>
            <div className="space-y-2">
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/60 rounded-2xl gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.name} initials={u.avatar} colorClass={avatarColorOf(u.id)} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-zinc-100 truncate">{u.name}</p>
                          {isSelf && (
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded-full border border-indigo-900/50">Anda</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        u.role === 'admin'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700',
                      )}>
                        {u.role === 'admin' ? 'Admin' : 'Anggota'}
                      </span>

                      <button
                        onClick={() => toast(`Email reset sandi dikirim ke ${u.email}.`, 'info')}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        title="Kirim reset sandi"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
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
          <div className="border border-red-900/40 rounded-2xl p-4 bg-red-950/10 space-y-2.5">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Zona Berbahaya</p>
            <p className="text-[11px] text-zinc-500">
              Reset seluruh data aplikasi (kartu, aktivitas, pengguna) ke kondisi seed awal. Tidak dapat dibatalkan.
            </p>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-950/50 border border-red-900/50 rounded-xl hover:bg-red-900/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Semua Data
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
