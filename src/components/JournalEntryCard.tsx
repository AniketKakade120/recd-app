'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Share2, MoreHorizontal } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import { useApp } from '@/lib/context';
import LogMovieFlow from './LogMovieFlow';
import ShareVerdictCardModal from './ShareVerdictCardModal';
import ModalBase from '@/components/ModalBase';

interface JournalEntryCardProps {
  entry: JournalEntry;
  isReadOnly?: boolean;
}

export default function JournalEntryCard({ entry, isReadOnly }: JournalEntryCardProps) {
  const { openRecommendModal, deleteJournalEntry, addToast } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteJournalEntry(entry.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    if (res.success) {
       addToast('Journal entry deleted', { type: 'success' });
    } else {
       addToast('Failed to delete', { type: 'error' });
    }
  };

  return (
    <>
      <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-2xl flex flex-col h-full">
        {/* Click Overlay */}
        <Link href={`/title/${entry.tmdbId}`} className="absolute inset-0 z-0" aria-label={`View details for ${entry.title}`} />
        
        {/* Header Image Area (Poster Oriented) */}
        <div className="relative aspect-[2/3] overflow-hidden bg-ink w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-black/40 z-10" />
          
          {(entry.posterPath || entry.backdropPath) && !imageError ? (
            <img 
              src={entry.posterPath || entry.backdropPath} 
              alt={entry.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 poster-gradient-1 opacity-50" />
          )}

          {/* Top Actions: 3-dot Menu (Only if not read only) */}
          {!isReadOnly && (
            <div className="absolute top-3 right-3 z-50">
              <div className="relative" onClick={(e) => e.preventDefault()}>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                   className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
                 >
                   <MoreHorizontal size={16} />
                 </button>
                 {showMenu && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                     <div className="absolute top-full right-0 mt-2 w-36 bg-[#1A1A1A] border border-border rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                        <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-bone hover:bg-white/5 transition-colors relative z-50" onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowEdit(true); }}>Edit Log</button>
                        <div className="h-px bg-white/10 w-full my-1 relative z-50"></div>
                        <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-cinema-red hover:bg-cinema-red/10 transition-colors relative z-50" onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowDeleteConfirm(true); }}>Delete</button>
                     </div>
                   </>
                 )}
              </div>
            </div>
          )}

          {/* Title & Rating (Bottom of image) */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div className="pr-2">
              <h3 className="text-xl font-bold text-bone leading-tight font-editorial shadow-black drop-shadow-md line-clamp-2">
                {entry.title}
              </h3>
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1 shadow-black drop-shadow-md">
                {entry.releaseYear} • {entry.mediaType === 'movie' ? 'Movie' : 'TV'}
              </p>
            </div>
            
            {entry.rating && (
              <div className="bg-black/60 backdrop-blur-2xl px-3 py-1.5 rounded-xl text-sm font-black text-bone border border-white/10 flex items-center gap-1.5 shadow-2xl shrink-0">
                <Star size={14} fill="currentColor" className="text-cinema-red" />
                <span className="tracking-tighter">{entry.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area (Stamp, Verdict & CTAs) */}
        <div className="p-5 flex-1 flex flex-col z-10 bg-surface border-t border-border/50">
          {entry.stamp && (
            <div className="mb-3">
              <StampBadge stamp={entry.stamp as any} size="sm" variant="filled" />
            </div>
          )}
          
          {entry.shortVerdict && (
            <p className="text-sm text-bone/90 italic border-l-2 border-cinema-red/50 pl-3 py-1 line-clamp-4">
              "{entry.shortVerdict}"
            </p>
          )}

          <div className="mt-auto pt-5 flex flex-col gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare(true); }}
              className="w-full py-2.5 rounded-xl bg-cinema-red text-bone font-bold text-sm hover:bg-cinema-red/90 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Share Verdict
            </button>
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                openRecommendModal({ 
                  titleId: entry.tmdbId.toString(),
                  initialTitle: {
                    id: entry.tmdbId.toString(),
                    tmdbId: entry.tmdbId,
                    title: entry.title,
                    type: entry.mediaType === 'movie' ? 'movie' : 'series',
                    posterUrl: entry.posterPath,
                    backdropUrl: entry.backdropPath,
                    releaseYear: entry.releaseYear || new Date().getFullYear(),
                    genres: entry.genres,
                    overview: '',
                    externalRating: 0,
                    posterGradient: 1,
                    cast: [],
                    directorOrCreatorProfile: { id: '', name: '', role: 'Director' }
                  }
                }); 
              }}
              className="w-full py-2.5 rounded-xl bg-ink border border-border text-bone font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Recommend
            </button>
          </div>
        </div>
      </div>

      <LogMovieFlow 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        initialTitle={{
          id: entry.tmdbId.toString(),
          tmdbId: entry.tmdbId,
          title: entry.title,
          type: entry.mediaType === 'movie' ? 'movie' : 'series',
          posterUrl: entry.posterPath,
          backdropUrl: entry.backdropPath,
          releaseYear: entry.releaseYear || new Date().getFullYear(),
          genres: entry.genres,
          overview: '',
          externalRating: 0,
          posterGradient: 1,
          cast: [],
          directorOrCreatorProfile: { id: '', name: '', role: 'Director' }
        }} 
        existingEntry={entry}
      />

      <ShareVerdictCardModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        entry={entry} 
      />

      <ModalBase isOpen={showDeleteConfirm} onClose={() => !isDeleting && setShowDeleteConfirm(false)} title="Delete Journal Entry" subtitle={entry.title} noPadding>
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-cinema-red/10 border border-cinema-red/30 flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Delete this entry?</h2>
          <p className="text-muted mb-8">This will remove it from your Taste Profile and it cannot be undone.</p>
          <div className="flex w-full gap-4">
            <button 
              onClick={() => setShowDeleteConfirm(false)} 
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-ink border border-border text-bone rounded-xl font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-cinema-red text-bone rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cinema-red/90 transition-colors shadow-[0_0_15px_rgba(234,51,51,0.4)]"
            >
              {isDeleting ? <div className="w-4 h-4 rounded-full border-2 border-bone/30 border-t-bone animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
      </ModalBase>
    </>
  );
}
