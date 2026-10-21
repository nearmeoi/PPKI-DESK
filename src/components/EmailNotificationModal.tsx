import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Mail, Send, Info } from 'lucide-react';

export function EmailNotificationModal({ onClose }: { onClose: () => void }) {
  const { users } = useAuth();
  const { toast } = useToast();

  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');
  const [template, setTemplate] = useState<'assignment' | 'deadline'>('assignment');
  const [sending, setSending] = useState(false);

  const target = users.find((u) => u.id === selectedUserId) ?? users[0];

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast(`Simulasi email terkirim ke ${target?.email}`);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">Notifikasi Email</h2>
              <p className="text-[10px] text-zinc-400">Gmail SMTP – simulasi & konfigurasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-2.5 p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl text-xs">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Cara kerja notifikasi</p>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Email dikirim otomatis melalui Gmail SMTP (dengan App Password) setiap kali kartu tugas di-assign ke anggota baru atau saat mendekati deadline (H-1). Konfigurasi SMTP di backend atau Supabase Edge Function.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Penerima</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} – {u.email}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Jenis Notifikasi</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value as 'assignment' | 'deadline')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                <option value="assignment">Penugasan Baru</option>
                <option value="deadline">Pengingat Deadline (H-1)</option>
              </select>
            </div>
          </div>

          {/* Email preview */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
            <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">email preview – via Gmail SMTP</span>
              <div className="w-12" />
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="text-[10px] text-zinc-500 space-y-0.5 border-b border-zinc-800 pb-3">
                <p><strong className="text-zinc-400">Dari:</strong> PPKI Progress &lt;no-reply@ppki.id&gt;</p>
                <p><strong className="text-zinc-400">Kepada:</strong> {target?.name} &lt;{target?.email}&gt;</p>
                <p><strong className="text-zinc-400">Subjek:</strong>{' '}
                  {template === 'assignment'
                    ? '[PPKI Progress] Tugas baru ditugaskan kepada Anda'
                    : '[PPKI Progress] Pengingat deadline tugas (H-1)'}
                </p>
              </div>
              <div className="text-zinc-300 space-y-2 text-[11px] leading-relaxed">
                <p>Halo <strong>{target?.name}</strong>,</p>
                {template === 'assignment' ? (
                  <p>
                    Anda baru saja ditugaskan pada: <span className="text-indigo-300 font-semibold">"Setup project repository & environment"</span>.
                    Silakan buka papan PPKI Progress untuk melihat detail tugas.
                  </p>
                ) : (
                  <p>
                    Pengingat: tugas <span className="text-amber-300 font-semibold">"Implementasi sistem notifikasi email SMTP"</span>{' '}
                    memiliki batas waktu besok, <strong>26 Oktober 2026</strong>. Pastikan sudah diperbarui statusnya di papan.
                  </p>
                )}
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-[10px] space-y-1">
                  <p className="text-zinc-500">Status: <span className="text-zinc-300 font-semibold">Review</span></p>
                  <p className="text-zinc-500">Papan: <span className="text-zinc-300">PPKI Progress Board</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-[10px] text-zinc-600">Email belum benar-benar terkirim – ini adalah simulasi</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
              Tutup
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Mengirim…' : 'Uji Kirim Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
