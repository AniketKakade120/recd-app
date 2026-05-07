'use client';

import type { Recommendation } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import AvatarStack from './AvatarStack';
import Link from 'next/link';

interface HeroRecommendationCardProps {
  recommendation: Recommendation;
}

export default function HeroRecommendationCard({ recommendation: rec }: HeroRecommendationCardProps) {
  const { getTitle, getUser, getGroupMembers } = useApp();
  const title = getTitle(rec.titleId);
  const recommender = getUser(rec.recommendedBy);
  const groupMembers = rec.groupId ? getGroupMembers(rec.groupId).map(m => m.displayName) : [];

  if (!title) return null;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border group-hover:border-border-strong transition-colors min-h-[400px] flex flex-col justify-end ${!title.backdropUrl ? `poster-gradient-${title.posterGradient}` : 'bg-ink'}`}>
      
      {/* Backdrop Image */}
      {title.backdropUrl ? (
        <img src={title.backdropUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
      ) : (
        <div className="absolute inset-0 opacity-80" />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold uppercase tracking-widest text-cinema-red/80 bg-cinema-red/10 border border-cinema-red/20 px-2 py-0.5 rounded">
            Top Pick For You
          </span>
          {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="sm" variant="filled" />}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-bone font-editorial mb-2 leading-tight">
          {title.title}
        </h2>

        <p className="text-sm text-muted mb-4">
          {title.releaseYear} · {title.format} · {title.genres.slice(0, 2).join(', ')}
          {title.runtime && ` · ${title.runtime}`}
        </p>

        {rec.reason && (
          <p className="text-sm text-bone/70 italic mb-5 max-w-md line-clamp-2">&ldquo;{rec.reason}&rdquo;</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {groupMembers.length > 0 && (
              <AvatarStack names={groupMembers} size="sm" max={3} />
            )}
            {recommender && (
              <span className="text-xs text-muted">
                Rec&apos;d by <span className="text-bone font-medium">{recommender.displayName}</span>
              </span>
            )}
            {rec.tasteMatchScore && (
              <span className="text-xs font-semibold text-cinema-red">{rec.tasteMatchScore}% match</span>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/title/${rec.titleId}?recId=${rec.id}`}
              className="px-4 py-2 bg-cinema-red text-bone rounded-lg text-xs font-semibold hover:bg-cinema-red/90 btn-press transition-colors">
              Why it&apos;s a Good Call
            </Link>
            <button className="px-4 py-2 bg-surface/80 border border-border text-bone rounded-lg text-xs font-medium hover:bg-surface-hover btn-press transition-colors backdrop-blur-sm">
              + Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
