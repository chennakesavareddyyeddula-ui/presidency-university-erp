// =============================================================
// Toast.tsx — Floating toast notification component
// =============================================================

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAuth, type Toast as ToastItem } from '../context/AuthContext';

// Individual toast bubble
const ToastBubble: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const configs = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800',
    },
  };

  const cfg = configs[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full
        transition-all duration-300 ${cfg.bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${cfg.titleColor}`}>{toast.message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast container — fixed bottom-right
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastBubble toast={t} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
};
