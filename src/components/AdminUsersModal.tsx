import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AdminUsersModalProps {
  onClose: () => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({ onClose }) => {
  const { users, addUser, deleteUser, currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [initialPassword, setInitialPassword] = useState('ppki1234');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Nama dan email anggota wajib diisi.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
      setErrorMsg('Email ini sudah terdaftar.');
      return;
    }

    addUser(name.trim(), email.trim(), role);
    setSuccessMsg(`Akun untuk ${name} berhasil dibuat dengan sandi default: ${initialPassword}`);
    setName('');
    setEmail('');
    setRole('member');
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  const handleSimulateResetPassword = (userName: string) => {
    setResetNotice(`Instruksi reset sandi berhasil dikirim ke email ${userName}. Anggota dapat mengubah sandi saat login.`);
    setTimeout(() => setResetNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Kelola Pengguna Tim (Panel Admin)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Atur akun dan kata sandi awal anggota tim PPKI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-900/60 text-red-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetNotice && (
            <div className="flex items-center gap-2 p-3 bg-indigo-950/60 border border-indigo-900/60 text-indigo-300 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resetNotice}</span>
            </div>
          )}

          {/* Form Tambah Anggota */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 mb-3">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Tambah Anggota Baru</span>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fauzi@ppki.id"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="member">Anggota Tim</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Tambah Pengguna
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Anggota */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">
                Daftar Anggota Tim ({users.length})
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200 flex-shrink-0">
                        {u.avatar || u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{u.name}</p>
                          {isSelf && (
                            <span className="text-[9px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-900/50">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border capitalize ${
                          u.role === 'admin'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-900/50'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {u.role}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSimulateResetPassword(u.name)}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 rounded-md hover:bg-zinc-800 transition-colors"
                        title="Reset sandi anggota"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors"
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
