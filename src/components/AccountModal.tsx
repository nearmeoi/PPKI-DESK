import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, KeyRound, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AccountModalProps {
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onClose }) => {
  const { currentUser, updateCurrentUser } = useAuth();

  const [name, setName] = useState(currentUser.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMsg({ type: 'error', text: 'Nama tidak boleh kosong.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setStatusMsg({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMsg({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
        return;
      }
    }

    updateCurrentUser(name.trim());
    setStatusMsg({
      type: 'success',
      text: newPassword
        ? 'Nama dan kata sandi berhasil diperbarui.'
        : 'Profil berhasil diperbarui.',
    });

    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Pengaturan Akun & Sandi
              </h2>
              <p className="text-[11px] text-zinc-400">
                Ubah nama tampilan atau ganti kata sandi Anda
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

        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
          {statusMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-900/60 text-emerald-300'
                  : 'bg-red-950/60 border-red-900/60 text-red-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Email Akun
            </label>
            <input
              type="text"
              disabled
              value={currentUser.email}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-400 cursor-not-allowed"
            />
            <span className="text-[10px] text-zinc-400 mt-1 block">
              Email terdaftar oleh Admin tim.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nama Tampilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Ganti Kata Sandi (Opsional)</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
