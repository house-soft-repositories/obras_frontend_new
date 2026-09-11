'use client';

import { ToastContainer } from '@/core/ui/molecules/toast-container';
import {
  Toast,
  ToastContextType,
  ToastOptions,
  ToastType,
} from '@/core/types/toast';
import React, { createContext, useCallback, useState } from 'react';

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      const id = options?.id || generateId();
      const duration = options?.duration ?? 5000;
      const position = options?.position ?? 'bottom-right';

      const newToast: Toast = {
        id,
        message,
        type,
        duration,
        position,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);

        return () => clearTimeout(timer);
      }
    },
    [generateId, removeToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'success', options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'error', options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'info', options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast(message, 'warning', options);
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
