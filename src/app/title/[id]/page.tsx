'use client';

import { use, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { REC_ACCURACY_OPTIONS, type RecAccuracy, CORE_STAMPS, type StampType } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import RecommendModal from '@/components/RecommendModal';

export default function TitleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const recId = searchParams.get('recId');
  const router = useRouter();
  
  const { 
    getTitle, getUser, recommendations, watchlist, currentUser, addRating,
    addToWatchlist, removeFromWatchlist, updateRecommendationStatus 
  } = useApp();

  const title = getTitle(id);
  const recommendation = recId ? recommendations.find(r => r.id === recId) : null;
  const recommender = recommendation ? getUser(recommendation.recommendedBy) : null;
  const watchlistItem = watchlist.find(w => w.titleId === id);
  const isSaved = !!watchlistItem;

  // Modal Rating State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingStep, setRatingStep] = useState(1);
  const [contentRating, setContentRating] = useState(0);
  const [recAccuracy, setRecAccuracy] = useState<RecAccuracy | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);

  if (!title) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Title not found.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface text-bone rounded-lg">Go back</button>
      </div>
    );
  }

  const toggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(watchlistItem.id);
    } else {
      addToWatchlist({
        id: `wl-${Date.now()}`,
        userId: currentUser?.id || 'anon',
        titleId: title.id,
        status: 'saved',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const submitRating = () => {
    if (!currentUser || !recAccuracy || contentRating === 0 || !recommendation) return;
    setSubmitting(true);
    setTimeout(() => {
      addRating({
        id: `rating-${Date.now()}`, 
        recommendationId: recommendation.id, 
        ratedBy: currentUser.id,
        contentRating, 
        recommendationResult: recAccuracy, 
        stamp: selectedStamp || undefined,
        comment: comment.trim() || undefined, 
        createdAt: new Date().toISOString(),
      });
      updateRecommendationStatus(recommendation.id, 'rated');
      setRatingModalOpen(false);
      setSubmitting(false);
    }, 900);
  };

  const extRatings = title.externalRatings || { imdb: title.externalRating, tmdb: title.externalRating ? title.externalRating - 0.4 : undefined };
  const mockSynopsis = title.overview || "A remote harbor town becomes the center of a quiet mystery after a stranger arrives with a secret that changes everyone around him.";
  const mockCast = title.cast || ['Colin Farrell', 'Brendan Gleeson', 'Kerry Condon', 'Barry Keoghan'];

  return (
    <div className="max-w-[1440px] mx-auto pb-24 lg:pb-12">
      
      {/* SECTION 1: CINEMATIC HERO */}
      <div className="relative w-full h-[60vh] min-h-[400px] lg:h-[70vh] flex items-end">
        <div className="absolute inset-0 bg-ink z-0">
          {title.backdropUrl ? (
            <img src={title.backdropUrl} alt={title.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className={`w-full h-full poster-gradient-${title.posterGradient} opacity-30`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
          <div className="shrink-0 w-32 md:w-48 lg:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-bone/10 relative">
             {title.posterUrl ? (
               <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />
             ) : (
               <div className={`w-full h-full poster-gradient-${title.posterGradient}`} />
             )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            {recommendation?.primaryStamp && (
               <div className="mb-4">
                 <StampBadge stamp={recommendation.primaryStamp} size="md" />
               </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-editorial text-bone leading-tight tracking-tight mb-3">
              {title.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-bone/70 mb-6 font-medium">
              <span>{title.releaseYear || '2024'}</span>
              <span>·</span>
              <span>{title.format || (title.type === 'movie' ? 'Movie' : 'Series')}</span>
              <span>·</span>
              <span>{title.genres.slice(0, 3).join(' / ')}</span>
              {title.runtime && (
                <>
                  <span>·</span>
                  <span>{title.runtime}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Primary CTA: Recommend this */}
              <button
                onClick={() => setRecommendModalOpen(true)}
                className="px-8 py-3 bg-cinema-red text-bone rounded-xl font-bold btn-press hover:bg-cinema-red/90 transition-colors flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Recommend this
              </button>

              {/* Secondary CTA: Rate or Watchlist */}
              {recommendation && recommendation.status !== 'rated' ? (
                <button 
                  onClick={() => {
                     setRatingStep(1);
                     setRatingModalOpen(true);
                  }}
                  className="px-6 py-3 bg-surface border border-border text-bone rounded-xl font-bold btn-press hover:bg-surface-hover transition-colors"
                >
                  Rate Rec
                </button>
              ) : (
                <button 
                  onClick={toggleWatchlist}
                  className={`px-6 py-3 rounded-xl font-bold btn-press border transition-colors ${
                    isSaved ? 'bg-surface border-border text-bone' : 'bg-bone text-ink border-bone hover:bg-bone/90'
                  }`}
                >
                  {isSaved ? '✓ In Watchlist' : 'Add to Watchlist'}
                </button>
              )}
              
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface/50 border border-border/50 text-bone hover:bg-surface transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-8">
        
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* SECTION 2: RECOMMENDATION CONTEXT */}
          {recommendation && recommender && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recommended by your crew</h2>
              <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col sm:flex-row gap-5 items-start">
                <UserAvatar name={recommender.displayName} size="lg" />
                <div className="flex-1">
                  <p className="text-bone font-bold mb-2">{recommender.displayName} <span className="font-normal text-muted">recommended this</span></p>
                  {recommendation.reason && (
                    <p className="text-bone text-lg font-editorial italic leading-relaxed mb-4">
                      &ldquo;{recommendation.reason}&rdquo;
                    </p>
                  )}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink rounded-lg border border-border">
                    <span className="w-2 h-2 rounded-full bg-cinema-red" />
                    <span className="text-xs font-bold text-bone">{recommendation.confidenceScore || 92}% Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ABOUT THE TITLE */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">About</h2>
            <div className="rounded-2xl bg-surface border border-border p-6">
              <p className="text-bone/80 text-base leading-relaxed mb-6">
                {mockSynopsis}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-muted mb-1">Director/Creator</p>
                  <p className="text-bone font-medium">{title.creatorOrDirector || 'Unknown'}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-muted mb-1">Cast</p>
                  <p className="text-bone font-medium">{mockCast.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: WHAT YOUR CREW THINKS */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">What your crew thinks</h2>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x hide-scrollbar">
              {[
                { name: 'Maya', stamp: 'Good Call', text: 'Slow, but completely worth it.', rating: 4.5 },
                { name: 'Josh', stamp: 'Risky But Worth It', text: 'You need patience, but it lands.', rating: 4 },
                { name: 'Priya', stamp: 'Mixed Response', text: 'Loved the mood, not the pace.', rating: 3 }
              ].map((reaction, idx) => (
                <div key={idx} className="shrink-0 w-72 rounded-2xl bg-surface border border-border p-5 snap-start flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={reaction.name} size="sm" />
                      <span className="font-bold text-bone text-sm">{reaction.name}</span>
                    </div>
                    <div className="text-cinema-red font-bold text-sm">
                      {reaction.rating}/5
                    </div>
                  </div>
                  <div className="mb-3 h-8">
                     <StampBadge stamp={reaction.stamp as any} size="xs" variant="filled" />
                  </div>
                  <p className="text-bone/80 text-sm mt-auto italic">&ldquo;{reaction.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SECTION 3: TASTE MATCH */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Taste Match</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold font-editorial text-bone">{recommendation?.tasteMatchScore || 85}%</span>
              <span className="text-sm text-cinema-red font-bold mb-1">Match</span>
            </div>
            <p className="text-sm text-bone/70 mb-4">
              Matches your interest in atmospheric mysteries, emotional dramas, and slow-burn storytelling.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Mystery', 'Slow burn', 'Emotional'].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-ink border border-border rounded-md text-xs text-bone/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 7: WATCHLIST STATUS */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSaved ? 'bg-cinema-red' : 'bg-border'}`} />
              <p className="font-bold text-bone text-sm">{isSaved ? 'In your watchlist' : 'Not saved'}</p>
            </div>
            {isSaved && recommendation && (
              <p className="text-xs text-muted mt-3">Added from {recommender?.displayName}&apos;s recommendation</p>
            )}
          </div>

          {/* SECTION 5: PUBLIC RATINGS */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Public Signal</h3>
            <p className="text-xs text-muted mb-4">Public ratings help. Your crew&apos;s taste decides.</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-bone/90 bg-[#f5c518] text-black px-2 py-0.5 rounded text-xs">IMDb</span>
                <span className="text-sm font-bold text-bone">{extRatings.imdb || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-bone/90 bg-[#01b4e4] text-white px-2 py-0.5 rounded text-xs">TMDB</span>
                <span className="text-sm font-bold text-bone">{extRatings.tmdb || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 11: INVITE FRIENDS */}
          <div className="rounded-2xl bg-cinema-red/10 border border-cinema-red/20 p-5">
            <h3 className="text-sm font-bold text-bone mb-1">Want more opinions?</h3>
            <p className="text-xs text-muted mb-4">Invite your crew to stamp this pick.</p>
            <button className="w-full py-2 bg-cinema-red/20 text-cinema-red font-bold rounded-lg text-sm hover:bg-cinema-red hover:text-bone transition-colors">
              Invite friends
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 9 & 10: RELATED CONTENT */}
      <div className="px-4 sm:px-6 lg:px-12 mt-16 space-y-12">
        {/* SECTION 9: MORE FROM YOUR CREW */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">More from your crew</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Mocking a few recommendations from crew */}
            {recommendations.filter(r => r.id !== recId).slice(0, 6).map(rec => {
              const recTitle = getTitle(rec.titleId);
              if (!recTitle) return null;
              return (
                <div key={rec.id} onClick={() => router.push(`/title/${rec.titleId}?recId=${rec.id}`)} className="cursor-pointer group">
                  <div className={`w-full aspect-[2/3] rounded-xl overflow-hidden relative mb-2 ${!recTitle.posterUrl ? `poster-gradient-${recTitle.posterGradient}` : ''}`}>
                    {recTitle.posterUrl && <img src={recTitle.posterUrl} alt={recTitle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    {rec.primaryStamp && (
                      <div className="absolute top-2 left-2 right-2 flex justify-start">
                        <StampBadge stamp={rec.primaryStamp} size="xs" variant="filled" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-bone truncate">{recTitle.title}</h3>
                  <p className="text-xs text-muted truncate">Rec&apos;d by {getUser(rec.recommendedBy)?.displayName}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 10: SIMILAR PICKS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">More like this</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {/* Mocking a few similar titles (just picking the first 6 movies) */}
             {['title-6', 'title-8', 'title-3', 'title-10', 'title-5', 'title-4'].map(tId => {
              const simTitle = getTitle(tId);
              if (!simTitle || simTitle.id === title.id) return null;
              return (
                <div key={simTitle.id} onClick={() => router.push(`/title/${simTitle.id}`)} className="cursor-pointer group">
                  <div className={`w-full aspect-[2/3] rounded-xl overflow-hidden relative mb-2 ${!simTitle.posterUrl ? `poster-gradient-${simTitle.posterGradient}` : ''}`}>
                    {simTitle.posterUrl && <img src={simTitle.posterUrl} alt={simTitle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <h3 className="text-sm font-bold text-bone truncate">{simTitle.title}</h3>
                  <p className="text-xs text-muted truncate">{simTitle.releaseYear} · {simTitle.format}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* SECTION 8: RATE RECOMMENDATION MODAL */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-border flex justify-between items-center bg-ink/50">
              <p className="font-bold text-sm text-bone">Rate Recommendation</p>
              <button onClick={() => setRatingModalOpen(false)} className="text-muted hover:text-bone p-1">✕</button>
            </div>

            <div className="p-6">
              {/* Step 1: Content Rating */}
              {ratingStep === 1 && (
                <div className="space-y-6 page-enter">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-bone font-editorial mb-2">How was it?</h3>
                    <p className="text-sm text-muted">Rate the content itself.</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setContentRating(star)}
                        className={`text-4xl transition-all btn-press ${star <= contentRating ? 'text-cinema-red scale-110' : 'text-muted/30 hover:text-muted/60'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setRatingStep(2)} disabled={contentRating === 0}
                    className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 btn-press">
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Accuracy */}
              {ratingStep === 2 && (
                <div className="space-y-6 page-enter">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-bone font-editorial mb-2">Was this a good rec?</h3>
                    <p className="text-sm text-muted">How well did they read your taste?</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {REC_ACCURACY_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setRecAccuracy(opt)}
                        className={`w-full py-3.5 rounded-xl border font-bold text-sm transition-all btn-press ${
                          recAccuracy === opt ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-ink border-border text-muted hover:border-bone/30 hover:text-bone'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setRatingStep(1)} className="px-4 py-3 bg-ink border border-border text-bone rounded-xl hover:bg-surface transition-colors">Back</button>
                    <button onClick={() => setRatingStep(3)} disabled={!recAccuracy}
                      className="flex-1 py-3 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 btn-press">
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contextual Stamp & Comment */}
              {ratingStep === 3 && (
                <div className="space-y-6 page-enter">
                  <div>
                    <h3 className="font-bold text-bone mb-1">Give them a stamp</h3>
                    <p className="text-xs text-muted mb-4">Optional. Pick one that fits.</p>
                    <div className="flex flex-wrap gap-2">
                      {CORE_STAMPS.map(stamp => (
                        <button key={stamp} onClick={() => setSelectedStamp(selectedStamp === stamp ? null : stamp)}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                            selectedStamp === stamp 
                              ? 'bg-cinema-red border-cinema-red text-bone' 
                              : 'bg-ink border-border text-muted hover:border-border-strong hover:text-bone'
                          }`}>
                          {stamp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-bone mb-2">Final take (optional)</p>
                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Leave a final verdict. Be honest, but don't end the friendship." 
                      className="w-full h-24 p-3 bg-ink border border-border rounded-xl text-sm text-bone placeholder:text-muted focus:outline-none focus:border-cinema-red resize-none" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setRatingStep(2)} disabled={submitting} className="px-4 py-3 bg-ink border border-border text-bone rounded-xl hover:bg-surface transition-colors">Back</button>
                    <button onClick={submitRating} disabled={submitting}
                      className="flex-1 py-3 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 btn-press flex justify-center items-center gap-2">
                      {submitting && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
                      Submit Verdict
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* STICKY MOBILE BOTTOM CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/95 backdrop-blur-md border-t border-border p-3 flex gap-3 safe-area-bottom">
        <button
          onClick={() => setRecommendModalOpen(true)}
          className="flex-1 py-3 bg-cinema-red text-bone rounded-xl font-bold btn-press hover:bg-cinema-red/90 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Recommend
        </button>
        <button
          onClick={toggleWatchlist}
          className={`px-5 py-3 rounded-xl font-bold btn-press border transition-colors text-sm ${
            isSaved ? 'bg-surface border-border text-bone' : 'bg-bone text-ink border-bone'
          }`}
        >
          {isSaved ? '✓ Saved' : '+ Watchlist'}
        </button>
      </div>

      {/* RECOMMEND MODAL */}
      <RecommendModal isOpen={recommendModalOpen} onClose={() => setRecommendModalOpen(false)} title={title} />

    </div>
  );
}
