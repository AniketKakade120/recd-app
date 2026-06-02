'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype, TASTE_ARCHETYPE_DESCRIPTIONS, GENRES, MOODS, PLATFORMS } from '@/lib/types';
import { TasteProfilePoster } from '@/components/onboarding/TasteProfilePoster';
import { usePosterExport } from '@/hooks/usePosterExport';
import InviteModal from '@/components/InviteModal';
import { Theater, Smile, Zap, Ghost, Heart, Rocket, Video, Cat, Search, Sword, Send, Play, RefreshCcw, Users, Star, BarChart2, Plus, ArrowLeft, Settings, Bookmark } from 'lucide-react';

const GenreIcon = ({ genre }: { genre: string }) => {
  const iconProps = { className: "text-cinema-red", size: 20, strokeWidth: 1.5 };
  switch(genre) {
    case 'Drama': return <Theater {...iconProps} />;
    case 'Comedy': return <Smile {...iconProps} />;
    case 'Thriller': return <Zap {...iconProps} />;
    case 'Horror': return <Ghost {...iconProps} />;
    case 'Romance': return <Heart {...iconProps} />;
    case 'Sci-fi': return <Rocket {...iconProps} />;
    case 'Documentary': return <Video {...iconProps} />;
    case 'Anime': return <Cat {...iconProps} />;
    case 'Crime': return <Search {...iconProps} />;
    case 'Fantasy': return <Sword {...iconProps} />;
    default: return <Theater {...iconProps} />;
  }
};

function Chip({ label, selected, onClick, disabled = false }: { label: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled && !selected}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${
        selected
          ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30'
          : disabled && !selected
            ? 'opacity-40 cursor-not-allowed bg-surface/30 border-border text-muted'
            : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-border-strong hover:text-bone hover:bg-surface'
      }`}>
      {label}
    </button>
  );
}

function generateHeadline(archetype: string, topGenre: string, topVibe?: string): string {
  const base = {
    'Emotional Damage Dealer': 'Emotional chaos curator',
    'Plot Twist Addict': 'Plot-twist seeker',
    'Comfort Watch Expert': 'Comfort-watch soul',
    'Horror Sicko': 'Fear-first watcher',
    'Rom-Com Defender': 'Rom-com defender',
    'Prestige TV Snob': 'Prestige TV loyalist',
    'Anime Evangelist': 'Anime evangelist',
    'Slow-Burn Believer': 'Slow-burn heartbreak specialist',
    'Franchise Defender': 'Franchise defender',
    'Documentary Deep Diver': 'Documentary deep diver',
    'Sitcom Loyalist': 'Sitcom loyalist',
    'Thriller Dealer': 'Thriller-first, feelings-later watcher',
  }[archetype] || 'Cinematic soul';

  if (topGenre && topVibe) {
    return `${base} with ${topVibe.toLowerCase()} ${topGenre.toLowerCase()} tendencies`;
  }
  return base;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, currentUser, updatePreferences, isOnboarded } = useApp();
  
  const [step, setStep] = useState(0);
  
  // Step 1: Archetypes
  const [archetypes, setArchetypes] = useState<TasteArchetype[]>([]);
  const [hoveredArchetype, setHoveredArchetype] = useState<TasteArchetype | null>(null);

  // Step 2: Genres & Sliders
  const [genres, setGenres] = useState<string[]>([]);
  const [genrePreferences, setGenrePreferences] = useState<Record<string, number>>({});
  const [vibes, setVibes] = useState<string[]>([]);

  // Step 3: Platforms
  const [platforms, setPlatforms] = useState<string[]>([]);

  // Step 5: Guide
  const [guideSlide, setGuideSlide] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);

  const TOTAL = 5;

  const toggle = <T extends string>(arr: T[], setArr: (v: T[]) => void, val: T, max?: number) => {
    if (arr.includes(val)) {
      setArr(arr.filter(x => x !== val));
    } else {
      if (max && arr.length >= max) return;
      setArr([...arr, val]);
    }
  };

  const handleGenreToggle = (g: string) => {
    if (genres.includes(g)) {
      setGenres(genres.filter(x => x !== g));
      const newPrefs = { ...genrePreferences };
      delete newPrefs[g];
      setGenrePreferences(newPrefs);
    } else {
      if (genres.length >= 5) return;
      setGenres([...genres, g]);
      setGenrePreferences({ ...genrePreferences, [g]: 3 }); // Default slider to 3
    }
  };

  const handleSliderChange = (genre: string, val: number) => {
    setGenrePreferences({ ...genrePreferences, [genre]: val });
  };

  const headline = currentUser ? generateHeadline(
    archetypes[0] || 'Comfort Watch Expert',
    genres.length > 0 ? genres.reduce((a, b) => (genrePreferences[a] > genrePreferences[b] ? a : b)) : 'Drama',
    vibes[0] || 'Comfort'
  ) : '';

  const next = async () => {
    if (step === 1 && archetypes.length > 0) {
      completeOnboarding({ 
        taste_archetype: archetypes[0],
        taste_archetypes: archetypes,
        onboarding_completed: false
      });
    }
    if (step === 2) {
      updatePreferences({ genres: genres as any[], genrePreferences, moods: vibes as any[] });
    }
    if (step === 3) {
      updatePreferences({ platforms: platforms as any[] });
    }
    if (step === 4) {
      completeOnboarding({ generated_taste_headline: headline, onboarding_completed: false });
    }
    
    if (step < TOTAL) {
      setStep(s => s + 1);
      window.scrollTo(0, 0); 
    } else { 
      completeOnboarding({ onboarding_completed: true }); 
      const searchParams = new URLSearchParams(window.location.search);
      const nextParam = searchParams.get('next');
      router.push(nextParam || '/home'); 
    }
  };

  // Auth loading state
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (isOnboarded) {
      router.push('/home');
    }
  }, [isOnboarded, router]);

  useEffect(() => {
    if (currentUser) return; 
    const t = setTimeout(() => setAuthTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [currentUser]);

  useEffect(() => {
    if (authTimedOut && !currentUser) {
      router.push('/login?error=session_expired');
    }
  }, [authTimedOut, currentUser, router]);

  // Poster Export
  const posterRef = useRef<HTMLDivElement>(null);
  const { exportPoster, isExporting } = usePosterExport();

  const handleShare = async () => {
    await exportPoster(posterRef.current, `recd-club-${currentUser?.username || 'taste'}.png`);
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-2 border-cinema-red border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,51,51,0.3)]" />
        <p className="text-xs text-muted uppercase tracking-widest animate-pulse">Stamping your taste...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto pt-8 pb-32 sm:pb-24 px-6 items-center text-center relative overflow-hidden">
      
      {/* Sleek Centered Progress */}
      {step > 0 && (
        <div className="w-full max-w-md flex gap-2 mb-12 sm:mb-16 opacity-80 shrink-0 z-20">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${step > i ? 'bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-surface'}`} />
          ))}
        </div>
      )}

      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        
        {/* Step 0: Welcome Screen */}
        {step === 0 && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 ease-out max-w-2xl">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-cinema-red to-brick p-[2px] mb-8 shadow-[0_0_50px_rgba(229,9,20,0.3)]">
              <div className="w-full h-full rounded-full bg-ink flex items-center justify-center overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-bone">{currentUser.displayName[0]}</span>
                )}
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold text-bone font-editorial mb-6 leading-tight">
              Welcome to the <br />
              <span className="text-cinema-red">Rec&apos;d Club</span>, {currentUser.displayName.split(' ')[0]}.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted/80 mb-12 leading-relaxed max-w-lg">
              You&apos;re in. Now, let&apos;s refine your profile so your crew knows exactly what your taste is made of.
            </p>
            
            <button 
              onClick={() => setStep(1)}
              className="group relative px-10 py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(229,9,20,0.4)] text-xl btn-press overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Tell us about yourself
                <svg viewBox="0 0 24 24" width="20" height="20" className="transition-transform group-hover:translate-x-1"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.58L12 20l8-8z" fill="currentColor"/></svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
          </div>
        )}

        {/* Step 1: Archetypes */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4">Choose your taste traits.</h1>
            <p className="text-lg sm:text-xl text-muted mb-2 max-w-2xl leading-relaxed">Pick up to 3 that feel most like your watch personality.</p>
            <p className="text-sm font-medium text-cinema-red mb-8">{archetypes.length} of 3 selected</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mb-4 sm:mb-6">
              {TASTE_ARCHETYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => toggle(archetypes, setArchetypes, type, 3)}
                  onMouseEnter={() => setHoveredArchetype(type)}
                  onMouseLeave={() => setHoveredArchetype(null)}
                  disabled={archetypes.length >= 3 && !archetypes.includes(type)}
                  className={`relative p-6 h-28 sm:h-32 rounded-2xl border text-center transition-all duration-300 ease-out flex flex-col items-center justify-center overflow-hidden group ${
                    archetypes.includes(type) 
                      ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30 active:scale-95' 
                      : archetypes.length >= 3
                        ? 'opacity-30 cursor-not-allowed border-border/50 bg-transparent grayscale'
                        : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:text-bone hover:border-border-strong hover:bg-surface active:scale-95'
                  }`}
                >
                  <div className={`transition-all duration-300 transform ${ (hoveredArchetype === type || archetypes.includes(type)) ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0' }`}>
                    <span className="block font-bold text-lg leading-tight">{type}</span>
                  </div>
                  
                  <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center transition-all duration-300 transform ${ (hoveredArchetype === type || archetypes.includes(type)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4' }`}>
                    <span className="block font-bold text-[10px] uppercase tracking-widest text-cinema-red mb-1">{type}</span>
                    <p className="text-xs sm:text-sm font-medium text-bone leading-tight">
                      {TASTE_ARCHETYPE_DESCRIPTIONS[type]}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <button onClick={next} disabled={archetypes.length === 0} 
                className="w-full max-w-md py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl disabled:opacity-40 transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press shrink-0">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Genres & Sliders */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4">What usually lands for you?</h1>
            <p className="text-lg sm:text-xl text-muted mb-8 max-w-2xl leading-relaxed">Choose the genres you care about, then tune how much they hit for you.</p>
            
            {/* Sliders */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {GENRES.map(genre => {
                const val = genrePreferences[genre] || 3;
                const percentage = ((val - 1) / 4) * 100;

                return (
                  <div key={genre} className="bg-ink/40 border border-white/5 p-5 rounded-2xl flex items-center gap-6 group hover:border-cinema-red/30 transition-colors">
                    <div className="flex items-center gap-3 w-[120px] shrink-0">
                      <GenreIcon genre={genre} />
                      <span className="text-base font-bold text-bone">{genre}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3 relative">
                      <input 
                        type="range" min="1" max="5" step="0.01" 
                        value={val}
                        onChange={(e) => {
                          handleSliderChange(genre, parseFloat(e.target.value));
                          if (!genres.includes(genre)) {
                            setGenres(prev => [...prev, genre]);
                          }
                        }}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer transition-all outline-none 
                          [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:w-4 
                          [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:rounded-full 
                          [&::-webkit-slider-thumb]:bg-cinema-red 
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-ink
                          [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(229,9,20,0.8)]
                          [&::-moz-range-thumb]:w-4 
                          [&::-moz-range-thumb]:h-4 
                          [&::-moz-range-thumb]:rounded-full 
                          [&::-moz-range-thumb]:bg-cinema-red 
                          [&::-moz-range-thumb]:border-2
                          [&::-moz-range-thumb]:border-ink
                          [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(229,9,20,0.8)]"
                        style={{
                          background: `linear-gradient(to right, #E50914 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vibes (Optional) */}
            <div className="w-full max-w-4xl flex flex-col items-center border-t border-border/50 pt-8 mt-4">
              <p className="text-sm font-bold text-muted uppercase tracking-[0.2em] mb-5">Choose a few watch vibes (Optional)</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {MOODS.map(v => (
                  <Chip key={v} label={v} selected={vibes.includes(v)} onClick={() => toggle(vibes, setVibes, v, 4)} disabled={vibes.length >= 4} />
                ))}
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full mt-12">
              <div className="w-full max-w-md flex gap-4 shrink-0">
                <button onClick={() => setStep(1)} className="px-8 py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover transition-all text-lg btn-press">Back</button>
                <button onClick={next} className="flex-1 py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Platforms */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4">Where do you watch?</h1>
            <p className="text-lg sm:text-xl text-muted mb-8 max-w-2xl leading-relaxed">Pick the platforms you use most. We&apos;ll use this to show better watch options later.</p>
            
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl mb-8">
              {PLATFORMS.map(p => <Chip key={p} label={p} selected={platforms.includes(p)} onClick={() => toggle(platforms, setPlatforms, p)} />)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <div className="w-full max-w-md flex flex-col gap-4 shrink-0">
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-8 py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover transition-all text-lg btn-press">Back</button>
                  <button onClick={next} className="flex-1 py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">Continue</button>
                </div>
                <button onClick={next} className="py-2 text-muted text-sm font-medium hover:text-bone transition-all">Skip for now</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Shareable Poster */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4">How you show up on Rec&apos;d Club.</h1>
            <p className="text-lg sm:text-xl text-muted mb-10 max-w-2xl leading-relaxed">Your taste profile is ready.</p>
            
            {/* Poster Preview */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(229,9,20,0.2)] mb-10 w-[270px] h-[480px] sm:w-[324px] sm:h-[576px] bg-ink ring-1 ring-border group">
              {/* Offscreen real size for export */}
              <div className="absolute top-0 left-0 -z-10 opacity-0 pointer-events-none">
                <TasteProfilePoster 
                  ref={posterRef}
                  displayName={currentUser.displayName}
                  archetypes={archetypes}
                  genrePreferences={genrePreferences}
                  vibes={vibes.slice(0,3)}
                />
              </div>

              {/* Scaled Preview */}
              <div className="transform scale-[0.25] sm:scale-[0.3] origin-top-left pointer-events-none absolute top-0 left-0">
                <TasteProfilePoster 
                  displayName={currentUser.displayName}
                  archetypes={archetypes}
                  genrePreferences={genrePreferences}
                  vibes={vibes.slice(0,3)}
                />
              </div>

              {/* Overlay Download Button */}
              <button 
                onClick={handleShare} 
                disabled={isExporting}
                title="Download Poster"
                className="absolute bottom-4 right-4 z-30 w-12 h-12 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-bone transition-transform hover:scale-110 hover:bg-cinema-red hover:border-cinema-red active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:opacity-100 opacity-90"
              >
                {isExporting ? (
                  <span className="w-5 h-5 border-2 border-bone/30 border-t-bone rounded-full animate-spin"></span>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                )}
              </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <div className="w-full max-w-md flex flex-col gap-4 shrink-0">
                <button onClick={next} className="w-full py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-[0_10px_40px_rgba(229,9,20,0.3)] text-lg btn-press">
                  Continue to Rec&apos;d Club →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Invite */}
        {step === 5 && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 ease-out pt-6 sm:pt-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cinema-red/10 border border-cinema-red/30 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_30px_rgba(229,9,20,0.2)]">
              <span className="text-3xl sm:text-4xl">🍿</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4 sm:mb-6">Bring your crew in.</h1>
            <p className="text-lg sm:text-xl text-muted mb-8 sm:mb-12 max-w-2xl leading-relaxed">Rec&apos;d gets infinitely better when your friends start recommending things too.</p>
            
            <div className="w-full max-w-md space-y-4 mb-8 px-2">
              <button onClick={() => setInviteOpen(true)}
                className="w-full py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">
                Invite Friends
              </button>
              <button onClick={next}
                className="w-full py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover active:scale-[0.98] transition-all text-lg btn-press">
                Enter Rec&apos;d →
              </button>
              <button onClick={skip} className="w-full py-2 text-muted text-sm font-medium hover:text-bone hover:underline underline-offset-4 transition-all">
                Skip for now
              </button>
            </div>
            <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
