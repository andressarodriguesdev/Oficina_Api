import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertCircle };
const styles: Record<ToastType, string> = {
  success: 'border-emerald-500/40 text-emerald-300', error: 'border-red-500/40 text-red-300',
  info: 'border-sky-500/40 text-sky-300', warning: 'border-amber-500/40 text-amber-300',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);
  const value = useMemo<ToastContextValue>(() => ({
    toast, success: (m) => toast(m, 'success'), error: (m) => toast(m, 'error'),
    info: (m) => toast(m, 'info'), warning: (m) => toast(m, 'warning'),
  }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-ink-850/95 px-4 py-3 shadow-card backdrop-blur animate-slide-up ${styles[t.type]}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm text-ink-100">{t.message}</p>
              <button onClick={() => remove(t.id)} className="rounded p-0.5 text-ink-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
