import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Send, CheckCircle2, Info } from 'lucide-react';

interface EmailNotificationModalProps {
  onClose: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({ onClose }) => {
  const { users } = useAuth();
  const [selectedUser, setSelectedUser] = useState(users[0]?.id || '');
  const [templateType, setTemplateType] = useState<'assignment' | 'deadline'>('assignment');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const targetMember = users.find((u) => u.id === selectedUser) || users[0];

  const handleSimulateSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Sistem Notifikasi Email (Gmail SMTP)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Integrasi pengiriman email tugas & deadline untuk tim PPKI
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

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Info Banner */}
          <div className="flex items-start gap-2.5 p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Alur Pengiriman Notifikasi</p>
              <p className="text-zinc-300 text-[11px] mt-0.5 leading-relaxed">
                Notifikasi dikirim melalui akun Gmail SMTP (misal: menggunakan App Password Google atau Supabase Edge Function / Resend) secara otomatis setiap kali anggota ditugaskan ke kartu tugas baru atau saat mendekati deadline.
              </p>
            </div>
          </div>

          {sendSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Simulasi notifikasi email ke <strong>{targetMember?.email}</strong> berhasil terkirim.</span>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Pilih Penerima
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Jenis Template Notifikasi
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as 'assignment' | 'deadline')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="assignment">Tugas Baru Ditugaskan</option>
                <option value="deadline">Peringatan Mendekati Deadline</option>
              </select>
            </div>
          </div>

          {/* Email Preview Mock */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
            <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-zinc-300">Pratinjau Email Masuk</span>
              </div>
              <span className="text-[10px]">via Gmail SMTP</span>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="text-[11px] text-zinc-400 space-y-0.5 border-b border-zinc-800/80 pb-2">
                <p><strong>Dari:</strong> PPKI Progress &lt;no-reply@ppki.id&gt;</p>
                <p><strong>Kepada:</strong> {targetMember?.name} &lt;{targetMember?.email}&gt;</p>
                <p><strong>Subjek:</strong> {templateType === 'assignment' ? '[PPKI Progress] Anda ditugaskan pada tugas baru' : '[PPKI Progress] Pengingat Deadline Tugas (H-1)'}</p>
              </div>

              <div className="pt-2 text-zinc-200 space-y-2 text-[12px] leading-relaxed">
                <p>Halo <strong>{targetMember?.name}</strong>,</p>
                {templateType === 'assignment' ? (
                  <p>
                    Anda baru saja ditugaskan sebagai penanggung jawab untuk tugas: <span className="font-semibold text-indigo-300">"Desain wireframe antarmuka PPKI Progress"</span>.
                  </p>
                ) : (
                  <p>
                    Ini adalah pengingat bahwa tugas <span className="font-semibold text-amber-300">"Integrasi pengiriman email notifikasi Gmail SMTP"</span> memiliki batas waktu pada <strong>28 Oktober 2026</strong>.
                  </p>
                )}
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px] space-y-1">
                  <p className="text-zinc-400">Status Saat Ini: <span className="text-zinc-200 font-semibold">In Progress</span></p>
                  <p className="text-zinc-400">Papan: <span className="text-zinc-200">PPKI Progress Board</span></p>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Silakan buka papan kerja tim PPKI untuk memperbarui progres pekerjaan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Kirim uji coba ke email simulasi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            <button
              disabled={isSending}
              onClick={handleSimulateSend}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Mengirim...' : 'Kirim Uji Coba Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
