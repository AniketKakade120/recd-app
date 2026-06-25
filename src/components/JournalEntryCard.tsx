'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import { useApp } from '@/lib/context';
import LogMovieFlow from './LogMovieFlow';
import ShareVerdictCardModal from './ShareVerdictCardModal';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const { openRecommendModal } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-2xl flex flex-col h-full">
        {/* Click Overlay */}
        <Link href={`/title/${entry.tmdbId}`} className="absolute inset-0 z-0" aria-label={`View details for ${entry.title}`} />
        
        {/* Header Image Area */}
        <div className="relative aspect-[16/9] overflow-hidden bg-ink">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10" />
          
          {(entry.backdropPath || entry.posterPath) && !imageError ? (
            <img 
              src={entry.backdropPath || entry.posterPath} 
              alt={entry.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 poster-gradient-1 opacity-50" />
          )}

          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-bone leading-tight font-editorial shadow-black drop-shadow-md">
                {entry.title}
              </h3>
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1 shadow-black drop-shadow-md">
                {entry.releaseYear} • {new Date(entry.watchedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            {entry.rating && (
              <div className="bg-black/60 backdrop-blur-2xl px-3 py-1.5 rounded-xl text-sm font-black text-bone border border-white/10 flex items-center gap-1.5 shadow-2xl">
                <Star size={14} fill="currentColor" className="text-cinema-red" />
                <span className="tracking-tighter">{entry.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col z-10">
          {entry.stamp && (
            <div className="mb-4">
              <StampBadge stamp={entry.stamp as any} size="sm" variant="filled" />
            </div>
          )}
          
          {entry.shortVerdict && (
            <p className="text-sm text-bone/90 italic border-l-2 border-cinema-red/50 pl-3 py-1 mb-6 line-clamp-4">
              "{entry.shortVerdict}"
            </p>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 mt-auto pt-2">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare(true); }}
              className="py-2.5 bg-cinema-red/10 text-cinema-red border border-cinema-red/20 hover:bg-cinema-red hover:text-bone text-[10px] font-black uppercase tracking-widest rounded-xl transition-all btn-press flex items-center justify-center gap-1.5"
            >
              Share
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRecommendModal({ titleId: entry.tmdbId.toString() }); }}
              className="py-2.5 bg-white/5 border border-white/10 text-bone hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all btn-press flex items-center justify-center gap-1.5"
            >
              Recommend
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEdit(true); }}
              className="py-2.5 bg-white/5 border border-white/10 text-bone/70 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all btn-press flex items-center justify-center gap-1.5"
            >
              Edit
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
      />

      <ShareVerdictCardModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        entry={entry} 
      />
    </>
  );
}
