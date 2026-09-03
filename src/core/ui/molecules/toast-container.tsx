'use client';

import { Toast } from '@/core/types/toast';
import { Toast as ToastComponent } from '@/core/ui/atoms/toast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getPositionStyles = (position: Toast['position']) => {
    const baseStyles = 'fixed z-[11001] flex flex-col gap-2 pointer-events-none';
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };
    return `${baseStyles} ${positions[position]}`;
  };

  // Group toasts by position
  const groupedToasts = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || 'bottom-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<string, Toast[]>
  );

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={getPositionStyles(position as Toast['position'])}
        >
          {positionToasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastComponent {...toast} onClose={onRemove} />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
