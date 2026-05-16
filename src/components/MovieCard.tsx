'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MoreVertical, ListPlus, Send, Star } from 'lucide-react';
import type { Title, StampType } from '@/lib/types';
import StampBadge from './StampBadge';
import { useState, useEffect } from 'react';
import AddToListModal from './AddToListModal';
import { useApp } from '@/lib/context';

interface MovieCardProps {
  title: Title;
  stamp?: StampType;
  recommendedBy?: string;
  showRecommendAction?: boolean;
}

export default function MovieCard({ title, stamp, recommendedBy, showRecommendAction }: MovieCardProps) {
  const { openRecommendModal, getUser } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [title.posterUrl]);

  const recommender = recommendedBy ? getUser(recommendedBy) : null;

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="group relative"
      >
        <Link href={`/title/${title.id}`} className="block relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-border/40 group-hover:border-cinema-red/30 transition-colors shadow-lg">
          {/* Poster Image or Gradient Fallback */}
          <div className={`absolute inset-0 poster-gradient-${title.posterGradient || '1'} transition-transform duration-700 group-hover:scale-110`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Star size={48} strokeWidth={1} />
            </div>
          </div>

          {title.posterUrl && (
            <img 
              src={title.posterUrl} 
              alt={title.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageError ? 'opacity-0' : 'opacity-100'}`} 
              loading="lazy" 
              onError={() => setImageError(true)}
              style={imageError ? { display: 'none' } : {}}
            />
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2.5 z-10">
            {stamp && <StampBadge stamp={stamp} size="xs" />}
            {title.externalRating && title.externalRating > 0 && (
              <div className="bg-black/60 backdrop-blur-2xl px-2.5 py-1.5 rounded-xl text-[10px] font-black text-bone border border-white/10 flex items-center gap-2 w-fit shadow-2xl">
                <Star size={11} fill="currentColor" className="text-cinema-red" />
                <span className="tracking-tighter">{title.externalRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-5 left-5 right-5 z-10">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-red drop-shadow-md">
                {title.type === 'movie' ? 'Movie' : 'Series'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold text-bone/50 uppercase tracking-[0.2em] drop-shadow-md">
                {title.releaseYear}
              </span>
            </div>
            <h3 className="text-xl font-bold text-bone leading-tight line-clamp-2 drop-shadow-2xl group-hover:text-cinema-red transition-all duration-300 font-editorial tracking-tight">
              {title.title}
            </h3>
          </div>

          {/* Hover Action: Recommend */}
          {showRecommendAction && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openRecommendModal({ titleId: title.id });
                }}
                className="bg-cinema-red text-bone px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
              >
                <Send size={14} />
                Rec it
              </button>
            </div>
          )}
        </Link>

        {/* Floating Menu Button */}
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            setShowMenu(!showMenu); 
          }}
          className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-bone opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-cinema-red border border-white/5"
        >
          <MoreVertical size={14} />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-12 right-3 w-44 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-30"
          >
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                setShowAddToList(true); 
                setShowMenu(false); 
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-bone text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors text-left"
            >
               <ListPlus size={14} className="text-cinema-red" />
               Add to Watchlist
            </button>
          </motion.div>
        )}

        {/* Footer Credit (Optional) */}
        {recommender && (
          <div className="mt-2 flex items-center gap-2 px-1">
             <div className="w-4 h-4 rounded-full bg-cinema-red/20 border border-cinema-red/30 flex items-center justify-center text-[8px] text-cinema-red font-bold">
               {recommender.displayName[0]}
             </div>
             <p className="text-[10px] font-medium text-muted truncate">
               Rec&apos;d by <span className="text-bone">{recommender.displayName}</span>
             </p>
          </div>
        )}
      </motion.div>

      <AddToListModal isOpen={showAddToList} onClose={() => setShowAddToList(false)} titleId={title.id} />
    </>
  );
}
