"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { Toast as ToastType } from "@/core/types/toast";

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, duration, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getStyles = () => {
    const baseStyles =
      "flex min-w-80 items-start gap-3 rounded-app px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300";

    const typeStyles = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const iconProps = { className: "mt-0.5 size-5 shrink-0" };

    const icons = {
      success: <CheckCircle {...iconProps} />,
      error: <AlertCircle {...iconProps} />,
      info: <Info {...iconProps} />,
      warning: <AlertTriangle {...iconProps} />,
    };

    return icons[type];
  };

  return (
    <div className={getStyles()}>
      {getIcon()}
      <span className="min-w-0 flex-1 text-sm leading-6 font-medium">
        {message}
      </span>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="-mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-sm ring-1 ring-white/30 transition-colors duration-200 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        aria-label="Fechar notificação"
      >
        <X aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
