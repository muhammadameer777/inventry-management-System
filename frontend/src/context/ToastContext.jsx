import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-500 dark:text-emerald-400';
          let borderAccent = 'border-emerald-500/20';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-500 dark:text-rose-400';
            borderAccent = 'border-rose-500/20';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-500 dark:text-amber-400';
            borderAccent = 'border-amber-500/20';
          } else if (toast.type === 'info') {
            Icon = Info;
            iconColor = 'text-blue-500 dark:text-blue-400';
            borderAccent = 'border-blue-500/20';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100
                bg-white/90 dark:bg-[#151720]/90 text-slate-900 dark:text-white border ${borderAccent}
                shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_-5px_rgba(0,0,0,0.6)]`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
