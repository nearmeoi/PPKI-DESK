import { useState, useMemo } from 'react';
import type { CardItem, ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface MeetingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  projects: ProjectItem[];
}

export function MeetingSummaryModal({
  isOpen,
  onClose,
  cards,
  projects,
}: MeetingSummaryModalProps) {
  const { users } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate markdown report
  const summaryMarkdown = useMemo(() => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const todoCards = cards.filter((c) => c.columnId === 'todo');
    const inProgressCards = cards.filter((c) => c.columnId === 'in_progress');
    const reviewCards = cards.filter((c) => c.columnId === 'review');
    const doneCards = cards.filter((c) => c.columnId === 'done');

    let text = `*RINGKASAN PROGRES TIM PPKI*\n`;
    text += `Tanggal: ${today}\n`;
    text += `------------------------------------\n\n`;

    text += `*1. STATUS TUGAS KANBAN:*\n`;
    text += `• Selesai (Done): ${doneCards.length} tugas\n`;
    text += `• Sedang Berjalan: ${inProgressCards.length} tugas\n`;
    text += `• Menunggu Review: ${reviewCards.length} tugas\n`;
    text += `• Antrean (To Do): ${todoCards.length} tugas\n\n`;

    if (inProgressCards.length > 0) {
      text += `*Tugas Sedang Dikerjakan:*\n`;
      inProgressCards.forEach((c) => {
        const assignees = c.assignedTo
          .map((id) => users.find((u) => u.id === id)?.name || id)
          .join(', ');
        text += `- ${c.title} (${assignees || 'Belum di-assign'})\n`;
      });
      text += `\n`;
    }

    text += `*2. INISIATIF PROYEK STRATEGIS:*\n`;
    projects.forEach((prj) => {
      text += `• [${prj.code}] ${prj.title} - ${prj.progress}% (${prj.status})\n`;
    });
    text += `\n`;

    text += `*3. TENGGAT WAKTU TERDEKAT:*\n`;
    const upcomingDeadlines = cards
      .filter((c) => c.deadline)
      .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
      .slice(0, 4);

    if (upcomingDeadlines.length > 0) {
      upcomingDeadlines.forEach((c) => {
        text += `• ${c.deadline}: ${c.title}\n`;
      });
    } else {
      text += `• Tidak ada tenggat waktu kritis dalam waktu dekat.\n`;
    }

    text += `\nDiproduksi otomatis melalui PPKI Progress Web System`;
    return text;
  }, [cards, projects, users]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryMarkdown);
    setCopied(true);
    toast('Ringkasan rapat berhasil disalin ke papan klip.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Ringkasan Rapat & Progres Tim
              </h3>
              <p className="text-[11px] text-slate-500">
                Ekspor terstruktur siap salin untuk WhatsApp, Slack, atau briefing harian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Pratinjau Format Pesan Ringkasan:</span>
            <span className="text-[11px] text-slate-400 font-mono">Format Plain Text & Markdown</span>
          </div>

          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[45vh] overflow-y-auto">
            {summaryMarkdown}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Siap dibagikan ke seluruh tim
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
