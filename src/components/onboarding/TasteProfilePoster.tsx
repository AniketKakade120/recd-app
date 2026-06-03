import React from 'react';
import { Brain, Flame, Heart, Zap, Play, Laugh, Coffee, Ghost, Search, Sword, Film, Video, Rocket, Cat, Drama } from 'lucide-react';
import { GENRES } from '@/lib/types';

interface TasteProfilePosterProps {
  displayName: string;
  archetypes: string[];
  genrePreferences: Record<string, number>;
  vibes: string[];
}

export const TasteProfilePoster = React.forwardRef<HTMLDivElement, TasteProfilePosterProps>(
  ({ displayName, archetypes, genrePreferences, vibes }, ref) => {
    // Top 3 genres
    const topGenres = [...GENRES].sort((a,b) => (genrePreferences[b]||3) - (genrePreferences[a]||3)).slice(0,3);

    // Radar Chart Points
    const maxRadius = 310;
    const centerX = 400;
    const centerY = 390;
    const numAxes = 10;
    
    const orderedGenres = ['Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Sci-fi', 'Anime', 'Documentary', 'Crime', 'Fantasy'];

    const getPoint = (value: number, index: number, radius: number = maxRadius) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
      const r = (value / 5) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    };

    const polygonPoints = orderedGenres.map((g, i) => {
      const val = genrePreferences[g] ?? 3;
      const pt = getPoint(val, i);
      return `${pt.x},${pt.y}`;
    }).join(' ');

    const TraitIcon = ({ type }: { type: string }) => {
      const p = { className: "text-cinema-red", size: 32, strokeWidth: 1.5 };
      if (type.includes('Emotional')) return <Heart {...p} />;
      if (type.includes('Burn')) return <Flame {...p} />;
      if (type.includes('Twist')) return <Brain {...p} />;
      if (type.includes('Comfort')) return <Coffee {...p} />;
      if (type.includes('Horror')) return <Ghost {...p} />;
      return <Zap {...p} />;
    };

    const VibeIcon = ({ vibe }: { vibe: string }) => {
      const p = { className: "text-cinema-red", size: 32, strokeWidth: 1.5, fill: "rgba(229,9,20,0.2)" };
      if (vibe.includes('Emotional')) return <Heart {...p} />;
      if (vibe.includes('Mind')) return <Brain {...p} />;
      if (vibe.includes('Slow')) return <Flame {...p} />;
      if (vibe.includes('Comfort')) return <Coffee {...p} />;
      if (vibe.includes('Feel-good')) return <Laugh {...p} />;
      if (vibe.includes('Intense')) return <Zap {...p} />;
      return <Play {...p} />;
    };

    const GenreIcon = ({ genre, size=24 }: { genre: string, size?: number }) => {
      const p = { className: "text-bone/70", size, strokeWidth: 1.5 };
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

    return (
      <div 
        ref={ref}
        className="w-[1080px] h-[1920px] bg-[#050505] relative overflow-hidden flex flex-col p-[80px] text-bone font-sans isolate"
      >
        {/* Subtle noise and cinematic background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-cinema-red/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-cinema-red/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4" />
          <div 
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay" 
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
          />
        </div>

        {/* Header */}
        <div className="z-10 w-full flex justify-center items-center mb-10 relative">
          <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-bone/30 to-transparent"></div>
          <span className="absolute left-[20%] text-cinema-red text-2xl drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</span>
          <h2 className="text-5xl font-editorial tracking-[0.05em] text-bone px-8 bg-[#050505] relative z-10">Rec&apos;d Club</h2>
          <span className="absolute right-[20%] text-cinema-red text-2xl drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</span>
        </div>

        {/* Main Title */}
        <div className="z-10 w-full mb-12 text-center">
          <h1 className="text-[80px] font-editorial leading-[1.1] text-bone whitespace-nowrap">
            {displayName.split(' ')[0]}, this is how you<br/>
            <span className="text-cinema-red italic drop-shadow-[0_0_30px_rgba(229,9,20,0.5)]">show up</span> on Rec&apos;d Club
          </h1>
        </div>

        {/* Radar Chart Glass Panel */}
        <div className="z-10 w-full flex-1 bg-[#0a0a0a] border border-cinema-red/20 rounded-[40px] p-10 mb-8 relative shadow-[0_0_100px_rgba(229,9,20,0.1)] flex flex-col items-center">
          


          <svg width="800" height="780" viewBox="0 0 800 780" className="overflow-visible mt-6 flex-1">
            <defs>
              <filter id="heavy-red-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="30" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="light-red-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <radialGradient id="polygon-fill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E50914" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E50914" stopOpacity="0.1" />
              </radialGradient>
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" in="noise" result="coloredNoise" />
                <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" />
              </filter>
            </defs>

            <g>
              {/* Concentric webs */}
              {[1, 2, 3, 4, 5, 6, 7].map((level, _, arr) => (
                <polygon
                  key={level}
                  points={orderedGenres.map((__, i) => {
                    const pt = getPoint(5, i, (level / arr.length) * maxRadius);
                    return `${pt.x},${pt.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
              ))}

              {/* Axes */}
              {orderedGenres.map((_, i) => {
                const pt = getPoint(5, i, maxRadius);
                return (
                  <line key={i} x1={centerX} y1={centerY} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                );
              })}

              {/* Data Polygon Base Glow */}
              <polygon
                points={polygonPoints}
                fill="#E50914"
                opacity="0.15"
                filter="url(#heavy-red-glow)"
              />

              {/* Data Polygon Fill */}
              <g filter="url(#light-red-glow)">
                <polygon
                  points={polygonPoints}
                  fill="url(#polygon-fill)"
                  stroke="#ff2a2a"
                  strokeWidth="2"
                />
                <polygon
                  points={polygonPoints}
                  fill="none"
                  style={{ mixBlendMode: 'overlay' }}
                  filter="url(#noise)"
                />
              </g>

              {/* Central axes highlight inside the polygon */}
              {orderedGenres.map((g, i) => {
                const val = genrePreferences[g] ?? 3;
                const pt = getPoint(val, i);
                return (
                  <line key={`spoke-${i}`} x1={centerX} y1={centerY} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                );
              })}

              {/* Points and Labels */}
              {orderedGenres.map((g, i) => {
                const val = genrePreferences[g] ?? 3;
                const pt = getPoint(val, i);
                const labelPt = getPoint(5, i, maxRadius + 45);
                
                // Anchor text consistently centered
                const anchor = "middle";
                const textY = 24;
                const iconY = -26;

                return (
                  <g key={g}>
                    {/* Glowing point on data polygon */}
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#ff3333" filter="url(#dot-glow)" />
                    <circle cx={pt.x} cy={pt.y} r="3" fill="#ff6666" />
                    
                    <g transform={`translate(${labelPt.x}, ${labelPt.y})`}>
                      <text textAnchor={anchor} fill="rgba(255,255,255,0.6)" fontSize="12" letterSpacing="0.05em" className="font-sans font-medium uppercase" dy={textY}>
                        {g}
                      </text>
                      <foreignObject x="-12" y={iconY} width="24" height="24">
                        <div className="flex items-center justify-center w-full h-full text-bone/50 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                          <GenreIcon genre={g} size={24} />
                        </div>
                      </foreignObject>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Top Genres Footer */}
          <div className="w-full mt-auto pt-6 border-t border-cinema-red/20 relative">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-[1px] w-24 bg-gradient-to-l from-cinema-red to-transparent"></div>
              <span className="text-cinema-red uppercase tracking-[0.25em] font-bold text-[13px] drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">Your Top Genres</span>
              <div className="h-[1px] w-24 bg-gradient-to-r from-cinema-red to-transparent"></div>
            </div>
            
            <div className="flex justify-center items-center gap-10">
              {topGenres.map((g, idx) => (
                <React.Fragment key={g}>
                  {idx > 0 && <div className="w-[1px] h-12 bg-white/10 mx-2" />}
                  <div className="flex items-center gap-4">
                    <span className="text-cinema-red font-editorial text-4xl opacity-90 font-bold leading-none translate-y-[2px] lining-nums">0{idx + 1}</span>
                    <div className="flex items-center justify-center text-bone/70">
                      <GenreIcon genre={g} size={28} />
                    </div>
                    <span className="text-bone text-2xl font-bold tracking-wide leading-none">{g}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="z-10 flex flex-col gap-6 w-full">
          {/* Taste Traits */}
          <div className="bg-[#0a0a0a] border border-cinema-red/30 rounded-[32px] p-8 flex flex-col shadow-[0_0_40px_rgba(229,9,20,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-center gap-4 mb-6">
               <div className="text-cinema-red text-3xl drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</div>
               <h3 className="text-5xl font-editorial text-bone whitespace-nowrap">Taste Traits</h3>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 px-4">
              {archetypes.slice(0, 6).map((a, i) => (
                <div key={i} className="px-6 py-2.5 rounded-full border border-cinema-red/40 bg-[#050505]/60 text-bone/80 text-[18px] font-normal tracking-wide shadow-[0_0_10px_rgba(229,9,20,0.1)]">
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* Watch Vibes */}
          <div className="bg-[#0a0a0a] border border-cinema-red/30 rounded-[32px] p-8 flex flex-col shadow-[0_0_40px_rgba(229,9,20,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-center gap-4 mb-6">
               <div className="text-cinema-red text-3xl drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</div>
               <h3 className="text-5xl font-editorial text-bone whitespace-nowrap">Watch Vibes</h3>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 px-4">
              {vibes.slice(0, 8).map((v, i) => (
                <div key={i} className="px-6 py-2.5 rounded-full border border-cinema-red/40 bg-[#050505]/60 text-bone/80 text-[18px] font-normal tracking-wide shadow-[0_0_10px_rgba(229,9,20,0.1)]">
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 w-full flex justify-center items-center mt-8">
          <span className="text-cinema-red text-2xl mr-4 drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</span>
          <p className="text-[17px] font-bold tracking-[0.4em] text-bone/70 uppercase">
            Send the pick. <span className="text-cinema-red drop-shadow-[0_0_5px_rgba(229,9,20,0.5)]">See how it lands.</span>
          </p>
          <span className="text-cinema-red text-2xl ml-4 drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">✦</span>
        </div>
      </div>
    );
  }
);
TasteProfilePoster.displayName = 'TasteProfilePoster';
