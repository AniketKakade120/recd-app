'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Recommendation } from '@/lib/types';
import { useApp } from '@/lib/context';
import StampBadge from './StampBadge';
import UserAvatar from './UserAvatar';
import VerdictModal from './VerdictModal';

interface VerdictCarouselProps {
  recommendations: Recommendation[];
}

export default function VerdictCarousel({ recommendations: recs }: VerdictCarouselProps) {
  const { getTitle, getUser, getViewerContext, getActions, updateVerdictState, addToWatchlist, addTitleToWatchlist, currentUser, addToast, openGiveVerdictModal } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStep0, setShowStep0] = useState(false);
  const [notYetView, setNotYetView] = useState(false);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (recs.length === 0) return null;

  const currentRec = recs[currentIndex];
  const title = getTitle(currentRec.titleId);
  const recommender = getUser(currentRec.recommendedBy);

  if (!title) return null;

  const viewerContext = getViewerContext(currentRec);
  const actions = getActions(currentRec);

  const nextSlide = () => {
    setNotYetView(false);
    setCurrentIndex((prev) => (prev + 1) % recs.length);
    setShowStep0(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + recs.length) % recs.length);
    setShowStep0(false);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'rate':
        setShowStep0(true);
        break;
      case 'save':
        if (title) {
          addTitleToWatchlist(title.id);
          nextSlide();
        }
        break;
      case 'view_verdict':
        setVerdictModalOpen(true);
        break;
      case 'edit_verdict':
        openGiveVerdictModal(currentRec.id, true);
        break;
      case 'nudge':
        // Mock nudge
        break;
      default:
        nextSlide();
    }
  };

  const proceedToRating = () => {
    openGiveVerdictModal(currentRec.id);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div className="flex items-end justify-between px-1 md:px-0">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-bold text-bone font-editorial tracking-tight">
            {recs.length} verdicts pending.
          </h1>
          <p className="text-muted text-base sm:text-lg">Your crew is waiting. Time to close the loop.</p>
        </div>
        <Link href="/watchlist" className="text-sm font-bold text-cinema-red hover:text-cinema-red/80 transition-colors hidden sm:block mb-2">
          View all
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative group">
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a] min-h-[400px] flex flex-col justify-end shadow-2xl">
          
          {/* Background Image with Key for smooth switching */}
          <Link href={`/title/${title.id}`} key={title.id} className="absolute inset-0 transition-opacity duration-700 animate-in fade-in cursor-pointer z-0">
            {/* Always show gradient as base */}
            <div className={`absolute inset-0 opacity-40 poster-gradient-${title.posterGradient || '1'}`} />
            
            {title.backdropUrl && !imageError && (
              <img 
                src={title.backdropUrl} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-40" 
                onError={() => setImageError(true)}
              />
            )}
          </Link>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />

          {/* Card Content */}
          <div key={`content-${currentIndex}`} className="relative z-10 p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bone bg-cinema-red px-2.5 py-1 rounded">
                {recommender?.displayName ? `${recommender.displayName}'s Pick` : 'Top Pick'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded border border-white/10 bg-white/5 backdrop-blur-md text-bone/70">
                Verdict pending
              </span>
            </div>

            <Link href={`/title/${title.id}`} className="block w-fit group/title">
              <h2 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-3 leading-none tracking-tight group-hover/title:text-cinema-red transition-colors">
                {title.title}
              </h2>
            </Link>

            <p className="text-muted text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
              <span>{title.releaseYear}</span>
              <span className="opacity-30">·</span>
              <span>{title.type === 'movie' ? 'Movie' : 'Series'}</span>
              <span className="opacity-30">·</span>
              <span>{title.genres.slice(0, 2).join(', ')}</span>
              {title.runtime && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{title.runtime}</span>
                </>
              )}
            </p>

            {currentRec.reason && (
              <p className="text-base sm:text-lg text-bone/70 font-medium leading-relaxed italic mb-8 max-w-2xl line-clamp-2">
                &ldquo;{currentRec.reason}&rdquo;
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
              {showStep0 ? (
                <div className="flex-1 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-2 mb-4">
                    <p className="text-lg font-bold text-bone">Have you watched this?</p>
                    <p className="text-xs text-muted">You can only stamp a rec after you&apos;ve seen it.</p>
                  </div>
                  {!notYetView ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={proceedToRating}
                        className="px-6 py-3 bg-cinema-red text-bone rounded-xl font-bold text-sm btn-press shadow-lg shadow-cinema-red/20"
                      >
                        Yes, give verdict
                      </button>
                      <button 
                        onClick={() => setNotYetView(true)}
                        className="px-6 py-3 bg-white/5 text-bone border border-white/10 rounded-xl font-semibold text-sm btn-press hover:bg-white/10 transition-colors"
                      >
                        Not yet
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Pick a path</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            addTitleToWatchlist(title.id);
                            addToast(`Added ${title.title} to watchlist.`, { type: 'success' });
                            nextSlide();
                          }}
                          className="flex-1 py-3 bg-bone text-ink rounded-xl font-bold text-xs btn-press"
                        >
                          Save to Watchlist
                        </button>
                        <button 
                          onClick={() => {
                            setNotYetView(false);
                            setShowStep0(false);
                          }}
                          className="px-6 py-3 bg-white/5 text-bone border border-white/10 rounded-xl font-semibold text-xs btn-press hover:bg-white/10 transition-colors"
                        >
                          Maybe later
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <UserAvatar name={recommender?.displayName || 'U'} size="sm" />
                    </div>
                    <div className="relative">
                      <p className="text-xs text-muted mb-0.5">
                        Rec&apos;d by <span className="text-bone font-bold">{recommender?.displayName}</span>
                      </p>
                      <div className="relative group/match">
                        <div className="flex items-center gap-1.5 cursor-help">
                          <p className="text-xs font-bold text-cinema-red">{currentRec.tasteMatchScore}% taste match</p>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cinema-red/40 group-hover/match:text-cinema-red transition-colors"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        </div>
    
                        {/* Match Tooltip */}
                        <div className="absolute bottom-full left-0 mb-4 w-64 p-4 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 invisible group-hover/match:visible opacity-0 group-hover/match:opacity-100 transition-all duration-200 translate-y-2 group-hover/match:translate-y-0 origin-bottom-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-cinema-red mb-2">Taste Match Breakdown</p>
                          <p className="text-xs font-bold text-bone mb-3">Why {currentRec.tasteMatchScore}% match?</p>
                          <ul className="space-y-2.5">
                            <li className="text-[10px] text-muted leading-relaxed flex gap-2">
                              <span className="text-cinema-red shrink-0 mt-0.5">●</span> 
                              <span>Matches your interest in <span className="text-bone">{title.genres.slice(0, 2).join(' & ')}</span></span>
                            </li>
                            <li className="text-[10px] text-muted leading-relaxed flex gap-2">
                              <span className="text-cinema-red shrink-0 mt-0.5">●</span> 
                              <span><span className="text-bone">{recommender?.displayName}</span> usually gets your taste</span>
                            </li>
                            <li className="text-[10px] text-muted leading-relaxed flex gap-2">
                              <span className="text-cinema-red shrink-0 mt-0.5">●</span> 
                              <span>Popular with your <span className="text-bone">crew</span></span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
    
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {actions.primary && (
                      <button 
                        onClick={() => handleAction(actions.primary!.action)}
                        className="flex-1 sm:flex-none px-8 py-3.5 bg-cinema-red text-bone rounded-xl font-bold hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20 text-sm"
                      >
                        {actions.primary.label}
                      </button>
                    )}
                    {actions.secondary && (
                      <button 
                        onClick={() => handleAction(actions.secondary!.action)}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-white/5 hover:bg-white/10 text-bone border border-white/10 rounded-xl font-semibold transition-all btn-press backdrop-blur-sm text-sm"
                      >
                        {actions.secondary.label}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-50">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-bone/80 hover:text-bone hover:bg-cinema-red hover:border-cinema-red transition-all pointer-events-auto active:scale-90 shadow-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-bone/80 hover:text-bone hover:bg-cinema-red hover:border-cinema-red transition-all pointer-events-auto active:scale-90 shadow-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Indicators - Standard Clean Dots */}
        <div className="mt-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            {recs.map((_, i) => (
              <button 
                key={i}
                onClick={() => { setCurrentIndex(i); }}
                className={`transition-all duration-500 rounded-full ${i === currentIndex ? 'w-8 h-1.5 bg-cinema-red shadow-[0_0_12px_rgba(229,9,20,0.4)]' : 'w-1.5 h-1.5 bg-white/10 hover:bg-white/20'}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bone/90">
            {currentIndex + 1} <span className="px-0.5">OF</span> {recs.length} <span className="text-cinema-red ml-1">PENDING</span>
          </p>
        </div>
      </div>
      <VerdictModal 
        recommendationId={currentRec.id} 
        isOpen={verdictModalOpen} 
        onClose={() => setVerdictModalOpen(false)} 
      />
    </div>
  );
}
