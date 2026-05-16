'use client';

import Link from 'next/link';
import type { Recommendation } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import ClickableUserAvatar from './ClickableUserAvatar';
import AddToListModal from './AddToListModal';
import { useState } from 'react';
import VerdictModal from './VerdictModal';

interface RecommendationCardProps {
  recommendation: Recommendation;
  compact?: boolean;
  collapsed?: boolean;
  groupContext?: string; // groupId — when set, links to /groups/[id]/titles/[titleId]
}

const VERDICT_LABELS: Record<string, { label: string; color: string }> = {
  verdict_pending: { label: 'Verdict pending', color: 'text-muted' },
  verdict_given:   { label: 'Verdict given', color: 'text-cinema-red' },
  dismissed:       { label: 'Dismissed', color: 'text-muted' },
};

export default function RecommendationCard({ recommendation: rec, compact = false, collapsed = false, groupContext }: RecommendationCardProps) {
  const { getTitle, getUser, getViewerContext, getActions, updateVerdictState, addToWatchlist, openGiveVerdictModal } = useApp();
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const title = getTitle(rec.titleId);
  const recommender = getUser(rec.recommendedBy);
  
  const viewerContext = getViewerContext(rec);
  const actions = getActions(rec);
  
  const verdictLabel = VERDICT_LABELS[viewerContext.verdictState] || { label: 'Verdict pending', color: 'text-muted' };

  const linkHref = groupContext
    ? `/groups/${groupContext}/titles/${rec.titleId}`
    : `/title/${rec.titleId}?recId=${rec.id}`;

  if (!title) return null;

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    switch (action) {
      case 'save':
        setAddToListOpen(true);
        break;
      case 'rate':
        openGiveVerdictModal(rec.id);
        break;
      case 'view_verdict':
        setVerdictModalOpen(true);
        break;
      case 'edit_verdict':
        openGiveVerdictModal(rec.id, true);
        break;
      case 'nudge':
        // Mock nudge
        break;
      default:
        window.location.href = linkHref;
    }
  };

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
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/5 bg-white/5 ${verdictLabel.color}`}>
              {verdictLabel.label}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border p-4 card-hover flex gap-4 group relative overflow-hidden">
      <Link href={linkHref} className="shrink-0 relative z-10">
        <div className={`w-[100px] sm:w-[120px] aspect-[2/3] rounded-lg overflow-hidden bg-surface relative`}>
          <div className={`absolute inset-0 poster-gradient-${title.posterGradient || '1'} opacity-60`} />
          {title.posterUrl && !imageError && (
            <img 
              src={title.posterUrl} 
              alt={title.title} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
              loading="lazy" 
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1 relative z-10">
          <Link href={linkHref} className="min-w-0">
            <h3 className="font-semibold text-sm text-bone truncate hover:text-cinema-red transition-colors">{title.title}</h3>
          </Link>
          {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="xs" />}
        </div>

        <p className="text-[11px] text-muted mb-2 truncate">
          {title.releaseYear} · {title.genres.slice(0, 2).join(', ')}
          {title.runtime && ` · ${title.runtime}`}
        </p>

        {recommender && (
          <div className="flex items-center gap-1.5 mb-2 min-w-0 relative z-10">
            <ClickableUserAvatar 
              userId={recommender.id} 
              username={recommender.username} 
              name={recommender.displayName} 
              size="xs" 
            />
            <span className="text-[11px] text-muted truncate">
              <Link href={`/profile/${recommender.username}`} className="text-bone/60 hover:text-cinema-red transition-colors" onClick={e => e.stopPropagation()}>{recommender.displayName}</Link> recommended
            </span>
          </div>
        )}

        {!compact && rec.reason && (
          <p className="text-xs text-muted/80 italic line-clamp-2 mb-3 leading-relaxed">&ldquo;{rec.reason}&rdquo;</p>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded border border-white/5 bg-white/5 ${verdictLabel.color}`}>
              {verdictLabel.label}
            </span>
            {rec.tasteMatchScore && !viewerContext.hasRated && (
              <span className="text-[10px] font-black text-cinema-red uppercase tracking-widest">{rec.tasteMatchScore}% taste match</span>
            )}
          </div>

          {/* Unified Action System */}
          <div className="flex flex-wrap items-center gap-2">
            {[actions.primary, actions.secondary, actions.tertiary]
              .filter(action => action && !['View Details', 'View Outcome'].includes(action.label))
              .map((action, i) => (
                <button 
                  key={i}
                  onClick={(e) => handleAction(e, action!.action)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all btn-press ${
                    i === 0 && action === actions.primary
                      ? 'bg-cinema-red text-bone hover:bg-cinema-red/90 shadow-lg shadow-cinema-red/10'
                      : action === actions.tertiary
                        ? 'text-muted hover:text-bone tracking-widest'
                        : 'bg-white/5 border border-white/10 text-bone/70 hover:bg-white/10'
                  }`}
                >
                  {action!.label}
                </button>
              ))
            }
          </div>
        </div>
      </div>

      {/* Hidden Click Overlay for the whole card */}
      <Link href={linkHref} className="absolute inset-0 z-0" aria-label={`View details for ${title.title}`} />
      
      <AddToListModal isOpen={addToListOpen} onClose={() => setAddToListOpen(false)} titleId={rec.titleId} />
      <VerdictModal recommendationId={rec.id} isOpen={verdictModalOpen} onClose={() => setVerdictModalOpen(false)} />
    </div>
  );
}
