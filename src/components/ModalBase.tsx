import React, { useEffect } from 'react';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Maximum width class, e.g. 'max-w-md', 'max-w-2xl' */
  maxWidth?: string;
  /** Additional classes for the modal container */
  className?: string;
  /** Skip default padding if true */
  noPadding?: boolean;
}

export default function ModalBase({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'max-w-lg',
  className = '',
  noPadding = false
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] bg-surface border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Scrollable Content */}
        <div className={`flex flex-col flex-1 overflow-y-auto hide-scrollbar ${noPadding ? '' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
