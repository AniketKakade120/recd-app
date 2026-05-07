'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { REC_ACCURACY_OPTIONS, type RecAccuracy, CORE_STAMPS, type StampType } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';

const STATUS_STEPS = ['Recommended', 'Accepted', 'Watching', 'Watched', 'Rated'];
const STATUS_ORDER: Record<string, number> = {
  pending: 0, accepted: 1, maybe_later: 1, not_my_vibe: 1, watching: 2, watched: 3, rated: 4,
};

export default function RecommendationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { recommendations, updateRecommendationStatus, addRating, currentUser, getTitle, getUser } = useApp();

  const [ratingStep, setRatingStep] = useState(0);
  const [contentRating, setContentRating] = useState(0);
  const [recAccuracy, setRecAccuracy] = useState<RecAccuracy | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);

  const rec = recommendations.find(r => r.id === id);
  if (!rec) return (
    <div className="py-20 text-center">
      <p className="text-muted">Recommendation not found.</p>
    </div>
  );

  const title = getTitle(rec.titleId);
  const recommender = getUser(rec.recommendedBy);
  const isReceiver = rec.recommendedToUserIds?.includes(currentUser?.id || '');
  const isSender = currentUser?.id === rec.recommendedBy;
  const currentStep = STATUS_ORDER[rec.status] ?? 0;

  const updateStatus = (status: 'accepted' | 'maybe_later' | 'not_my_vibe' | 'watching' | 'watched') =>
    updateRecommendationStatus(rec.id, status);

  const submitRating = () => {
    if (!currentUser || !recAccuracy || contentRating === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      addRating({
        id: `rating-${Date.now()}`, recommendationId: rec.id, ratedBy: currentUser.id,
        contentRating, recommendationResult: recAccuracy, stamp: selectedStamp || undefined,
        comment: comment.trim() || undefined, createdAt: new Date().toISOString(),
      });
      router.push('/home');
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-muted hover:text-bone text-sm transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      {/* Hero poster */}
      {title && (
        <div className={`rounded-2xl poster-gradient-${title.posterGradient} relative overflow-hidden min-h-[200px] flex flex-col justify-end border border-border`}>
          <div className="absolute inset-0 poster-overlay-strong" />
          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-3xl font-bold text-bone font-editorial leading-tight">{title.title}</h1>
              {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="md" variant="filled" />}
            </div>
            <p className="text-xs text-muted">{title.releaseYear} · {title.format} · {title.genres.slice(0, 2).join(', ')} {title.runtime && `· ${title.runtime}`}</p>
          </div>
        </div>
      )}

      {/* Recommender + context */}
      {recommender && (
        <div className="rounded-2xl bg-surface border border-border p-4 flex items-start gap-3">
          <UserAvatar name={recommender.displayName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-0.5">Recommended by</p>
            <p className="font-bold text-sm text-bone mb-1">{recommender.displayName}</p>
            {rec.reason && <p className="text-sm text-bone/70 italic">&ldquo;{rec.reason}&rdquo;</p>}
          </div>
          {rec.tasteMatchScore && (
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-cinema-red">{rec.tasteMatchScore}%</p>
              <p className="text-sm text-muted">match</p>
            </div>
          )}
        </div>
      )}

      {/* Status timeline */}
      <div className="rounded-2xl bg-surface border border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Journey</p>
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className={`flex flex-col items-center gap-1 ${i <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                  i < currentStep ? 'border-cinema-red bg-cinema-red text-bone'
                  : i === currentStep ? 'border-cinema-red text-cinema-red'
                  : 'border-border text-muted'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <p className="text-xs text-muted text-center leading-tight w-12">{step}</p>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 mb-4 transition-colors ${i < currentStep ? 'bg-cinema-red' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Receiver actions */}
      {ratingStep === 0 && (
        <>
          {isReceiver && rec.status === 'pending' && (
            <div className="rounded-2xl bg-surface border border-border p-5">
              <h3 className="font-bold text-bone mb-3">What&apos;s your verdict?</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => updateStatus('accepted')} className="py-2.5 bg-cinema-red text-bone text-xs font-bold rounded-xl btn-press hover:bg-cinema-red/90">Accept</button>
                <button onClick={() => updateStatus('maybe_later')} className="py-2.5 bg-surface-hover border border-border text-muted text-xs font-medium rounded-xl btn-press hover:text-bone">Maybe later</button>
                <button onClick={() => updateStatus('not_my_vibe')} className="py-2.5 bg-surface-hover border border-border text-muted text-xs font-medium rounded-xl btn-press hover:text-bone">Not my vibe</button>
              </div>
            </div>
          )}

          {isReceiver && rec.status === 'accepted' && (
            <button onClick={() => updateStatus('watching')} className="w-full py-3.5 bg-surface border border-border text-bone font-semibold rounded-xl btn-press hover:bg-surface-hover text-sm">
              Mark as Watching
            </button>
          )}

          {isReceiver && rec.status === 'watching' && (
            <button onClick={() => updateStatus('watched')} className="w-full py-3.5 bg-cinema-red text-bone font-bold rounded-xl btn-press text-sm hover:bg-cinema-red/90">
              I&apos;ve Watched It ✓
            </button>
          )}

          {isReceiver && rec.status === 'watched' && (
            <button onClick={() => setRatingStep(1)} className="w-full py-3.5 bg-cinema-red text-bone font-bold rounded-xl btn-press text-sm hover:bg-cinema-red/90">
              Rate this rec
            </button>
          )}

          {isSender && (
            <div className="rounded-2xl bg-surface border border-border p-5">
              <h3 className="font-bold text-bone mb-1">Waiting for verdict.</h3>
              <p className="text-sm text-muted mb-3">Their rating will update your Taste Score.</p>
              {!nudgeSent ? (
                <button onClick={() => setNudgeSent(true)}
                  className="px-4 py-2 bg-surface-hover border border-border text-bone/70 text-xs font-medium rounded-lg hover:bg-warm-grey btn-press transition-colors">
                  Send gentle nudge
                </button>
              ) : (
                <p className="text-xs text-cinema-red">Still waiting for the verdict.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Rating step 1: Content */}
      {ratingStep === 1 && (
        <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 page-enter">
          <h3 className="text-lg font-bold text-bone text-center font-editorial">How was the movie/show?</h3>
          <p className="text-xs text-muted text-center">Rate the content itself.</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setContentRating(star)}
                className={`text-3xl transition-all btn-press ${star <= contentRating ? 'text-cinema-red scale-110' : 'text-muted/30 hover:text-muted/60'}`}>
                ★
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setRatingStep(2)} disabled={contentRating === 0}
              className="px-6 py-2.5 bg-cinema-red text-bone font-semibold rounded-xl disabled:opacity-40 btn-press text-sm">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Rating step 2: Rec accuracy */}
      {ratingStep === 2 && (
        <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 page-enter">
          <h3 className="text-lg font-bold text-bone text-center font-editorial">Was this a good rec for you?</h3>
          <p className="text-xs text-muted text-center">How well did they read your taste?</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {REC_ACCURACY_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setRecAccuracy(opt)}
                className={`px-5 py-3 rounded-xl border text-sm font-semibold btn-press transition-all ${
                  recAccuracy === opt ? 'bg-cinema-red/15 border-cinema-red/50 text-bone' : 'bg-ink border-border text-muted hover:text-bone'
                }`}>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setRatingStep(1)} className="px-4 py-2 text-muted text-sm hover:text-bone">Back</button>
            <button onClick={() => setRatingStep(3)} disabled={!recAccuracy}
              className="px-6 py-2.5 bg-cinema-red text-bone font-semibold rounded-xl disabled:opacity-40 btn-press text-sm">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Rating step 3: Stamp + comment */}
      {ratingStep === 3 && (
        <div className="space-y-4 page-enter">
          <div className="rounded-2xl bg-surface border border-border p-6">
            <h3 className="text-base font-bold text-bone mb-1">Give them a stamp</h3>
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

          <div className="rounded-2xl bg-surface border border-border p-5">
            <p className="text-xs font-semibold text-bone mb-2">Final take (optional)</p>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Be honest, but don't end the friendship." className="h-20 resize-none text-sm" />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setRatingStep(2)} disabled={submitting} className="px-4 py-2 text-muted text-sm hover:text-bone">Back</button>
            <button onClick={submitRating} disabled={submitting}
              className="px-6 py-2.5 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 btn-press flex items-center gap-2 text-sm hover:bg-cinema-red/90">
              {submitting && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
              Submit Verdict
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
