'use client';

import Link from 'next/link';
import type { WatchlistItem, Title, User, WatchlistList } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import { useState } from 'react';
import VerdictModal from './VerdictModal';
import { useRouter } from 'next/navigation';

interface ListTitleCardProps {
  item: WatchlistItem;
  list: WatchlistList;
}

export default function ListTitleCard({ item, list }: ListTitleCardProps) {
  const { getTitle, getUser, removeTitleFromList, addToast, addTitleToList, openRecommendModal, openGiveVerdictModal, markAsWatchedInList, unmarkAsWatchedInList } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const router = useRouter();
  
  const title = getTitle(item.titleId);
  const recommender = item.recommendedBy ? getUser(item.recommendedBy) : null;
  const isWatched = list.watchedTitleIds?.includes(item.titleId) || false;

  if (!title) return null;

  const handleRemove = () => {
    removeTitleFromList(list.id, title.id);
    setShowMenu(false);
    addToast(`Removed from ${list.name}.`, { 
      type: 'info',
      onUndo: () => addTitleToList(title.id, list.id)
    });
  };

  const handleVerdictAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.verdictState === 'verdict_given') {
      setShowVerdictModal(true);
    } else if (item.verdictState === 'verdict_pending' && item.addedFromRecommendationId) {
      openGiveVerdictModal(item.addedFromRecommendationId);
    } else {
      router.push(`/title/${item.titleId}`);
    }
  };

  return (
    <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-2xl flex flex-col h-full">
      {/* Click Overlay */}
      <Link href={`/title/${title.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${title.title}`} />
      
      {/* Poster Area */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {title.posterUrl ? (
          <img 
            src={title.posterUrl} 
            alt={title.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full poster-gradient-${title.posterGradient || 1}`} />
        )}
        
        {/* Overlay context */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex items-center justify-between">
            {item.verdictState === 'verdict_given' && item.stamp ? (
              <StampBadge stamp={item.stamp} size="xs" variant="filled" />
            ) : item.verdictState === 'verdict_pending' ? (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-cinema-red/30 bg-cinema-red/10 text-cinema-red">
                Verdict Pending
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-bone/60">
                {item.addedBy === 'self' ? 'Saved by you' : item.addedBy === 'recommendation' ? `Rec'd by ${recommender?.displayName || 'Crew'}` : 'Group Pick'}
              </span>
            )}
          </div>
        </div>

        {/* More Menu Trigger */}
        <button 
          onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
          className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-md rounded-full text-bone opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-cinema-red"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>

        {showMenu && (
          <div className="absolute top-12 right-2 w-48 bg-bone rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="py-1">
              <Link href={`/title/${title.id}`} className="flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                 View Details
              </Link>
              <button 
                onClick={() => { openRecommendModal({ titleId: title.id }); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
                 Recommend this
              </button>
              <div className="h-px bg-ink/5 my-1" />
              <button 
                onClick={handleRemove}
                className="w-full flex items-center gap-3 px-4 py-3 text-cinema-red text-xs font-bold hover:bg-cinema-red/5 transition-colors text-left"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                 Remove from list
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col relative z-10 pointer-events-none">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-bone leading-tight group-hover:text-cinema-red transition-colors line-clamp-1">
            {title.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-muted font-black uppercase tracking-widest">{title.releaseYear}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[9px] text-muted font-black uppercase tracking-widest">{title.format}</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 pointer-events-auto">
             {item.verdictState === 'verdict_pending' ? (
               <button 
                 onClick={handleVerdictAction}
                 className="py-2 bg-cinema-red text-bone text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-cinema-red/90 transition-all btn-press"
               >
                 Verdict
               </button>
             ) : item.verdictState === 'verdict_given' ? (
               <button 
                 onClick={handleVerdictAction}
                 className="py-2 bg-white/5 border border-white/10 text-bone text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
               >
                 Verdict
               </button>
             ) : (
               <button 
                 onClick={handleVerdictAction}
                 className="py-2 bg-white/5 border border-white/10 text-bone text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
               >
                 View
               </button>
             )}

             {isWatched ? (
               <button 
                 onClick={(e) => { e.preventDefault(); unmarkAsWatchedInList(list.id, title.id); }}
                 className="py-2 bg-bone text-ink text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-bone/90 transition-all btn-press flex items-center justify-center gap-1.5"
               >
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                 Watched
               </button>
             ) : (
               <button 
                 onClick={(e) => { e.preventDefault(); markAsWatchedInList(list.id, title.id); }}
                 className="py-2 bg-white/5 border border-white/10 text-bone text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all btn-press flex items-center justify-center gap-1.5"
               >
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                 Mark Watched
               </button>
             )}
          </div>
        </div>
      </div>

      {item.addedFromRecommendationId && (
        <VerdictModal 
          recommendationId={item.addedFromRecommendationId} 
          isOpen={showVerdictModal} 
          onClose={() => setShowVerdictModal(false)} 
        />
      )}
    </div>
  );
}
