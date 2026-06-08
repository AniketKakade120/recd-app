'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import type { WatchlistList } from '@/lib/types';

import { Film } from 'lucide-react';
import ModalBase from './ModalBase';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: WatchlistList;
}

export default function ShareListModal({ isOpen, onClose, list }: ShareListModalProps) {
  const { setListPrivacy, addToast } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const [origin, setOrigin] = useState('https://recd.app');
  useState(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  });

  if (!isOpen) return null;

  const handleMakeShared = () => {
    setSubmitting(true);
    setTimeout(() => {
      setListPrivacy(list.id, 'shared');
      setSubmitting(false);
      addToast('List is now shareable.', { type: 'success' });
    }, 800);
  };

  const handleCopy = () => {
    const url = `${origin.replace(/^https?:\/\//, '')}/list/${list.id}`;
    navigator.clipboard.writeText(url);
    addToast('Link copied. Good taste travels.', { type: 'success' });
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Share list"
      maxWidth="max-w-sm"
    >

          {/* List Preview */}
          <div className="flex items-center gap-4 p-4 bg-ink border border-border rounded-2xl mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cinema-red/20 to-cinema-red/5 flex items-center justify-center border border-cinema-red/10 overflow-hidden text-2xl">
               {list.coverStyle === 'gradient' ? <Film className="w-6 h-6 text-cinema-red/50" strokeWidth={1.5} /> : <div className="w-full h-full bg-surface" />}
            </div>
            <div>
              <p className="font-bold text-bone">{list.name}</p>
              <p className="text-xs text-muted uppercase tracking-widest mt-0.5">{list.privacy}</p>
            </div>
          </div>

          {list.privacy === 'private' ? (
            <div className="space-y-6">
              <div className="p-4 bg-cinema-red/5 border border-cinema-red/20 rounded-2xl text-center">
                <p className="text-sm text-bone/80 leading-relaxed">
                  This list is private. Switch to <strong>Shared</strong> to create a public link.
                </p>
              </div>
              <button 
                onClick={handleMakeShared}
                disabled={submitting}
                className="w-full py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-xl hover:bg-cinema-red/90 transition-all btn-press flex items-center justify-center gap-3 text-xs"
              >
                {submitting ? 'Updating...' : 'Make Shared'}
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs font-bold text-muted hover:text-bone transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Share link</label>
                <div className="relative group">
                  <input 
                    readOnly
                    value={`${origin.replace(/^https?:\/\//, '')}/list/${list.id}`}
                    className="w-full bg-ink border border-border rounded-xl pl-4 pr-12 py-3 text-sm text-muted focus:outline-none"
                  />
                  <button 
                    onClick={handleCopy}
                    className="absolute right-2 top-2 p-1.5 text-cinema-red hover:bg-cinema-red/10 rounded-lg transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'whatsapp', name: 'WhatsApp', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-10.6 8.38 8.38 0 013.8.9L21 3.5l-2.1 4.7z"/></svg> },
                   { id: 'copy', name: 'Copy', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> },
                   { id: 'more', name: 'More', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
                 ].map(opt => (
                   <button 
                     key={opt.id}
                     onClick={opt.id === 'copy' ? handleCopy : () => addToast(`Sharing to ${opt.name}...`)}
                     className="flex flex-col items-center gap-2 p-4 bg-ink border border-border rounded-2xl hover:border-bone/20 transition-all"
                   >
                     <div className="text-muted group-hover:text-bone transition-colors">{opt.icon}</div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{opt.name}</span>
                   </button>
                 ))}
              </div>
            </div>
          )}
    </ModalBase>
  );
}
