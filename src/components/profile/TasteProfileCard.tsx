'use client';

import React from 'react';
import { TasteRadarChart } from '@/components/profile/TasteRadarChart';
import { User, UserPreferences, GENRES } from '@/lib/types';
import { Edit2, Zap, Rocket, Cat, Drama, Laugh, Ghost, Heart, Video, Search, Sword, Film } from 'lucide-react';

interface TasteProfileCardProps {
  user: User;
  preferences: UserPreferences;
  onEdit?: () => void;
}

const GenreIcon = ({ genre, size=16 }: { genre: string, size?: number }) => {
  const p = { className: "text-muted", size, strokeWidth: 1.5 };
  switch(genre) {
    case 'Drama': return <Drama {...p} />;
    case 'Comedy': return <Laugh {...p} />;
    case 'Thriller': return <Zap {...p} />;
    case 'Horror': return <Ghost {...p} />;
    case 'Romance': return <Heart {...p} />;
    case 'Sci-fi': return <Rocket {...p} />;
    case 'Documentary': return <Video {...p} />;
    case 'Anime': return <Cat {...p} />;
    case 'Crime': return <Search {...p} />;
    case 'Fantasy': return <Sword {...p} />;
    default: return <Film {...p} />;
  }
};

export default function TasteProfileCard({ user, preferences, onEdit }: TasteProfileCardProps) {
  const archetypes = user.tasteArchetypes?.length ? user.tasteArchetypes : [user.tasteArchetype];
  const topGenres = [...GENRES]
    .sort((a,b) => (preferences.genrePreferences?.[b]||3) - (preferences.genrePreferences?.[a]||3))
    .slice(0,3);
  
  return (
    <div className="bg-[#050505] border border-border rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
      {/* Subtle Noise Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cinema-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pb-2 z-20 flex justify-between items-center relative">
        <h3 className="text-[10px] font-black text-bone uppercase tracking-[0.2em] flex items-center gap-2">
          TASTE PROFILE 
          <span className="text-muted font-editorial normal-case text-sm tracking-normal">Rec&apos;d Club</span>
        </h3>
        {onEdit && (
          <button 
            onClick={onEdit} 
            className="text-[10px] font-bold text-cinema-red uppercase tracking-widest hover:text-bone hover:border-bone px-3 py-1.5 rounded-full transition-all border border-cinema-red/30 flex items-center gap-1.5"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      {/* Headline */}
      <div className="px-6 py-6 text-center z-10">
        <h2 className="text-3xl font-editorial leading-[1.1] text-bone">
          {user.displayName.split(' ')[0]}, this is how you<br/>
          <span className="text-cinema-red italic drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">show up</span>&nbsp;on Rec&apos;d Club
        </h2>
      </div>

      <div className="px-4 pb-8 space-y-4 z-10">
        
        {/* Radar & Genres Container */}
        <div className="bg-[#0a0a0a] border border-cinema-red/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(229,9,20,0.05)]">
          <div className="w-full aspect-[800/780] relative -mt-4 mb-2">
             <div className="absolute inset-0">
                <TasteRadarChart 
                  genrePreferences={preferences.genrePreferences || {}} 
                  width={"100%" as any} 
                  height={"100%" as any} 
                />
             </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-2">
             <div className="h-px bg-gradient-to-r from-transparent via-cinema-red/30 to-transparent flex-1" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-red">Your Top Genres</span>
             <div className="h-px bg-gradient-to-r from-cinema-red/30 via-transparent to-transparent flex-1" />
          </div>
          
          <div className="flex justify-center flex-wrap gap-4 mt-4">
             {topGenres.map((g, i) => (
               <div key={g} className="flex items-center gap-1.5">
                  <span className="text-cinema-red font-editorial text-sm">0{i+1}</span>
                  <GenreIcon genre={g} size={12} />
                  <span className="text-xs font-bold text-bone">{g}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Traits */}
        <div className="bg-[#0a0a0a] border border-cinema-red/10 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(229,9,20,0.03)]">
           <h4 className="text-lg font-editorial text-bone mb-3 flex items-center justify-center gap-2">
              <span className="text-cinema-red text-xs">✦</span> Taste Traits
           </h4>
           <div className="flex flex-wrap justify-center gap-2">
              {archetypes.map(a => (
                <span key={a} className="px-3 py-1 bg-ink border border-border rounded-full text-[10px] font-medium text-bone/80">
                  {a}
                </span>
              ))}
           </div>
        </div>

        {/* Vibes */}
        <div className="bg-[#0a0a0a] border border-cinema-red/10 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(229,9,20,0.03)]">
           <h4 className="text-lg font-editorial text-bone mb-3 flex items-center justify-center gap-2">
              <span className="text-cinema-red text-xs">✦</span> Watch Vibes
           </h4>
           <div className="flex flex-wrap justify-center gap-2">
              {(preferences.moods?.length ? preferences.moods : ['Comfort Watch']).slice(0,3).map(m => (
                <span key={m} className="px-3 py-1 bg-ink border border-border rounded-full text-[10px] font-medium text-bone/80">
                  {m}
                </span>
              ))}
           </div>
        </div>

      </div>
      
      <div className="p-4 text-center border-t border-cinema-red/10 z-10">
         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-red flex items-center justify-center gap-2">
            ✦ SEND THE PICK. SEE HOW IT LANDS. ✦
         </span>
      </div>

    </div>
  );
}
