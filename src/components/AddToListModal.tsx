'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import CreateListModal from './CreateListModal';
import ModalBase from './ModalBase';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
}

export default function AddToListModal({ isOpen, onClose, titleId }: AddToListModalProps) {
  const { watchlistLists, addTitleToList, addTitleToWatchlist, watchlist, getTitle } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addedListName, setAddedListName] = useState('');

  const title = getTitle(titleId);
  const isSavedDefault = watchlist.some(item => item.titleId === titleId);

  if (!isOpen && !showCreateModal) return null;

  if (showCreateModal) {
    return (
      <CreateListModal 
        isOpen={true} 
        onClose={() => {
          setShowCreateModal(false);
          onClose();
        }} 
        preselectedTitleId={titleId} 
      />
    );
  }

  const handleAddToList = (listId: string, listName: string) => {
    addTitleToList(titleId, listId);
    setAddedListName(listName);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleSaveDefault = () => {
    if (isSavedDefault) return;
    addTitleToWatchlist(titleId);
    setAddedListName('Watchlist');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Watchlist"
      subtitle={`Save "${title?.title}" to your library`}
      maxWidth="max-w-md"
    >
      {!success ? (
        <>
          <div className="space-y-2 mb-6">
            <button 
              onClick={handleSaveDefault}
              disabled={isSavedDefault}
              className="w-full p-4 flex items-center justify-between bg-ink border border-border rounded-2xl hover:border-border-strong transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cinema-red/10 flex items-center justify-center text-cinema-red">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-bone">Default Watchlist</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider">{isSavedDefault ? 'Already saved' : 'Your personal feed'}</p>
                </div>
              </div>
              {!isSavedDefault && (
                <div className="w-6 h-6 rounded-full border border-border group-hover:border-cinema-red transition-colors" />
              )}
              {isSavedDefault && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cinema-red"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </button>

            <div className="py-2 px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Or add to a list</p>
            </div>

            <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2 hide-scrollbar">
              {watchlistLists.map(list => {
                const isInList = list.titleIds.includes(titleId);
                return (
                  <button 
                    key={list.id}
                    onClick={() => handleAddToList(list.id, list.name)}
                    className="w-full p-4 flex items-center justify-between bg-surface border border-border rounded-2xl hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-bone/40`}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-bone">{list.name}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider">{list.titleIds.length} titles</p>
                      </div>
                    </div>
                    {isInList ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cinema-red"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : (
                      <div className="w-5 h-5 rounded border border-border" />
                    )}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full p-4 flex items-center gap-3 text-cinema-red font-bold text-sm hover:bg-cinema-red/5 rounded-2xl transition-all"
            >
              <div className="w-10 h-10 rounded-xl border border-dashed border-cinema-red/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              Create new list
            </button>
          </div>
        </>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-cinema-red flex items-center justify-center text-bone mb-6 shadow-2xl shadow-cinema-red/40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-bone font-editorial">Added to {addedListName}</h2>
            <p className="text-sm text-muted mt-2">Personal library updated.</p>
        </div>
      )}
    </ModalBase>
  );
}
