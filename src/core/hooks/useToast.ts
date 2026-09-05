'use client';

import { ToastContext } from '@/core/context/ToastProvider';
import { ToastContextType } from '@/core/types/toast';
import { useContext } from 'react';

const noop = () => {};

const ssrSafeFallback: ToastContextType = {
  toasts: [],
  addToast: noop,
  removeToast: noop,
  clearToasts: noop,
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
};

export function useToast() {
  const context = useContext(ToastContext);

  // Durante SSR (ou em ambientes onde o ToastProvider ainda não montou)
  // retornamos um fallback inerte para não derrubar o render. O ToastProvider
  // real assume na hidratação.
  if (context === undefined) {
    return ssrSafeFallback;
  }

  return context;
}
