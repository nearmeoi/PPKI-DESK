import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
};

const STYLES = {
  success: 'bg-white border-emerald-200 text-emerald-800 shadow-lg',
  error:   'bg-white border-red-200 text-red-800 shadow-lg',
  info:    'bg-white border-indigo-200 text-indigo-800 shadow-lg',
};

const ICON_STYLES = {
  success: 'text-emerald-600',
  error:   'text-red-600',
  info:    'text-indigo-600',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm px-3">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold w-full pointer-events-auto',
              'animate-in slide-in-from-bottom-2 fade-in duration-200',
              STYLES[t.type],
            )}
          >
            <Icon className={cn('w-4 h-4 flex-shrink-0', ICON_STYLES[t.type])} />
            <span className="flex-1 text-slate-800">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
