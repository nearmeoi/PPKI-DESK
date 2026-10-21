import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Info,
  AlertCircle,
  X,
  BellRing,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import type { Toast } from '../types';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  activity: BellRing,
};

const ACCENTS = {
  success: {
    border: 'border-emerald-200/90',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    bar: 'bg-emerald-500',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    defaultTitle: 'Berhasil',
  },
  error: {
    border: 'border-rose-200/90',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    bar: 'bg-rose-500',
    badge: 'text-rose-700 bg-rose-50 border-rose-200',
    defaultTitle: 'Peringatan',
  },
  info: {
    border: 'border-indigo-200/90',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    bar: 'bg-indigo-600',
    badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    defaultTitle: 'Pemberitahuan',
  },
  activity: {
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    bar: 'bg-indigo-600',
    badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    defaultTitle: 'Aktivitas Tim PPKI',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const accent = ACCENTS[toast.type];
  const Icon = ICONS[toast.type];

  // Micro progress countdown
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'w-full bg-white/95 backdrop-blur-md border rounded-2xl shadow-xl overflow-hidden pointer-events-auto transition-all',
        'animate-in slide-in-from-top-3 sm:slide-in-from-right-8 fade-in duration-300',
        accent.border
      )}
    >
      <div className="p-3.5 space-y-2">
        {/* Top header: App title & timestamp */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-slate-800 font-bold uppercase tracking-wider">
              PPKI Progress
            </span>
            <span>&bull;</span>
            <span className="font-mono text-slate-500">
              {toast.timestamp || 'Baru saja'}
            </span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-2xs',
              accent.iconBg
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {toast.title || accent.defaultTitle}
            </p>
            <p className="text-xs text-slate-600 leading-snug mt-0.5 line-clamp-2">
              {toast.message}
            </p>
            {toast.author && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Oleh: <strong className="text-slate-600">{toast.author}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress countdown indicator line */}
      <div className="w-full h-1 bg-slate-100">
        <div
          className={cn('h-full transition-all duration-75 ease-linear', accent.bar)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
