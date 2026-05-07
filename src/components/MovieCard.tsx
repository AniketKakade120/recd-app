'use client';

import Link from 'next/link';
import type { Title, StampType } from '@/lib/types';
import StampBadge from './StampBadge';

interface MovieCardProps {
  title: Title;
  stamp?: StampType;
  recommendedBy?: string;
  showRecommendAction?: boolean;
  compact?: boolean;
}

export default function MovieCard({ title, stamp, recommendedBy, showRecommendAction }: MovieCardProps) {
  return (
    <Link href={`/title/${title.id}`} className="block group card-hover">
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
      </div>
    </Link>
  );
}
