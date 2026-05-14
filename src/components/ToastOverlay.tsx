'use client';

import { useApp } from '@/lib/context';
import { useEffect, useState } from 'react';

export default function ToastOverlay() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-bone text-ink px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="text-sm font-bold">{toast.message}</span>
          {toast.onUndo && (
            <button 
              onClick={() => {
                toast.onUndo?.();
                removeToast(toast.id);
              }}
              className="text-xs font-black uppercase tracking-widest text-cinema-red hover:opacity-70 transition-opacity"
            >
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
