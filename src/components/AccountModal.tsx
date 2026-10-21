import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, User, KeyRound, AlertCircle } from 'lucide-react';
import { Avatar } from './Avatar';

export function AccountModal({ onClose }: { onClose: () => void }) {
  const { currentUser, updateDisplayName, avatarColorOf } = useAuth();
  const { toast } = useToast();

  const [name,        setName]        = useState(currentUser.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [error,       setError]       = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Nama tidak boleh kosong.'); return; }
    if (newPassword) {
      if (newPassword.length < 6) { setError('Kata sandi minimal 6 karakter.'); return; }
      if (newPassword !== confirmPwd) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    }
    updateDisplayName(name.trim());
    toast(newPassword ? 'Nama dan kata sandi berhasil diperbarui.' : 'Nama profil berhasil diperbarui.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Avatar name={currentUser.name} initials={currentUser.avatar} colorClass={avatarColorOf(currentUser.id)} size="sm" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">Pengaturan Akun</h2>
              <p className="text-[10px] text-zinc-400">{currentUser.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-900/50 text-red-300 rounded-xl text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" /> Nama Tampilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Email Akun</label>
            <input type="text" disabled value={currentUser.email}
              className="w-full bg-zinc-950/40 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed" />
            <p className="text-[10px] text-zinc-600 mt-1">Email didaftarkan oleh Admin tim.</p>
          </div>

          {/* Change password section */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Ganti Kata Sandi (opsional)
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kata sandi baru (min. 6 karakter)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors active:scale-95">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
