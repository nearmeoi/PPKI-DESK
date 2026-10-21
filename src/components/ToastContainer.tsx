import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-3.5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-1.5 pointer-events-none max-w-[92vw] sm:max-w-md w-auto"
    >
      {toasts.map((t) => {
        // Compact single-line text formatting: e.g. "implementasi - review - aldy"
        const displayText = t.message;

        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs cursor-pointer pointer-events-auto select-none',
              'bg-white/95 backdrop-blur-md shadow-md border-slate-200/90 text-slate-800 transition-all hover:bg-white',
              'animate-in slide-in-from-top-3 fade-in duration-200'
            )}
          >
            {/* Status dot */}
            <span
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                t.type === 'error'
                  ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                  : t.type === 'info'
                  ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.4)]'
                  : t.type === 'activity'
                  ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                  : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
              )}
            />

            {/* Simple brief notification text */}
            <span className="truncate max-w-[280px] sm:max-w-[340px] text-slate-700 font-medium">
              {displayText}
            </span>

            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              className="text-slate-400 hover:text-slate-700 p-0.5 ml-0.5 rounded-full transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
