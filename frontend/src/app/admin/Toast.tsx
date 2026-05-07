'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

type ToastEntry = { id: number; message: string };

type ToastContextValue = {
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const TOAST_DURATION_MS = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      const id = Date.now() + Math.random();
      setToasts((s) => [...s, { id, message }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ showSuccess }), [showSuccess]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              role="status"
              className="pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-[420px] bg-brand-700 text-accent-100 border border-accent-500/50 rounded-xl shadow-xl shadow-black/40 px-4 py-3 text-left hover:border-accent-300 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="size-5 text-accent-300 shrink-0" strokeWidth={1.75} />
              <span className="text-sm leading-snug">{t.message}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
