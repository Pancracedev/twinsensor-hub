'use client';

import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  children: ReactNode;
  onClose?: () => void;
}

export const Alert = ({ type, children, onClose }: AlertProps) => {
  const baseStyles = 'p-4 rounded-lg flex items-center justify-between';

  const typeStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          ✕
        </button>
      )}
    </div>
  );
};
