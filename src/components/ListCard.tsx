'use client';

import Link from 'next/link';
import type { WatchlistList } from '@/lib/types';
import { useApp } from '@/lib/context';

interface ListCardProps {
  list: WatchlistList;
}

export default function ListCard({ list }: ListCardProps) {
  const { getTitle } = useApp();
  
  // Get posters for collage or stack
  const posters = list.titleIds.slice(0, 4).map(id => getTitle(id)?.posterUrl).filter(Boolean);

  return (
    <Link href={`/watchlist/${list.id}`} className="group block">
      <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 border border-border transition-all duration-500 group-hover:border-cinema-red/50 group-hover:shadow-2xl group-hover:shadow-cinema-red/10">
        
        {/* Cover Styles */}
        {list.coverStyle === 'collage' && posters.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-border">
            {posters.slice(0, 4).map((url, i) => (
              <img key={i} src={url} className="w-full h-full object-cover" alt="list cover" />
            ))}
          </div>
        ) : list.coverStyle === 'poster_stack' && posters.length > 0 ? (
          <div className="relative h-full bg-surface">
             <img src={posters[0]} className="absolute inset-0 w-full h-full object-cover" alt="list cover" />
             <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-cinema-red/20 to-surface flex items-center justify-center`}>
             <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[9px] font-black uppercase tracking-widest text-cinema-red px-2 py-0.5 rounded-full bg-cinema-red/10 border border-cinema-red/20">
               {list.privacy}
             </span>
             <span className="text-[9px] font-black uppercase tracking-widest text-bone/60 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
               {list.titleIds.length} titles
             </span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-bone group-hover:text-cinema-red transition-colors font-editorial">
        {list.name}
      </h3>
      {list.description && (
        <p className="text-xs text-muted mt-1 line-clamp-1">{list.description}</p>
      )}
    </Link>
  );
}
