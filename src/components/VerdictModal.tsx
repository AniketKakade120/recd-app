'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/lib/context';
import type { Recommendation, Rating, User, Title, StampType } from '@/lib/types';
import UserAvatar from './UserAvatar';
import StampBadge from './StampBadge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { calculateRecommendationImpact } from '@/lib/logic/taste-system';

interface VerdictModalProps {
  recommendationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VerdictModal({ recommendationId, isOpen, onClose }: VerdictModalProps) {
  const { 
    currentUser, recommendations, ratings, getTitle, getUser, getGroup, openGiveVerdictModal 
  } = useApp();

  const recommendation = recommendations.find(r => r.id === recommendationId);
  const title = recommendation ? getTitle(recommendation.titleId) : null;
  const recommender = recommendation ? getUser(recommendation.recommendedBy) : null;
  const group = recommendation?.groupId ? getGroup(recommendation.groupId) : null;

  // Get all ratings for this recommendation
  const recRatings = ratings.filter(r => r.recommendationId === recommendationId);
  
  // Specific rating for current user if they are a receiver
  const myRating = recRatings.find(r => r.ratedBy === currentUser?.id);

  const isRecommender = currentUser?.id === recommendation?.recommendedBy;
  const isGroupRec = !!recommendation?.groupId;

  // Decide which view to show
  // If it's a group rec and we're looking at the overall outcome -> Group View
  // If we are the recommender -> Recommender View
  // If we are the receiver (or one of them) -> Receiver View
  
  const [view, setView] = React.useState<'receiver' | 'recommender' | 'group'>('receiver');

  React.useEffect(() => {
    if (!recommendation) return;
    if (isGroupRec) setView('group');
    else if (isRecommender) setView('recommender');
    else setView('receiver');
  }, [recommendation, isGroupRec, isRecommender]);

  if (!isOpen || !recommendation || !title) return null;

  const handleEdit = () => {
    openGiveVerdictModal(recommendation.id, true);
    onClose();
  };

  const renderReceiverView = () => {
    if (!myRating) return <div className="p-8 text-center text-muted">No verdict given yet.</div>;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <header className="text-center">
          <h2 className="text-3xl font-bold font-editorial text-bone mb-2">Your Verdict</h2>
          <p className="text-xs text-muted uppercase tracking-[0.2em]">Submitted {formatDate(myRating.createdAt)}</p>
        </header>

        {/* Title Summary */}
        <div className="flex gap-6 items-start">
          <div className={`w-24 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl shrink-0 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-bold text-bone leading-tight mb-1">{title.title}</h3>
            <p className="text-sm text-muted mb-3">{title.releaseYear} · {title.genres.slice(0, 2).join(' / ')}</p>
            {recommender && (
              <div className="flex items-center gap-2">
                <UserAvatar name={recommender.displayName} size="xs" />
                <span className="text-xs text-muted">Rec&apos;d by <span className="text-bone font-medium">{recommender.displayName}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Original Reason */}
        {recommendation.reason && (
          <div className="p-4 bg-ink/30 rounded-2xl border border-white/5 italic">
            <p className="text-sm text-bone/70 leading-relaxed">&ldquo;{recommendation.reason}&rdquo;</p>
          </div>
        )}

        {/* Verdict Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Rating</span>
            <div className="flex gap-1 text-cinema-red text-xl mb-1">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={s <= myRating.contentRating ? 'opacity-100' : 'opacity-20'}>★</span>
              ))}
            </div>
            <span className="text-xs font-bold text-bone">{myRating.contentRating}/5 Stars</span>
          </div>
          <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Accuracy</span>
            <span className="text-sm font-black text-cinema-red uppercase tracking-widest mb-1">{myRating.recommendationResult}</span>
            <span className="text-[10px] text-muted">Recommendation result</span>
          </div>
        </div>

        {/* Stamp & Comment */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">Selected Stamp</span>
             {myRating.stamp ? (
               <StampBadge stamp={myRating.stamp} size="md" variant="filled" />
             ) : (
               <span className="text-xs italic text-muted">No stamp selected.</span>
             )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted block text-center">Your Comment</span>
            {myRating.comment ? (
              <p className="text-sm text-bone/90 text-center leading-relaxed px-4 italic">&ldquo;{myRating.comment}&rdquo;</p>
            ) : (
              <p className="text-xs text-center text-muted italic">No comment added.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button onClick={handleEdit} className="w-full py-4 bg-cinema-red text-bone font-bold rounded-2xl btn-press shadow-lg shadow-cinema-red/20">
            Edit Verdict
          </button>
          <Link href={`/title/${title.id}`} onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-bone text-center font-bold rounded-2xl hover:bg-white/10 transition-colors">
            Open Title Page
          </Link>
          {group && (
            <button onClick={() => setView('group')} className="text-xs font-bold text-cinema-red hover:text-cinema-red/80 uppercase tracking-widest py-2">
              View Group Verdict
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRecommenderView = () => {
    // For a direct rec, there should be a rating from the receiver
    const receiverRating = recRatings[0]; // Simplified: first rating
    const receiver = receiverRating ? getUser(receiverRating.ratedBy) : null;
    
    // Impact calculation
    const impact = receiverRating ? calculateRecommendationImpact({
      contentRating: receiverRating.contentRating,
      recommendationResult: receiverRating.recommendationResult
    }) : null;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <header className="text-center">
          <h2 className="text-3xl font-bold font-editorial text-bone mb-2">Verdict Received</h2>
          {receiver && <p className="text-xs text-muted uppercase tracking-[0.2em]">From {receiver.displayName}</p>}
        </header>

        {/* Title Summary */}
        <div className="flex gap-6 items-start">
          <div className={`w-24 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl shrink-0 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-bold text-bone leading-tight mb-1">{title.title}</h3>
            <p className="text-sm text-muted mb-4">{title.releaseYear} · {title.genres.slice(0, 2).join(' / ')}</p>
            {receiver && (
              <div className="flex items-center gap-2">
                <UserAvatar name={receiver.displayName} size="xs" />
                <span className="text-xs text-muted">Rated by <span className="text-bone font-medium">{receiver.displayName}</span></span>
              </div>
            )}
          </div>
        </div>

        {!receiverRating ? (
          <div className="p-12 text-center bg-ink/20 rounded-3xl border border-dashed border-border">
            <p className="text-muted italic">Verdict is still pending.</p>
          </div>
        ) : (
          <>
            {/* Verdict Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Rating</span>
                <span className="text-2xl font-bold text-cinema-red font-editorial mb-1">{receiverRating.contentRating}/5</span>
                <span className="text-[10px] text-muted">Stars</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Accuracy</span>
                <span className="text-sm font-black text-cinema-red uppercase tracking-widest mb-1">{receiverRating.recommendationResult}</span>
                <span className="text-[10px] text-muted">Recommendation result</span>
              </div>
            </div>

            {/* Stamp & Comment */}
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted">Earned Stamp</span>
                 {receiverRating.stamp ? (
                   <StampBadge stamp={receiverRating.stamp} size="md" variant="filled" />
                 ) : (
                   <span className="text-xs italic text-muted">No stamp selected.</span>
                 )}
              </div>

              {receiverRating.comment && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block text-center">Their Comment</span>
                  <p className="text-sm text-bone/90 text-center leading-relaxed px-4 italic">&ldquo;{receiverRating.comment}&rdquo;</p>
                </div>
              )}

              {/* Impact Section */}
              {impact && (
                <div className="p-6 rounded-[32px] bg-cinema-red/5 border border-cinema-red/10 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cinema-red/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cinema-red mb-4 block">Taste Score Impact</span>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-black text-bone">+{Math.round(impact.impactScore / 10)}</span>
                    <span className="text-sm font-bold text-muted">pts</span>
                  </div>
                  <p className="text-[10px] text-muted uppercase tracking-widest">Your reputation is growing.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Link href={`/title/${title.id}`} onClick={onClose} className="w-full py-4 bg-cinema-red text-bone text-center font-bold rounded-2xl btn-press shadow-lg shadow-cinema-red/20">
            Open Title Page
          </Link>
          {group && (
            <button onClick={() => setView('group')} className="text-xs font-bold text-cinema-red hover:text-cinema-red/80 uppercase tracking-widest py-2">
              View Group Verdict
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderGroupView = () => {
    // Aggregates
    const totalVerdicts = recRatings.length;
    const avgRating = totalVerdicts > 0 
      ? recRatings.reduce((sum, r) => sum + r.contentRating, 0) / totalVerdicts 
      : 0;
    
    const accuracyBreakdown = {
      'Nailed it': recRatings.filter(r => r.recommendationResult === 'Nailed it').length,
      'Pretty close': recRatings.filter(r => r.recommendationResult === 'Pretty close').length,
      'Not for me': recRatings.filter(r => r.recommendationResult === 'Not for me').length,
    };

    // Find top stamp (most frequent)
    const stampCounts: Record<string, number> = {};
    recRatings.forEach(r => {
      if (r.stamp) stampCounts[r.stamp] = (stampCounts[r.stamp] || 0) + 1;
    });
    const topStamp = Object.entries(stampCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as StampType | undefined;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <header className="text-center">
          <h2 className="text-3xl font-bold font-editorial text-bone mb-2">Group Verdict</h2>
          <p className="text-xs text-muted uppercase tracking-[0.2em]">{group?.name || 'Rec&apos;d Group'}</p>
        </header>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 text-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-muted block mb-2">Avg Rating</span>
             <span className="text-xl font-bold text-cinema-red leading-none">{avgRating.toFixed(1)}</span>
             <span className="text-[10px] text-muted block mt-1">Stars</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 text-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-muted block mb-2">Verdicts</span>
             <span className="text-xl font-bold text-bone leading-none">{totalVerdicts}</span>
             <span className="text-[10px] text-muted block mt-1">Submitted</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 text-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-muted block mb-2">Pending</span>
             <span className="text-xl font-bold text-muted/50 leading-none">
               {(recommendation.recommendedToUserIds?.length || 0) - totalVerdicts}
             </span>
             <span className="text-[10px] text-muted block mt-1">Members</span>
          </div>
        </div>

        {/* Top Stamp & Breakdown */}
        <div className="p-6 rounded-3xl bg-ink/20 border border-white/5 flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">Top Group Stamp</span>
          {topStamp ? (
            <StampBadge stamp={topStamp} size="lg" variant="filled" />
          ) : (
            <span className="text-xs italic text-muted">No consensus yet.</span>
          )}

          <div className="w-full mt-8 space-y-3">
            {(Object.entries(accuracyBreakdown) as [keyof typeof accuracyBreakdown, number][]).map(([label, count]) => {
              const percentage = totalVerdicts > 0 ? (count / totalVerdicts) * 100 : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-bone/70">{label}</span>
                    <span className="text-muted">{count} member{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cinema-red transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Verdict Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">Individual Feed</h3>
          <div className="space-y-3">
            {recRatings.map(rating => {
              const rater = getUser(rating.ratedBy);
              if (!rater) return null;
              return (
                <div key={rating.id} className="p-4 rounded-[24px] bg-surface-dark border border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={rater.displayName} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-bone">{rater.displayName}</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest">{formatDate(rating.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-cinema-red font-bold text-sm">
                      {rating.contentRating}/5 ★
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-cinema-red uppercase tracking-widest">{rating.recommendationResult}</span>
                    {rating.stamp && <StampBadge stamp={rating.stamp} size="xs" />}
                  </div>
                  {rating.comment ? (
                    <p className="text-xs text-bone/70 italic leading-relaxed">&ldquo;{rating.comment}&rdquo;</p>
                  ) : (
                    <p className="text-[10px] text-muted italic">No comment added.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Link href={`/title/${title.id}`} onClick={onClose} className="w-full py-4 bg-cinema-red text-bone text-center font-bold rounded-2xl btn-press shadow-lg shadow-cinema-red/20">
            Open Title Page
          </Link>
          {!myRating && (
            <button onClick={() => { openGiveVerdictModal(recommendation.id, false); onClose(); }} className="w-full py-4 bg-white/5 border border-white/10 text-bone text-center font-bold rounded-2xl hover:bg-white/10 transition-colors">
              Add My Verdict
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-surface border-x sm:border border-border sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-ink/50 border border-white/10 text-muted hover:text-bone hover:border-white/20 transition-all"
        >
          ✕
        </button>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-12 sm:p-10 hide-scrollbar">
          {view === 'receiver' && renderReceiverView()}
          {view === 'recommender' && renderRecommenderView()}
          {view === 'group' && renderGroupView()}
        </div>

        {/* Bottom Nav if multiple views possible */}
        {(isGroupRec || isRecommender) && (
          <div className="p-4 border-t border-white/5 bg-ink/30 flex justify-center gap-8">
             <button 
               onClick={() => setView(isRecommender ? 'recommender' : 'receiver')}
               className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${view !== 'group' ? 'text-cinema-red' : 'text-muted hover:text-bone'}`}
             >
               {isRecommender ? 'Recommender' : 'My Verdict'}
             </button>
             {isGroupRec && (
               <button 
                 onClick={() => setView('group')}
                 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${view === 'group' ? 'text-cinema-red' : 'text-muted hover:text-bone'}`}
               >
                 Group Summary
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
