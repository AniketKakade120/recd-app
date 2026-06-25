'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Share2, MoreHorizontal } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import { useApp } from '@/lib/context';
import LogMovieFlow from './LogMovieFlow';
import ShareVerdictCardModal from './ShareVerdictCardModal';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const { openRecommendModal, deleteJournalEntry, addToast } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const res = await deleteJournalEntry(entry.id);
      if (res.success) {
         addToast('Journal entry deleted', { type: 'success' });
      } else {
         addToast('Failed to delete', { type: 'error' });
      }
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

          {/* Top Actions: Share & 3-dot Menu */}
          <div className="absolute top-3 left-3 right-3 z-50 flex justify-between items-start">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare(true); }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-cinema-red transition-colors shadow-lg"
            >
              <Share2 size={14} />
            </button>
            
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
                      <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-bone hover:bg-white/5 transition-colors relative z-50" onClick={(e) => { e.stopPropagation(); setShowMenu(false); openRecommendModal({ titleId: entry.tmdbId.toString() }); }}>Recommend</button>
                      <div className="h-px bg-white/10 w-full my-1 relative z-50"></div>
                      <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-cinema-red hover:bg-cinema-red/10 transition-colors relative z-50" onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(); }}>Delete</button>
                   </div>
                 </>
               )}
            </div>
          </div>

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

        {/* Content Area (Stamp & Verdict) */}
        {(entry.stamp || entry.shortVerdict) && (
          <div className="p-5 flex-1 flex flex-col z-10 bg-surface">
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
          </div>
        )}
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
    </>
  );
}
