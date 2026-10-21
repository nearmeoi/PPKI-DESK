import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { Avatar } from './Avatar';

export function LoginPage() {
  const { login, users, avatarColorOf } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        toast('Berhasil masuk ke papan kerja PPKI.');
      } else {
        setError(res.error || 'Gagal masuk. Periksa kembali email dan sandi.');
      }
    }, 300);
  };

  const handleSelectQuickAccount = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('ppki1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 antialiased text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 p-2 mx-auto flex items-center justify-center shadow-xs">
            <img
              src="/icon.png"
              alt="PPKI"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PPKI Progress</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Masuk dengan akun tim untuk memantau dan memperbarui progres pekerjaan bersama.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Anggota Tim
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="nama@ppki.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Kata sandi akun"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Memeriksa Akun...' : 'Masuk ke Papan'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Quick select team accounts */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pilih Akun Tim PPKI
            </span>
            <span className="text-[10px] text-slate-400">Sandi default: ppki1234</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = email.toLowerCase() === u.email.toLowerCase();
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectQuickAccount(u.email)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      name={u.name}
                      initials={u.avatar}
                      colorClass={avatarColorOf(u.id)}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === 'admin'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Anggota'}
                    </span>
                    {isSelected && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
          Tim Web PPKI &bull; Alat Internal
        </div>
      </div>
    </div>
  );
}
