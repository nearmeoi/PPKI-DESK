import { useState, useMemo } from 'react';
import type { Role, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storage } from '../lib/storage';
import { isValidEmail } from '../lib/security';
import { Avatar } from './Avatar';
import {
  X,
  UserPlus,
  ShieldCheck,
  Trash2,
  KeyRound,
  AlertCircle,
  RotateCcw,
  Edit2,
  Search,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminUsersModal({ onClose }: { onClose: () => void }) {
  const { users, addUser, updateUser, resetUserPassword, deleteUser, currentUser, avatarColorOf } = useAuth();
  const { toast } = useToast();

  if (!currentUser) return null;

  // Tabs: 'list' | 'create'
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Create form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [initPwd, setInitPwd] = useState('ppki1234');
  const [error, setError] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('member');
  const [editError, setEditError] = useState('');

  // Password reset inline state
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('ppki1234');

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Handle Create User
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setError('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Format email tidak valid. Gunakan format nama@domain.com.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setError('Alamat email sudah terdaftar.');
      return;
    }

    if (initPwd.length < 6) {
      setError('Kata sandi awal minimal 6 karakter.');
      return;
    }

    await addUser(cleanName, cleanEmail, role, initPwd);
    setName('');
    setEmail('');
    setRole('member');
    setError('');
    setActiveTab('list');
    toast(`Akun ${cleanName} berhasil dibuat.`);
  };

  // Open Edit User
  const handleStartEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditError('');
  };

  // Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    const cleanName = editName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setEditError('Nama dan email tidak boleh kosong.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setEditError('Format email tidak valid.');
      return;
    }

    const emailTaken = users.some(
      (u) => u.id !== editingUser.id && u.email.toLowerCase() === cleanEmail
    );
    if (emailTaken) {
      setEditError('Email sudah digunakan oleh anggota lain.');
      return;
    }

    updateUser(editingUser.id, {
      name: cleanName,
      email: cleanEmail,
      role: editRole,
    });

    toast(`Data ${cleanName} berhasil diperbarui.`);
    setEditingUser(null);
  };

  // Handle Reset Password
  const handleExecuteResetPassword = async () => {
    if (!resetTargetUser) return;
    if (newResetPassword.length < 6) {
      toast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }

    await resetUserPassword(resetTargetUser.id, newResetPassword);
    toast(`Kata sandi ${resetTargetUser.name} berhasil direset.`);
    setResetTargetUser(null);
  };

  // Handle Delete User
  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`Hapus akun ${userName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const ok = deleteUser(userId);
    if (ok) toast(`${userName} telah dihapus dari sistem.`, 'info');
    else toast('Tidak dapat menghapus akun Anda sendiri.', 'error');
  };

  // Handle Hard Reset
  const handleResetAll = () => {
    if (
      !confirm(
        'Reset semua data ke kondisi awal? Seluruh kartu, proyek, dan akun akan dikembalikan ke default tim PPKI.'
      )
    )
      return;
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
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0 text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Manajemen Pengguna & Tim PPKI
              </h2>
              <p className="text-[11px] text-slate-500">Kelola akun, peran, dan hak akses sistem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/50">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditingUser(null);
              setResetTargetUser(null);
            }}
            className={cn(
              'pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer',
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Daftar Anggota ({users.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setEditingUser(null);
              setResetTargetUser(null);
            }}
            className={cn(
              'pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Anggota</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: USER LIST (READ, UPDATE, DELETE, RESET PASSWORD) */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {/* Search user */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau email anggota..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Edit User Drawer/Subform */}
              {editingUser && (
                <form
                  onSubmit={handleSaveEdit}
                  className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Anggota: {editingUser.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Batal
                    </button>
                  </div>

                  {editError && (
                    <p className="text-[11px] text-rose-600 font-semibold">{editError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Nama</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Peran (Role)</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as Role)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="member">Anggota Tim</option>
                      <option value="admin">Administrator (Akses Penuh)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Password Modal/Subform */}
              {resetTargetUser && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Kata Sandi: {resetTargetUser.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetTargetUser(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Batal
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Masukkan kata sandi baru untuk akun {resetTargetUser.email}:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="ppki1234"
                      className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleExecuteResetPassword}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex-shrink-0 cursor-pointer shadow-xs"
                    >
                      Terapkan Sandi
                    </button>
                  </div>
                </div>
              )}

              {/* User cards list */}
              <div className="space-y-2">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser.id;

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl gap-2 shadow-2xs hover:border-slate-300 transition-colors"
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

                      {/* Role badge in strong color & action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {u.role === 'admin' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-white shadow-2xs">
                            Anggota
                          </span>
                        )}

                        {/* Edit User Button */}
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit data anggota"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => {
                            setResetTargetUser(u);
                            setNewResetPassword('ppki1234');
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Reset sandi"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User Button */}
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          )}

          {/* TAB 2: CREATE NEW USER */}
          {activeTab === 'create' && (
            <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Registrasi Akun Anggota Tim</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Prakoso"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Alamat Email (Format Standar)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rian@ppki.id"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Peran Akses
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="member">Anggota Tim</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kata Sandi Awal
                    </label>
                    <input
                      type="text"
                      value={initPwd}
                      onChange={(e) => setInitPwd(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simpan Anggota Baru
                </button>
              </div>
            </form>
          )}

          {/* Danger Zone: System Reset */}
          <div className="border border-red-200 rounded-2xl p-4 bg-red-50/40 space-y-2 mt-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Zona Berbahaya
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reset seluruh data aplikasi (kartu, proyek, aktivitas, dan akun) kembali ke seed awal tim PPKI.
            </p>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Data ke Kondisi Awal</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
