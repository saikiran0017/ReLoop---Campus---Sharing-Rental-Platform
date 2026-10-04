import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in">
      <div className="p-3.5 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg shadow-lg border border-zinc-700 dark:border-zinc-300 flex items-start justify-between gap-3 text-xs leading-normal">
        <div className="flex-1 font-medium">{message}</div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-800 text-sm font-mono cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
