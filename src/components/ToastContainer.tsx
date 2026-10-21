import { Bell, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-16 z-50 pointer-events-none w-full max-w-xl px-3.5 flex justify-end"
    >
      <div className="flex flex-col gap-2 items-end max-w-xs sm:max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border pointer-events-auto cursor-pointer shadow-lg transition-all',
              'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800 hover:bg-white',
              'animate-in slide-in-from-right-6 fade-in duration-200'
            )}
          >
            {/* Bell Icon */}
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-2xs">
              <Bell className="w-3.5 h-3.5" />
            </div>

            {/* Notification message */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                {t.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
