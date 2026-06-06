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
  const watchedCount = list.watchedTitleIds?.length || 0;
  const totalCount = list.titleIds.length;

  return (
    <Link href={`/watchlist/${list.id}`} className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-2xl flex flex-col h-full">
      {/* Poster Area */}
      <div className="relative aspect-[2/3] overflow-hidden bg-surface">
        
        {/* Cover Styles */}
        {(list.coverStyle === 'collage' || list.coverStyle === 'gradient') && posters.length > 0 ? (
          <div className={`grid h-full gap-px bg-border group-hover:scale-105 transition-transform duration-700 ${
            posters.length === 1 ? 'grid-cols-1' :
            posters.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 grid-rows-2'
          }`}>
            {posters.slice(0, 4).map((url, i) => (
              <img 
                key={i} 
                src={url} 
                className={`w-full h-full object-cover ${posters.length === 3 && i === 0 ? 'col-span-2' : ''}`} 
                alt="list cover" 
              />
            ))}
          </div>
        ) : list.coverStyle === 'poster_stack' && posters.length > 0 ? (
          <div className="relative h-full bg-surface group-hover:scale-105 transition-transform duration-700">
             <img src={posters[0]} className="absolute inset-0 w-full h-full object-cover" alt="list cover" />
             <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-cinema-red/20 to-surface flex items-center justify-center group-hover:scale-105 transition-transform duration-700`}>
             <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-cinema-red/30 bg-cinema-red/10 text-cinema-red backdrop-blur-md inline-block">
             {list.privacy}
           </span>
        </div>
        
        <div className="absolute top-3 right-3">
          {watchedCount > 0 && watchedCount === totalCount && totalCount > 0 ? (
            <span className="bg-cinema-red text-bone text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-xl shadow-cinema-red/20">
              Completed
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md text-bone/80 border border-white/10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-xl">
              Watched {watchedCount}/{totalCount}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end">
           {/* Space for future overlay content if needed */}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-base font-bold text-bone leading-tight group-hover:text-cinema-red transition-colors line-clamp-1 font-editorial">
            {list.name}
          </h3>
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1">
            Created {new Date(list.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {list.description && (
          <p className="text-xs text-bone/60 mt-2 line-clamp-2 leading-relaxed">
            {list.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 relative z-10">
           <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-bone transition-colors flex items-center gap-2">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
             {totalCount} Titles
           </span>
        </div>
      </div>
    </Link>
  );
}
