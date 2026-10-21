import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { CardItem } from '../types';
import { Avatar } from './Avatar';
import {
  ArrowLeft,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Calendar,
  CheckSquare,
  Clock,
  Check,
  Camera,
} from 'lucide-react';
import { formatTimestamp } from '../lib/utils';

interface ProfilePageProps {
  cards: CardItem[];
  onBackToBoard: () => void;
}

export function ProfilePage({ cards, onBackToBoard }: ProfilePageProps) {
  const { currentUser, updateDisplayName, changePassword, logout, avatarColorOf, isAdmin } = useAuth();
  const { toast } = useToast();

  // Personal name state
  const [name, setName] = useState(currentUser?.name ?? '');
  const [nameSaved, setNameSaved] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!currentUser) return null;

  // Calculate task stats
  const myCards = cards.filter((c) => c.assignedTo.includes(currentUser.id));
  const inProgressCount = myCards.filter((c) => c.columnId === 'in_progress').length;
  const reviewCount = myCards.filter((c) => c.columnId === 'review').length;
  const doneCount = myCards.filter((c) => c.columnId === 'done').length;

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Nama tidak boleh kosong.', 'error');
      return;
    }
    updateDisplayName(name.trim());
    setNameSaved(true);
    toast('Nama profil berhasil diperbarui.');
    setTimeout(() => setNameSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) {
      setPasswordError('Masukkan kata sandi saat ini.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Masukkan kata sandi baru.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordSuccess('Kata sandi berhasil diperbarui.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('Kata sandi berhasil diganti.');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } else {
      setPasswordError(res.error || 'Gagal mengubah kata sandi.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToBoard}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu Utama</span>
        </button>

        <h1 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Pengaturan Akun & Profil
        </h1>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
          title="Keluar dari akun"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar with future customization badge */}
          <div className="relative group">
            <Avatar
              name={currentUser.name}
              initials={currentUser.avatar}
              colorClass={avatarColorOf(currentUser.id)}
              size="md"
              className="w-16 h-16 text-xl rounded-2xl shadow-xs"
            />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-indigo-600 transition-colors"
              title="Kustomisasi Avatar (Fitur akan segera hadir)"
              onClick={() => toast('Kustomisasi foto avatar personal akan tersedia pada pembaruan mendatang.', 'info')}
            >
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 truncate">
                {currentUser.name}
              </h2>
              {/* Strong Role Colors */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-600 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-white" /> Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <User className="w-3 h-3 text-white" /> Anggota Tim
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Terdaftar sejak: {formatTimestamp(currentUser.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* My Task Overview Stats */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Ringkasan Tugas Saya
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white border border-indigo-100 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>Berjalan</span>
              </div>
              <p className="text-xl font-bold text-indigo-900">{inProgressCount}</p>
              <p className="text-[10px] text-slate-400">In Progress</p>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                <CheckSquare className="w-3 h-3 text-amber-500" />
                <span>Review</span>
              </div>
              <p className="text-xl font-bold text-amber-900">{reviewCount}</p>
              <p className="text-[10px] text-slate-400">Menunggu Uji</p>
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Selesai</span>
              </div>
              <p className="text-xl font-bold text-emerald-900">{doneCount}</p>
              <p className="text-[10px] text-slate-400">Tugas Selesai</p>
            </div>
          </div>
        </div>

        {/* Section: Edit Profile Name */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Informasi Pengguna
            </h3>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Alamat email terdaftar dan dikelola oleh Administrator tim.
              </span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {nameSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : null}
                <span>{nameSaved ? 'Tersimpan' : 'Simpan Nama'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section: Change Password */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ubah Kata Sandi Akun
            </h3>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Kata sandi saat ini"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi sandi baru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>

        {/* Section: Logout Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-900">Keluar dari Sesi Ini</p>
            <p className="text-[11px] text-slate-400">Akhiri sesi akun Anda pada perangkat ini.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
