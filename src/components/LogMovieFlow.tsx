'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Title, CORE_STAMPS, StampType, JournalEntry } from '@/lib/types';
import ModalBase from '@/components/ModalBase';
import StampBadge from '@/components/StampBadge';

interface LogMovieFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: Title | null;
  onSuccess?: () => void;
  existingEntry?: JournalEntry;
}

export default function LogMovieFlow({ isOpen, onClose, initialTitle, onSuccess, existingEntry }: LogMovieFlowProps) {
  const { createJournalEntry, updateJournalEntry, currentUser, titles, addToast } = useApp();
  
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(1);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(initialTitle || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [rating, setRating] = useState<number>(0);
  
  const LOG_STAMPS: StampType[] = ['Certified Good Call', 'Worth It', 'Crew Pick', 'Risky But Worth It', 'Not For Everyone'];
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [shortVerdict, setShortVerdict] = useState('');
  
  const [visibility, setVisibility] = useState<'public' | 'private' | 'crew'>('public');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    if (justOpened) {
      if (initialTitle) {
        setSelectedTitle(initialTitle);
        setStep(2);
      } else {
        setSelectedTitle(null);
        setStep(1);
      }
      setRating(existingEntry?.rating || 0);
      setSelectedStamp(existingEntry?.stamp as StampType || null);
      setShortVerdict(existingEntry?.shortVerdict || '');
      setVisibility(existingEntry?.visibility || 'public');
      setSubmitting(false);
      setSuccess(false);
      setSearchQuery('');
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialTitle, existingEntry]);

  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.error('Search error:', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleTitleSelect = (t: Title) => {
    setSelectedTitle(t);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!currentUser || !selectedTitle || rating === 0) return;
    setSubmitting(true);
    
    if (existingEntry) {
      const { success, error } = await updateJournalEntry(existingEntry.id, {
        rating,
        stamp: selectedStamp || undefined,
        shortVerdict: shortVerdict.trim() || undefined,
        visibility
      });
      setSubmitting(false);
      if (success) {
        addToast('Log updated successfully!', { type: 'success' });
        if (onSuccess) onSuccess();
        onClose();
      }
    } else {
      const { id, error } = await createJournalEntry({
        tmdbId: selectedTitle.tmdbId || parseInt(selectedTitle.id), // Fallback
        mediaType: selectedTitle.type === 'movie' ? 'movie' : 'tv',
        title: selectedTitle.title,
        posterPath: selectedTitle.posterUrl,
        backdropPath: selectedTitle.backdropUrl,
        releaseYear: selectedTitle.releaseYear,
        genres: selectedTitle.genres,
        watchedDate: new Date().toISOString().split('T')[0],
        rating,
        stamp: selectedStamp || undefined,
        shortVerdict: shortVerdict.trim() || undefined,
        sourceType: 'self',
        visibility
      });

      setSubmitting(false);
      if (!error) {
        addToast('Logged to journal!', { type: 'success' });
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    }
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step === 2 && !initialTitle) {
      setStep(1);
    } else if (step > 2) {
      setStep(step - 1);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Find what you watched" : "Log to Journal"}
      subtitle={selectedTitle?.title}
      noPadding={true}
    >
      {success ? (
        <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-cinema-red/15 border border-cinema-red/30 flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Logged to Journal</h2>
          <p className="text-muted mb-8">This has been added to your personal Taste Profile.</p>
          <button onClick={onClose}
            className="px-8 py-3 bg-cinema-red text-bone rounded-xl font-bold hover:bg-cinema-red/90 btn-press transition-colors">
            Done
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Stepper */}
          {selectedTitle && (
            <div className="px-6 pt-5 pb-2">
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => {
                  const actualStep = i + 2;
                  return (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step >= actualStep ? 'bg-cinema-red shadow-[0_0_8px_rgba(234,51,51,0.5)]' : 'bg-border'
                    }`} />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {/* STEP 1: Search (Skip if initialTitle) */}
            {step === 1 && !initialTitle && (
              <div className="space-y-4 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Search movies & shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ink/50 border border-border rounded-xl px-4 py-3 text-bone focus:outline-none focus:border-cinema-red"
                  autoFocus
                />
                
                {searchQuery && (
                  <div className="space-y-2 mt-4">
                    {isSearching ? (
                      <div className="text-center py-8 text-muted animate-pulse">Searching TMDB...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleTitleSelect(t)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
                        >
                          {t.posterUrl ? (
                            <img src={t.posterUrl} alt="" className="w-10 h-14 rounded bg-ink object-cover" />
                          ) : (
                            <div className="w-10 h-14 rounded bg-ink flex items-center justify-center text-[10px] text-muted text-center leading-tight p-1">No<br/>Poster</div>
                          )}
                          <div>
                            <div className="font-bold text-bone">{t.title}</div>
                            <div className="text-xs text-muted">{t.releaseYear} • {t.type}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted">No results found.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Rating */}
            {step === 2 && selectedTitle && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-bone font-editorial mb-2">How was it?</h3>
                  <p className="text-sm text-muted">Rate your experience.</p>
                </div>
                
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)}
                      className={`text-5xl transition-all btn-press ${star <= rating ? 'text-cinema-red scale-110 drop-shadow-[0_0_8px_rgba(234,51,51,0.3)]' : 'text-muted/20 hover:text-muted/40'}`}>
                      ★
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted/60">
                    {rating > 0 ? `${rating} / 5 Stars` : 'Tap to rate'}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Stamp & Verdict */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <h3 className="font-bold text-bone mb-1 text-sm">Stamp your log</h3>
                  <p className="text-[10px] text-muted mb-4 uppercase tracking-widest">Optional. Summarize your thoughts.</p>
                  <div className="flex flex-wrap gap-2">
                    {LOG_STAMPS.map(stamp => (
                      <button key={stamp} onClick={() => setSelectedStamp(selectedStamp === stamp ? null : stamp)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                          selectedStamp === stamp
                            ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30' 
                            : 'bg-ink border-border text-muted hover:border-border-strong hover:text-bone'
                        }`}>
                        {stamp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-bone mb-2 uppercase tracking-widest">Short Verdict</p>
                  <textarea value={shortVerdict} onChange={e => setShortVerdict(e.target.value)}
                    placeholder="Write a quick thought for your journal..." 
                    className="w-full h-28 p-4 bg-ink border border-border rounded-xl text-sm text-bone placeholder:text-muted/40 focus:outline-none focus:border-cinema-red/50 resize-none transition-colors" />
                </div>
                
                {/* Share Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border mt-4">
                  <div>
                    <h4 className="text-sm font-bold text-bone">Share to Crew</h4>
                    <p className="text-xs text-muted">Let others see your verdict</p>
                  </div>
                  <button 
                    onClick={() => setVisibility(v => v === 'public' ? 'private' : 'public')}
                    className={`relative w-12 h-6 rounded-full p-1 transition-colors btn-press ${visibility === 'public' ? 'bg-cinema-red' : 'bg-white/10'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${visibility === 'public' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {selectedTitle && (
            <div className="p-5 border-t border-border bg-ink/50 flex justify-between items-center shrink-0">
              <button 
                onClick={prevStep} 
                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted hover:text-bone transition-colors"
              >
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button 
                  onClick={nextStep} 
                  disabled={step === 2 && rating === 0}
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
                  Save Log
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </ModalBase>
  );
}
