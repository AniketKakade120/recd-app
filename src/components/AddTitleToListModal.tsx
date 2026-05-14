'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import type { WatchlistList, Title } from '@/lib/types';

interface AddTitleToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: WatchlistList;
}

export default function AddTitleToListModal({ isOpen, onClose, list }: AddTitleToListModalProps) {
  const { titles, addTitleToList, isTitleInList, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return titles.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [searchQuery, titles]);

  if (!isOpen) return null;

  const handleAdd = (title: Title) => {
    if (isTitleInList(title.id, list.id)) return;
    addTitleToList(title.id, list.id);
    addToast(`Added to ${list.name}.`, { type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div 
        className="relative w-full max-w-lg bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-editorial text-bone leading-tight">Add to {list.name}</h2>
              <p className="text-xs text-muted mt-1 uppercase tracking-widest">{list.titleIds.length} titles currently</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-bone">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="relative mb-6">
            <input 
              autoFocus
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search movies and shows..."
              className="w-full bg-ink border border-border rounded-2xl pl-14 pr-4 py-4 text-bone focus:outline-none focus:border-cinema-red transition-all shadow-inner"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 scrollbar-hide">
          {searchQuery.trim() === '' ? (
            <div className="py-20 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <p className="text-muted font-medium italic">Search for something worth saving.</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {searchResults.map(title => {
                const isAdded = isTitleInList(title.id, list.id);
                return (
                  <div key={title.id} className="flex items-center gap-4 p-3 bg-ink/50 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                    <div className={`w-12 h-18 rounded-lg overflow-hidden shrink-0 poster-gradient-${title.posterGradient}`}>
                      {title.posterUrl && <img src={title.posterUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-bone truncate">{title.title}</p>
                      <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">{title.releaseYear} • {title.format}</p>
                    </div>
                    <button 
                      onClick={() => handleAdd(title)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isAdded 
                          ? 'bg-white/5 text-muted cursor-default' 
                          : 'bg-cinema-red text-bone hover:bg-cinema-red/90 btn-press'
                      }`}
                    >
                      {isAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <p className="text-muted font-medium italic">Couldn’t find that one. Try another title.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-surface">
           <button onClick={onClose} className="text-xs font-bold text-muted hover:text-bone transition-colors">Done</button>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">Rec&apos;d Library</p>
        </div>
      </div>
    </div>
  );
}
