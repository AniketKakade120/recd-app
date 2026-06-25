'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import type { WatchlistItem, Title, User } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import UserAvatar from './UserAvatar';
import { getWatchlistItemActions } from '@/lib/logic/action-system';
import { useState } from 'react';
import AddToListModal from './AddToListModal';
import VerdictModal from './VerdictModal';
import { useRouter } from 'next/navigation';
import LogMovieFlow from './LogMovieFlow';

interface WatchlistItemCardProps {
  item: WatchlistItem;
}

export default function WatchlistItemCard({ item }: WatchlistItemCardProps) {
  const { getTitle, getUser, removeFromWatchlist, addToast, openRecommendModal, openGiveVerdictModal } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [showLogMovie, setShowLogMovie] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  const actions = getWatchlistItemActions(item);
  const title = getTitle(item.titleId);
  const recommender = item.recommendedBy ? getUser(item.recommendedBy) : null;

  const handleAction = (action: string) => {
    switch (action) {
      case 'rate':
        if (item.addedFromRecommendationId) openGiveVerdictModal(item.addedFromRecommendationId);
        break;
      case 'view_verdict':
        setShowVerdictModal(true);
        break;
      case 'edit_verdict':
        if (item.addedFromRecommendationId) openGiveVerdictModal(item.addedFromRecommendationId, true);
        break;
      case 'move_to_list':
        setShowAddToList(true);
        break;
      case 'recommend':
        openRecommendModal({ titleId: item.titleId });
        break;
      case 'view':
        router.push(`/title/${item.titleId}`);
        break;
      default:
        break;
    }
  };

  if (!title) return null;

  return (
    <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-2xl flex flex-col h-full">
      {/* Click Overlay */}
      <Link href={`/title/${title.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${title.title}`} />
      
      {/* Poster Area */}
      <div className="relative aspect-[2/3] overflow-hidden bg-surface">
        <div className={`absolute inset-0 poster-gradient-${title.posterGradient || 1} transition-transform duration-700 group-hover:scale-105`} />
        
        {title.posterUrl && !imageError && (
          <img 
            src={title.posterUrl} 
            alt={title.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}

        {/* More Menu Trigger */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-md rounded-full text-bone opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-cinema-red"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>

        {showMenu && (
          <div className="absolute top-12 right-2 w-48 bg-bone rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="py-1">
              <button 
                onClick={() => { setShowAddToList(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                 Add to List
              </button>
              {item.verdictState === 'verdict_pending' && item.addedFromRecommendationId && (
                <button 
                  onClick={() => { handleAction('rate'); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/></svg>
                  Give Verdict
                </button>
              )}
              {item.verdictState === 'verdict_given' && item.addedFromRecommendationId && (
                <button 
                  onClick={() => { handleAction('edit_verdict'); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Verdict
                </button>
              )}
              <button 
                onClick={() => { setShowLogMovie(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-ink text-xs font-bold hover:bg-ink/5 transition-colors text-left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                Log to Journal
              </button>
              <div className="h-px bg-ink/5 my-1" />
              <button 
                onClick={() => { removeFromWatchlist(item.id); addToast('Removed from Watchlist'); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-cinema-red text-xs font-bold hover:bg-cinema-red/5 transition-colors text-left"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                 Remove
              </button>
            </div>
          </div>
        )}
        
        {/* Overlay context */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              {item.verdictState === 'verdict_given' && item.stamp ? (
                <StampBadge stamp={item.stamp} size="xs" variant="filled" />
              ) : item.verdictState === 'verdict_pending' ? (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-cinema-red/30 bg-cinema-red/10 text-cinema-red backdrop-blur-md">
                  Verdict Pending
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-bone/60 backdrop-blur-md">
                  Saved
                </span>
              )}
            </div>

            {title.externalRating && title.externalRating > 0 && (
              <div className="bg-black/60 backdrop-blur-2xl px-2.5 py-1.5 rounded-xl text-[10px] font-black text-bone border border-white/10 flex items-center gap-1.5 shadow-2xl">
                <Star size={10} fill="currentColor" className="text-cinema-red" />
                <span className="tracking-tighter">{title.externalRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddToListModal isOpen={showAddToList} onClose={() => setShowAddToList(false)} titleId={title.id} />
      <LogMovieFlow isOpen={showLogMovie} onClose={() => setShowLogMovie(false)} initialTitle={title} onSuccess={() => { removeFromWatchlist(item.id); addToast('Logged & Removed from Watchlist'); }} />
      {item.addedFromRecommendationId && (
        <VerdictModal 
          recommendationId={item.addedFromRecommendationId} 
          isOpen={showVerdictModal} 
          onClose={() => setShowVerdictModal(false)} 
        />
      )}

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-base font-bold text-bone leading-tight group-hover:text-cinema-red transition-colors line-clamp-1">
            {title.title}
          </h3>
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1">
            {title.releaseYear} • {title.format}
          </p>
        </div>

        {recommender && (
          <div className="mt-auto pt-3 flex items-center gap-2 mb-4 border-t border-white/5">
            <UserAvatar name={recommender.displayName} size="xs" />
            <p className="text-[10px] text-bone/70">
              Rec'd by <span className="font-bold text-bone">{recommender.displayName}</span>
            </p>
          </div>
        )}

        {!recommender && (
          <div className="mt-auto pt-3 mb-4">
             {/* Spacing for manual saves */}
          </div>
        )}

        {/* Action Row */}
        <div className="grid grid-cols-2 gap-2 mt-auto relative z-10">
          {actions.primary && (
            <button 
              onClick={() => handleAction(actions.primary!.action)}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all btn-press ${
                actions.primary.variant === 'primary' 
                  ? 'bg-cinema-red text-bone shadow-lg shadow-cinema-red/10' 
                  : 'bg-white/5 text-bone border border-white/10'
              }`}
            >
              {actions.primary.label}
            </button>
          )}
          {actions.secondary && (
            <button 
              onClick={() => handleAction(actions.secondary!.action)}
              className="py-2 bg-white/5 border border-white/10 text-bone/70 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all btn-press"
            >
              {actions.secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
