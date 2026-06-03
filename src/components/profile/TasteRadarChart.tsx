'use client';

import React from 'react';
import { Brain, Flame, Heart, Zap, Play, Laugh, Coffee, Ghost, Search, Sword, Film, Video, Rocket, Cat, Drama } from 'lucide-react';

interface TasteRadarChartProps {
  genrePreferences: Record<string, number>;
  width?: number;
  height?: number;
  className?: string;
  hideLabels?: boolean;
}

export function TasteRadarChart({ 
  genrePreferences, 
  width = 800, 
  height = 780,
  className = "",
  hideLabels = false
}: TasteRadarChartProps) {
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
    <svg width={width} height={height} viewBox="0 0 800 780" className={`overflow-visible ${className}`}>
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
          
          return (
            <g key={`label-${i}`}>
              <circle cx={pt.x} cy={pt.y} r="6" fill="#fff" filter="url(#dot-glow)" />
              <circle cx={pt.x} cy={pt.y} r="3" fill="#E50914" />
              
              {!hideLabels && (
                <g transform={`translate(${labelPt.x}, ${labelPt.y})`}>
                  <g transform="translate(-16, -30)">
                    <GenreIcon genre={g} size={32} />
                  </g>
                  <text 
                    y="15" 
                    textAnchor="middle" 
                    fill="rgba(255,255,255,0.9)"
                    fontSize="14"
                    fontWeight="800"
                    letterSpacing="0.1em"
                    className="uppercase"
                  >
                    {g}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
