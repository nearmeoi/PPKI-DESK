import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail, checkLoginRateLimit } from '../lib/security';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check rate-limit cooldown
  useEffect(() => {
    const checkStatus = () => {
      const limit = checkLoginRateLimit();
      if (limit.isLocked) {
        setLockoutSeconds(limit.remainingSeconds);
      } else {
        setLockoutSeconds(0);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutSeconds > 0) {
      setError(`Sistem terkunci sementara. Silakan tunggu ${lockoutSeconds} detik.`);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Alamat email wajib diisi.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Format email tidak valid. Gunakan format nama@domain.com.');
      return;
    }

    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        toast('Berhasil masuk ke sistem PPKI.');
      } else {
        setError(res.error || 'Autentikasi gagal.');
        const limit = checkLoginRateLimit();
        if (limit.isLocked) {
          setLockoutSeconds(limit.remainingSeconds);
        }
      }
    } catch {
      setError('Terjadi kendala pada verifikasi keamanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 antialiased text-slate-800">
      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col space-y-6">
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
            Sistem Pemantauan Progres Tim Internal
          </p>
        </div>

        {/* Lockout alert */}
        {lockoutSeconds > 0 && (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p>Perlindungan Brute-Force Aktif</p>
              <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                Coba lagi dalam <span className="font-bold">{lockoutSeconds}</span> detik.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && lockoutSeconds === 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                disabled={lockoutSeconds > 0 || loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="nama@ppki.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition-all shadow-2xs"
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
                autoComplete="current-password"
                value={password}
                disabled={lockoutSeconds > 0 || loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan kata sandi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition-all shadow-2xs"
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
            disabled={loading || lockoutSeconds > 0}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Papan'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
