'use client';

import Link from 'next/link';
import type { Recommendation } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import UserAvatar from './UserAvatar';

interface RecommendationCardProps {
  recommendation: Recommendation;
  compact?: boolean;
  collapsed?: boolean;
  groupContext?: string; // groupId — when set, links to /groups/[id]/titles/[titleId]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending', color: 'text-muted' },
  accepted:   { label: 'Accepted', color: 'text-bone/70' },
  maybe_later:{ label: 'Maybe later', color: 'text-muted' },
  not_my_vibe:{ label: 'Not my vibe', color: 'text-muted' },
  watching:   { label: 'Watching', color: 'text-cinema-red' },
  watched:    { label: 'Watched', color: 'text-bone/70' },
  rated:      { label: 'Rated', color: 'text-cinema-red' },
};

export default function RecommendationCard({ recommendation: rec, compact = false, collapsed = false, groupContext }: RecommendationCardProps) {
  const { getTitle, getUser } = useApp();
  const title = getTitle(rec.titleId);
  const recommender = getUser(rec.recommendedBy);
  const status = STATUS_LABELS[rec.status] || { label: rec.status, color: 'text-muted' };

  const linkHref = groupContext
    ? `/groups/${groupContext}/titles/${rec.titleId}`
    : `/title/${rec.titleId}?recId=${rec.id}`;

  if (!title) return null;

  if (collapsed) {
    return (
      <Link href={linkHref} className="block">
        <div className="rounded-xl bg-surface border border-border p-3 card-hover flex items-center gap-4 group">
          <div className={`w-10 h-14 shrink-0 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'} rounded-md overflow-hidden relative shadow-sm`}>
             {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-bone truncate">{title.title}</h3>
            <p className="text-xs text-muted truncate">Rec&apos;d by {recommender?.displayName}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-cinema-red/20 bg-cinema-red/10 ${status.color}`}>
              {status.label}
            </span>
            <span className="text-muted group-hover:text-bone text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={linkHref} className="block">
      <div className="rounded-xl bg-surface border border-border p-4 card-hover flex gap-3 group">
        <div className={`w-[100px] sm:w-[120px] shrink-0 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'} relative aspect-[2/3] rounded-lg overflow-hidden`}>
          {title.posterUrl && (
            <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-bone truncate">{title.title}</h3>
            {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="xs" />}
          </div>

          <p className="text-xs text-muted mb-1.5 truncate">
            {title.releaseYear} · {title.genres.slice(0, 2).join(', ')}
            {title.runtime && ` · ${title.runtime}`}
          </p>

          {recommender && (
            <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
              <UserAvatar name={recommender.displayName} size="xs" />
              <span className="text-xs text-muted truncate">
                <span className="text-bone/60">{recommender.displayName}</span> recommended
              </span>
            </div>
          )}

          {!compact && rec.reason && (
            <p className="text-sm text-muted/80 italic line-clamp-1 mb-2">&ldquo;{rec.reason}&rdquo;</p>
          )}

          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold uppercase tracking-wider ${status.color}`}>{status.label}</span>
            {rec.tasteMatchScore && (
              <span className="text-sm text-muted">{rec.tasteMatchScore}% match</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
