import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />,
        };

        const bgBorders = {
          success: 'border-emerald-500/30 bg-surface-900/95 shadow-glow-emerald',
          error: 'border-rose-500/30 bg-surface-900/95 shadow-lg',
          warning: 'border-amber-500/30 bg-surface-900/95 shadow-lg',
          info: 'border-brand-500/30 bg-surface-900/95 shadow-glow',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${
              bgBorders[toast.type]
            } backdrop-blur-md text-white shadow-2xl transition-all transform animate-in slide-in-from-bottom-5 duration-300`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-2">
              <h5 className="text-sm font-semibold text-slate-100">{toast.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

