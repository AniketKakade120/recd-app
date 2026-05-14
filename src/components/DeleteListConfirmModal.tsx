'use client';

import { useApp } from '@/lib/context';
import type { WatchlistList } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface DeleteListConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: WatchlistList;
}

export default function DeleteListConfirmModal({ isOpen, onClose, list }: DeleteListConfirmModalProps) {
  const { deleteWatchlistList, addToast } = useApp();
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = () => {
    deleteWatchlistList(list.id);
    addToast('List deleted.', { type: 'success' });
    router.push('/watchlist');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div 
        className="relative w-full max-w-sm bg-surface border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300"
      >
        <div className="w-16 h-16 bg-cinema-red/10 text-cinema-red rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </div>
        
        <h2 className="text-2xl font-bold font-editorial text-bone mb-3">Delete this list?</h2>
        <p className="text-sm text-muted leading-relaxed mb-10">
          This removes the list, but not the titles from your main Watchlist.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleDelete}
            className="w-full py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-xl hover:bg-cinema-red/90 transition-all btn-press text-xs"
          >
            Delete list
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 text-bone font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all btn-press text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
