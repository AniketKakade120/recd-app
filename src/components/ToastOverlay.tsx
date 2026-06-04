'use client';

import { useApp } from '@/lib/context';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function ToastOverlay() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[300] flex flex-col gap-3 pointer-events-none w-full max-w-[320px] px-4 sm:px-0">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        
        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-surface text-bone rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-stretch border border-border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {/* Color Bar */}
            <div className={`w-1.5 shrink-0 ${isSuccess ? 'bg-green-500' : isError ? 'bg-cinema-red' : 'bg-muted'}`} />
            
            <div className="flex-1 flex items-center p-4 gap-3 min-w-0">
              {/* Icon */}
              <div className="shrink-0">
                {isSuccess ? <CheckCircle2 className="text-green-500" size={20} /> :
                 isError ? <XCircle className="text-cinema-red" size={20} /> :
                 <Info className="text-muted" size={20} />}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-bold text-bone">
                  {isSuccess ? 'Success' : isError ? 'Error' : 'Notification'}
                </p>
                <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-snug pr-2" title={toast.message}>
                  {toast.message}
                </p>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-3 pl-3 border-l border-border/50">
                {toast.onUndo && (
                  <button 
                    onClick={() => { toast.onUndo?.(); removeToast(toast.id); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-cinema-red hover:text-cinema-red/70 transition-colors"
                  >
                    Undo
                  </button>
                )}
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-muted/60 hover:text-bone transition-colors p-1"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
