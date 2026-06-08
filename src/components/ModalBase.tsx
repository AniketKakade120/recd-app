import React, { useEffect } from 'react';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Modal Title */
  title?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Maximum width class, e.g. 'max-w-md', 'max-w-2xl' */
  maxWidth?: string;
  /** Additional classes for the modal container */
  className?: string;
  /** Skip default padding if true */
  noPadding?: boolean;
  /** Hide the default header entirely */
  hideHeader?: boolean;
}

export default function ModalBase({ 
  isOpen, 
  onClose, 
  children, 
  title,
  subtitle,
  maxWidth = 'max-w-lg',
  className = '',
  noPadding = false,
  hideHeader = false
}: ModalBaseProps) {
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        className={`relative z-10 w-full h-[100dvh] sm:h-auto ${maxWidth} sm:max-h-[90vh] bg-surface sm:border border-border sm:shadow-2xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 sm:slide-in-from-bottom-4 duration-300 ${className}`}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-border bg-ink/50 sticky top-0 z-20 shrink-0 min-h-[56px] sm:min-h-[64px]">
            <div>
              {title && <h1 className="text-xl font-bold text-bone font-editorial leading-none">{title}</h1>}
              {subtitle && <p className="text-[10px] sm:text-xs text-muted uppercase tracking-widest font-semibold mt-1">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose}
              aria-label="Close modal"
              className="w-11 h-11 sm:w-8 sm:h-8 -mr-2 sm:mr-0 rounded-full sm:bg-surface sm:hover:bg-surface-hover sm:border sm:border-border flex items-center justify-center text-muted hover:text-bone transition-colors active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className={`flex flex-col flex-1 overflow-y-auto overscroll-contain hide-scrollbar ${noPadding ? '' : 'p-4 sm:p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
