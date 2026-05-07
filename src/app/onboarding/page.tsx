'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype, GENRES, MOODS, FORMATS, LANGUAGES, PLATFORMS } from '@/lib/types';
import InviteModal from '@/components/InviteModal';

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 ${
        selected
          ? 'bg-gradient-to-br from-cinema-red to-cinema-red/80 border-cinema-red/50 text-bone shadow-[0_0_15px_rgba(229,9,20,0.3)]'
          : 'bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-border-strong hover:text-bone hover:bg-surface'
      }`}>
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, currentUser, updatePreferences } = useApp();
  const [step, setStep] = useState(1);
  const [archetype, setArchetype] = useState<TasteArchetype | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const TOTAL = 5;

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const next = () => {
    if (step === 2) updatePreferences({ genres: genres as never[] });
    if (step === 3) updatePreferences({ moods: moods as never[], formats: formats as never[], languages: languages as never[] });
    if (step === 4) updatePreferences({ platforms: platforms as never[] });
    if (step < TOTAL) setStep(s => s + 1);
    else { completeOnboarding(); router.push('/home'); }
  };

  const skip = () => { completeOnboarding(); router.push('/home'); };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto pt-12 pb-24 px-6 items-center text-center">
      
      {/* Sleek Centered Progress */}
      <div className="w-full max-w-md flex gap-2 mb-16 opacity-80">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-in-out ${step > i ? 'bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-surface'}`} />
        ))}
      </div>

      {/* Step 1: Archetype */}
      {step === 1 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 1 of {TOTAL}</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-bone font-editorial mb-6">Welcome, {currentUser.displayName}.</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl leading-relaxed">Pick your taste archetype. This signals to your crew exactly what to expect from your recommendations.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mb-16">
            {TASTE_ARCHETYPES.map(type => (
              <button key={type} onClick={() => setArchetype(type)}
                className={`p-8 rounded-2xl border text-center transition-all duration-300 ease-out active:scale-95 ${
                  archetype === type 
                    ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_30px_rgba(229,9,20,0.15)] ring-1 ring-cinema-red/30' 
                    : 'bg-surface/50 backdrop-blur-md border-border text-muted hover:text-bone hover:border-border-strong hover:bg-surface'
                }`}>
                <span className="block font-bold text-xl mb-1">{type}</span>
              </button>
            ))}
          </div>

          <button onClick={next} disabled={!archetype} 
            className="w-full max-w-sm py-4 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-lg">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Genres */}
      {step === 2 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 2 of {TOTAL}</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-bone font-editorial mb-6">What do you watch?</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl leading-relaxed">Select the genres you gravitate towards the most.</p>
          
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl mb-16">
            {GENRES.map(g => <Chip key={g} label={g} selected={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)} />)}
          </div>
          
          <div className="w-full max-w-sm flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-4 bg-surface text-bone font-bold rounded-xl hover:bg-surface-hover transition-colors text-lg">Back</button>
            <button onClick={next} className="flex-1 py-4 bg-cinema-red text-bone font-bold rounded-xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-lg">Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Moods + Formats + Languages */}
      {step === 3 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 3 of {TOTAL}</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-bone font-editorial mb-6">Define your vibe.</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl leading-relaxed">How and what do you usually like to watch?</p>
          
          <div className="w-full max-w-4xl space-y-12 mb-16">
            {[
              { title: 'Moods', opts: MOODS, arr: moods, set: setMoods },
              { title: 'Formats', opts: FORMATS, arr: formats, set: setFormats },
              { title: 'Regions', opts: LANGUAGES, arr: languages, set: setLanguages },
            ].map(({ title, opts, arr, set }) => (
              <div key={title} className="flex flex-col items-center">
                <p className="text-sm font-bold text-bone/50 uppercase tracking-widest mb-5">{title}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {opts.map(o => <Chip key={o} label={o} selected={arr.includes(o)} onClick={() => toggle(arr, set, o)} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-sm flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-4 bg-surface text-bone font-bold rounded-xl hover:bg-surface-hover transition-colors text-lg">Back</button>
            <button onClick={next} className="flex-1 py-4 bg-cinema-red text-bone font-bold rounded-xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-lg">Continue</button>
          </div>
        </div>
      )}

      {/* Step 4: Platforms */}
      {step === 4 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <p className="text-sm text-cinema-red uppercase tracking-widest font-bold mb-4">Step 4 of {TOTAL}</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-bone font-editorial mb-6">Where do you watch?</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl leading-relaxed">Select your primary streaming platforms.</p>
          
          <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl mb-16">
            {PLATFORMS.map(p => <Chip key={p} label={p} selected={platforms.includes(p)} onClick={() => toggle(platforms, setPlatforms, p)} />)}
          </div>

          <div className="w-full max-w-sm flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-4 bg-surface text-bone font-bold rounded-xl hover:bg-surface-hover transition-colors text-lg">Back</button>
            <button onClick={next} className="flex-1 py-4 bg-cinema-red text-bone font-bold rounded-xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-lg">Continue</button>
          </div>
        </div>
      )}

      {/* Step 5: Invite */}
      {step === 5 && (
        <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 ease-out pt-10">
          <div className="w-24 h-24 rounded-full bg-cinema-red/10 border border-cinema-red/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(229,9,20,0.2)]">
            <span className="text-4xl">🍿</span>
          </div>
          <h1 className="text-6xl font-bold text-bone font-editorial mb-6">Bring your crew in.</h1>
          <p className="text-xl text-muted mb-12 max-w-2xl leading-relaxed">Rec&apos;d gets infinitely better when your friends start recommending things too.</p>
          
          <div className="w-full max-w-md space-y-4 mb-8">
            <button onClick={() => setInviteOpen(true)}
              className="w-full py-5 bg-cinema-red text-bone font-bold rounded-xl transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-lg">
              Invite Friends
            </button>
            <button onClick={next}
              className="w-full py-5 bg-surface border border-border text-bone font-bold rounded-xl hover:bg-surface-hover active:scale-[0.98] transition-all text-lg">
              Enter Rec&apos;d →
            </button>
          </div>
          <button onClick={skip} className="text-muted text-sm font-medium hover:text-bone hover:underline underline-offset-4 transition-all">
            Skip for now
          </button>
          <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
        </div>
      )}
    </div>
  );
}
