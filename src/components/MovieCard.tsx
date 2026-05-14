'use client';

import Link from 'next/link';
import type { Title, StampType } from '@/lib/types';
import StampBadge from './StampBadge';

import { useState } from 'react';
import AddToListModal from './AddToListModal';

interface MovieCardProps {
  title: Title;
  stamp?: StampType;
  recommendedBy?: string;
  showRecommendAction?: boolean;
  compact?: boolean;
}

export default function MovieCard({ title, stamp, recommendedBy, showRecommendAction }: MovieCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);

  return (
    <>
    <Link href={`/title/${title.id}`} className="block group card-hover relative">
      <div className={`aspect-[2/3] w-full rounded-xl overflow-hidden relative border border-border/50 group-hover:border-border-strong transition-colors ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
        {title.posterUrl ? (
          <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-2/3 poster-overlay-strong" />

        {stamp && (
          <div className="absolute top-3 left-3">
            <StampBadge stamp={stamp} size="xs" />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          {recommendedBy && (
            <p className="text-xs font-medium text-cinema-red/90 mb-1 drop-shadow-md truncate">Rec&apos;d by {recommendedBy}</p>
          )}
          {!recommendedBy && title.releaseYear && (
             <p className="text-xs font-medium text-bone/80 mb-1 drop-shadow-md truncate">{title.releaseYear} · {title.genres[0]}</p>
          )}
          <p className="text-lg font-bold text-bone drop-shadow-lg leading-tight line-clamp-2">
            {title.title}
          </p>
        </div>

        {showRecommendAction && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-cinema-red text-bone text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
              Rec
            </span>
          </div>
        )}

        {/* More Menu Trigger */}
        <button 
          onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
          className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-bone opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-cinema-red"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>

        {showMenu && (
          <div className="absolute top-10 right-2 w-40 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={(e) => { e.preventDefault(); setShowAddToList(true); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-bone text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors text-left"
            >
               Add to List
            </button>
          </div>
        )}
      </div>
    </Link>
    <AddToListModal isOpen={showAddToList} onClose={() => setShowAddToList(false)} titleId={title.id} />
    </>
  );
}
