'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { REC_ACCURACY_OPTIONS, type RecAccuracy, type StampType } from '@/lib/types';
import StampBadge from '@/components/StampBadge';

export default function GiveVerdictModal() {
  const { 
    giveVerdictModalOpen, 
    giveVerdictModalData, 
    closeGiveVerdictModal,
    currentUser, 
    recommendations, 
    ratings, 
    getTitle, 
    addRating, 
    addToast,
    addToWatchlist,
    addTitleToWatchlist,
    watchlist
  } = useApp();

  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1); // Step 1: Content Rating
  const [contentRating, setContentRating] = useState(0);
  const [recAccuracy, setRecAccuracy] = useState<RecAccuracy | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const recId = giveVerdictModalData?.recommendationId;
  const isEdit = giveVerdictModalData?.edit;
  const recommendation = recommendations.find(r => r.id === recId);
  const title = recommendation ? getTitle(recommendation.titleId) : null;
  const existingRating = isEdit ? ratings.find(r => r.recommendationId === recId && r.ratedBy === currentUser?.id) : null;

  // Initialize/Reset state
  useEffect(() => {
    if (giveVerdictModalOpen) {
      if (isEdit && existingRating) {
        setContentRating(existingRating.contentRating);
        setRecAccuracy(existingRating.recommendationResult);
        setSelectedStamp(existingRating.stamp || null);
        setComment(existingRating.comment || '');
        setStep(1); // Skip watched check for edits
      } else {
        setStep(1); // Start directly at step 1
        setContentRating(0);
        setRecAccuracy(null);
        setSelectedStamp(null);
        setComment('');
      }
      setSuccess(false);
      setSubmitting(false);
    }
  }, [giveVerdictModalOpen, isEdit, existingRating]);

  if (!giveVerdictModalOpen || !recommendation || !title) return null;

  const handleSubmit = () => {
    if (!currentUser || !recAccuracy || contentRating === 0) return;
    setSubmitting(true);
    
    setTimeout(() => {
      addRating({
        id: existingRating?.id || `rating-${Date.now()}`, 
        recommendationId: recommendation.id, 
        ratedBy: currentUser.id,
        contentRating, 
        recommendationResult: recAccuracy, 
        stamp: selectedStamp || undefined,
        comment: comment.trim() || undefined, 
        createdAt: existingRating?.createdAt || new Date().toISOString(),
      });
      
      addToast(isEdit ? 'Verdict updated!' : 'Verdict submitted!', { type: 'success' });
      setSuccess(true);
      setSubmitting(false);
    }, 800);
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isSaved = watchlist.some(w => w.titleId === title.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={closeGiveVerdictModal}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-surface border border-border shadow-2xl rounded-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-ink/50">
          <div>
            <h1 className="text-xl font-bold text-bone font-editorial leading-none">
              {isEdit ? 'Edit Verdict' : 'Give Verdict'}
            </h1>
            <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mt-1">
              {title.title}
            </p>
          </div>
          <button 
            onClick={closeGiveVerdictModal}
            className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border flex items-center justify-center text-muted hover:text-bone transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-cinema-red/15 border border-cinema-red/30 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Verdict Submitted</h2>
            <p className="text-muted mb-8">Your crew's taste score has been updated.</p>
            <button onClick={closeGiveVerdictModal}
              className="px-8 py-3 bg-cinema-red text-bone rounded-xl font-bold hover:bg-cinema-red/90 btn-press transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Stepper */}
              <div className="px-6 pt-5 pb-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: 3 }, (_, i) => {
                    const actualStep = i + 1;
                    return (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        step >= actualStep ? 'bg-cinema-red shadow-[0_0_8px_rgba(234,51,51,0.5)]' : 'bg-border'
                      }`} />
                    );
                  })}
                </div>
              </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
              
              {/* STEP 0 has been removed to skip the redundant watched check */}

              {/* STEP 1: Content Rating */}
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-bone font-editorial mb-2">How was it?</h3>
                    <p className="text-sm text-muted">Rate the content itself.</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setContentRating(star)}
                        className={`text-5xl transition-all btn-press ${star <= contentRating ? 'text-cinema-red scale-110 drop-shadow-[0_0_8px_rgba(234,51,51,0.3)]' : 'text-muted/20 hover:text-muted/40'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <span className="text-xs font-black uppercase tracking-widest text-muted/60">
                      {contentRating > 0 ? `${contentRating} / 5 Stars` : 'Tap to rate'}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: Accuracy */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-bone font-editorial mb-2">Was this a good rec?</h3>
                    <p className="text-sm text-muted">How well did they read your taste?</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {REC_ACCURACY_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setRecAccuracy(opt)}
                        className={`w-full py-4 rounded-xl border font-bold text-sm transition-all btn-press ${
                          recAccuracy === opt 
                            ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30' 
                            : 'bg-ink border-border text-muted hover:border-bone/30 hover:text-bone'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Contextual Stamp & Comment */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="font-bold text-bone mb-1 text-sm">Give them a stamp</h3>
                    <p className="text-[10px] text-muted mb-4 uppercase tracking-widest">Optional. Pick one that fits.</p>
                    <div className="flex flex-wrap gap-2">
                      {recAccuracy && (
                        (() => {
                          const stamps = recAccuracy === 'Nailed it' 
                            ? ['Good Call', 'Worth It', 'Certified Good Call', 'Cult Pick']
                            : recAccuracy === 'Pretty close'
                            ? ['Risky But Worth It', 'Mixed Response', 'Not For Everyone']
                            : ['Missed The Mark', 'Not For Everyone', 'Questionable Taste'];
                          
                          return stamps.map(stamp => (
                            <button key={stamp} onClick={() => setSelectedStamp(selectedStamp === (stamp as any) ? null : (stamp as any))}
                              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                                selectedStamp === (stamp as any)
                                  ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30' 
                                  : 'bg-ink border-border text-muted hover:border-border-strong hover:text-bone'
                              }`}>
                              {stamp}
                            </button>
                          ));
                        })()
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-bone mb-2 uppercase tracking-widest">Final take (optional)</p>
                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Be honest, but keep it crew-friendly." 
                      className="w-full h-28 p-4 bg-ink border border-border rounded-xl text-sm text-bone placeholder:text-muted/40 focus:outline-none focus:border-cinema-red/50 resize-none transition-colors" />
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Controls */}
            <div className="p-5 border-t border-border bg-ink/50 flex justify-between items-center shrink-0">
              {step > 1 ? (
                <button 
                  onClick={prevStep} 
                  className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted hover:text-bone transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={
                      (step === 1 && contentRating === 0) || 
                      (step === 2 && !recAccuracy)
                    }
                    className="px-8 py-2.5 bg-bone text-ink font-bold rounded-xl text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed btn-press transition-all hover:bg-white"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="px-10 py-2.5 bg-cinema-red text-bone font-bold rounded-xl text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed btn-press transition-all hover:bg-cinema-red/90 flex items-center gap-2 shadow-[0_0_15px_rgba(234,51,51,0.4)]"
                  >
                    {submitting && <div className="w-3 h-3 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
                    {isEdit ? 'Update Verdict' : 'Submit Verdict'}
                  </button>
                )}
              </div>
          </div>
        )}

      </div>
    </div>
  );
}
