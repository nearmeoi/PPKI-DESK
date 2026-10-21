import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
};

const STYLES = {
  success: 'bg-zinc-900 border-emerald-700/60 text-emerald-300',
  error:   'bg-zinc-900 border-red-700/60 text-red-300',
  info:    'bg-zinc-900 border-indigo-700/60 text-indigo-300',
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
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-xl text-xs font-medium w-full pointer-events-auto',
              'animate-in slide-in-from-bottom-2 fade-in duration-200',
              STYLES[t.type],
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-zinc-100">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
