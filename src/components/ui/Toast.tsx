'use client';

import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/cn';

const icons = {
  success: <CheckCircle2 className="text-success" size={20} />,
  error: <XCircle className="text-error" size={20} />,
  info: <Info className="text-info" size={20} />,
  warning: <AlertTriangle className="text-warning" size={20} />,
};

const borderColor = {
  success: 'border-l-success',
  error: 'border-l-error',
  info: 'border-l-info',
  warning: 'border-l-warning',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 rounded-lg border border-border border-l-4 bg-surface px-4 py-3 shadow-lg',
            borderColor[t.type],
          )}
        >
          {icons[t.type]}
          <span className="text-sm text-slate-700">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
