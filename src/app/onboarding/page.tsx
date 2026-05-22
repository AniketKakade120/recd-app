'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype, TASTE_ARCHETYPE_DESCRIPTIONS, GENRES, MOODS, FORMATS, LANGUAGES, PLATFORMS } from '@/lib/types';
import InviteModal from '@/components/InviteModal';

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${
        selected
          ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30'
          : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-border-strong hover:text-bone hover:bg-surface'
      }`}>
      {label}
    </button>
  );
}


export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, currentUser, updatePreferences, isOnboarded } = useApp();
  
  // Prevent welcome screen loop if already onboarded
  useEffect(() => {
    if (isOnboarded) {
      router.push('/home');
    }
  }, [isOnboarded, router]);

  const [step, setStep] = useState(0);
  const [archetype, setArchetype] = useState<TasteArchetype | null>(null);
  const [hoveredArchetype, setHoveredArchetype] = useState<TasteArchetype | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const TOTAL = 6;

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const next = async () => {
    // Fire and forget updates to ensure UI moves immediately
    if (step === 1 && archetype) completeOnboarding({ taste_archetype: archetype });
    if (step === 2) updatePreferences({ genres: genres as any[] });
    if (step === 3) updatePreferences({ moods: moods as any[], formats: formats as any[], languages: languages as any[] });
    if (step === 4) updatePreferences({ platforms: platforms as any[] });
    
    if (step < TOTAL - 1) {
      setStep(s => s + 1);
      window.scrollTo(0, 0); // Scroll to top for new step
    } else { 
      completeOnboarding({ onboarding_completed: true }); // Final sync
      const searchParams = new URLSearchParams(window.location.search);
      const nextParam = searchParams.get('next');
      router.push(nextParam || '/home'); 
    }
  };

  const skip = () => { 
    completeOnboarding(); 
    const searchParams = new URLSearchParams(window.location.search);
    const nextParam = searchParams.get('next');
    router.push(nextParam || '/home'); 
  };

  // Safety timeout: if currentUser is still null after 8s, the SIGNED_IN event
  // never fired — session is likely invalid. Redirect to login.
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (currentUser) return; // session arrived, no need for timeout
    const t = setTimeout(() => setAuthTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [currentUser]);

  useEffect(() => {
    if (authTimedOut && !currentUser) {
      router.push('/login?error=session_expired');
    }
  }, [authTimedOut, currentUser, router]);

  // Don't render a blank screen while auth state is loading — show a spinner instead.
  // currentUser is null for 1-2s after OAuth redirect while onAuthStateChange fetches the profile.
  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-2 border-cinema-red border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,51,51,0.3)]" />
        <p className="text-xs text-muted uppercase tracking-widest animate-pulse">Stamping your taste...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto pt-8 pb-32 sm:pb-24 px-6 items-center text-center relative">
      
      {/* Sleek Centered Progress - Only show after welcome step */}
      {step > 0 && (
        <div className="w-full max-w-md flex gap-2 mb-12 sm:mb-16 opacity-80 shrink-0">
          {Array.from({ length: TOTAL - 1 }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${step > i ? 'bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-surface'}`} />
          ))}
        </div>
      )}

      <div className="flex-1 w-full flex flex-col items-center justify-center">
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
        {/* Step 1: Archetype */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 1 of {TOTAL}</p>
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4 sm:mb-6">Choose your taste archetype.</h1>
            <p className="text-lg sm:text-xl text-muted mb-4 sm:mb-8 max-w-2xl leading-relaxed">Pick the kind of watcher you are. Your crew will know what kind of recommendations to expect from you.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mb-4 sm:mb-6">
              {TASTE_ARCHETYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => setArchetype(type)}
                  onMouseEnter={() => setHoveredArchetype(type)}
                  onMouseLeave={() => setHoveredArchetype(null)}
                  className={`relative p-6 h-28 sm:h-32 rounded-2xl border text-center transition-all duration-300 ease-out active:scale-95 flex flex-col items-center justify-center overflow-hidden group ${
                    archetype === type 
                      ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30' 
                      : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:text-bone hover:border-border-strong hover:bg-surface'
                  }`}
                >
                  <div className={`transition-all duration-300 transform ${ (hoveredArchetype === type || archetype === type) ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0' }`}>
                    <span className="block font-bold text-lg leading-tight">{type}</span>
                  </div>
                  
                  <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center transition-all duration-300 transform ${ (hoveredArchetype === type || archetype === type) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4' }`}>
                    <span className="block font-bold text-[10px] uppercase tracking-widest text-cinema-red mb-1">{type}</span>
                    <p className="text-xs sm:text-sm font-medium text-bone leading-tight">
                      {TASTE_ARCHETYPE_DESCRIPTIONS[type]}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <button onClick={next} disabled={!archetype} 
                className="w-full max-w-md py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl disabled:opacity-40 transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press shrink-0">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Genres */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 2 of {TOTAL}</p>
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4 sm:mb-6">What do you watch?</h1>
            <p className="text-lg sm:text-xl text-muted mb-4 sm:mb-8 max-w-2xl leading-relaxed">Select the genres you gravitate towards the most.</p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-4xl mb-4 sm:mb-6">
              {GENRES.map(g => <Chip key={g} label={g} selected={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)} />)}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <div className="w-full max-w-md flex gap-4 shrink-0">
                <button onClick={() => setStep(1)} className="px-8 py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover transition-all text-lg btn-press">Back</button>
                <button onClick={next} className="flex-1 py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Moods + Formats + Languages */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 3 of {TOTAL}</p>
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4 sm:mb-6">Define your vibe.</h1>
            <p className="text-lg sm:text-xl text-muted mb-4 sm:mb-8 max-w-2xl leading-relaxed">How and what do you usually like to watch?</p>
            
            <div className="w-full max-w-4xl space-y-10 sm:space-y-12 mb-4 sm:mb-6">
              {[
                { title: 'Moods', opts: MOODS, arr: moods, set: setMoods },
                { title: 'Formats', opts: FORMATS, arr: formats, set: setFormats },
                { title: 'Regions', opts: LANGUAGES, arr: languages, set: setLanguages },
              ].map(({ title, opts, arr, set }) => (
                <div key={title} className="flex flex-col items-center">
                  <p className="text-[10px] sm:text-sm font-bold text-bone/50 uppercase tracking-[0.2em] mb-4 sm:mb-5">{title}</p>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {opts.map(o => <Chip key={o} label={o} selected={arr.includes(o)} onClick={() => toggle(arr, set, o)} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <div className="w-full max-w-md flex gap-4 shrink-0">
                <button onClick={() => setStep(2)} className="px-8 py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover transition-all text-lg btn-press">Back</button>
                <button onClick={next} className="flex-1 py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Platforms */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-2">
            <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 4 of {TOTAL}</p>
            <h1 className="text-4xl sm:text-6xl font-bold text-bone font-editorial mb-4 sm:mb-6">Where do you watch?</h1>
            <p className="text-lg sm:text-xl text-muted mb-4 sm:mb-8 max-w-2xl leading-relaxed">Select your primary streaming platforms.</p>
            
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl mb-4 sm:mb-6">
              {PLATFORMS.map(p => <Chip key={p} label={p} selected={platforms.includes(p)} onClick={() => toggle(platforms, setPlatforms, p)} />)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-background via-background/95 to-transparent sm:bg-none sm:relative z-20 flex justify-center w-full">
              <div className="w-full max-w-md flex gap-4 shrink-0">
                <button onClick={() => setStep(3)} className="px-8 py-4 sm:py-5 bg-surface border border-border text-bone font-bold rounded-2xl hover:bg-surface-hover transition-all text-lg btn-press">Back</button>
                <button onClick={next} className="flex-1 py-4 sm:py-5 bg-cinema-red text-bone font-bold rounded-2xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-2xl text-lg btn-press">Continue</button>
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
