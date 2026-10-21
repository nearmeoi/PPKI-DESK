import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Toast } from '../types';
import { generateId } from '../lib/utils';

export interface ToastOptions {
  title?: string;
  type?: Toast['type'];
  author?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, optionsOrType?: Toast['type'] | ToastOptions) => void;
  notifyActivity: (title: string, message: string, author?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, optionsOrType: Toast['type'] | ToastOptions = 'success') => {
      const id = generateId('toast');
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      let type: Toast['type'] = 'success';
      let title: string | undefined = undefined;
      let author: string | undefined = undefined;
      let duration = 4000;

      if (typeof optionsOrType === 'string') {
        type = optionsOrType;
      } else if (optionsOrType) {
        if (optionsOrType.type) type = optionsOrType.type;
        if (optionsOrType.title) title = optionsOrType.title;
        if (optionsOrType.author) author = optionsOrType.author;
        if (optionsOrType.duration) duration = optionsOrType.duration;
      }

      const newToast: Toast = {
        id,
        message,
        type,
        title,
        author,
        timestamp: timeStr,
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);
      setTimeout(() => {
        dismiss(id);
      }, duration);
    },
    [dismiss]
  );

  const notifyActivity = useCallback(
    (title: string, message: string, author?: string) => {
      toast(message, {
        title,
        type: 'activity',
        author,
        duration: 5000,
      });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, notifyActivity, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}
