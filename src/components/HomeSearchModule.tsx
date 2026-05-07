'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import type { Title } from '@/lib/types';

export default function HomeSearchModule() {
  const { titles, recommendations, getUser } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search logic — mock fuzzy match against titles
  const results: Title[] = query.trim().length >= 2
    ? titles.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  // Crew context helper
  const getCrewContext = (titleId: string): string | null => {
    const recs = recommendations.filter(r => r.titleId === titleId);
    if (recs.length === 0) return null;
    const first = getUser(recs[0].recommendedBy);
    if (recs.length === 1 && first) return `Stamped by ${first.displayName}`;
    return `${recs.length} people from your crew saved this`;
  };

  const showDropdown = focused && query.trim().length >= 1;

  return (
    <section ref={wrapperRef} className="relative">
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cinema-red/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-base sm:text-lg font-bold text-bone mb-1">Know what you want to recommend?</h2>
          <p className="text-sm text-muted mb-4">Search a movie or show and pass it to your crew.</p>
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search movies, shows, hidden gems…"
              style={{ paddingLeft: '48px', paddingRight: '48px' }}
              className="w-full py-3.5 bg-ink border border-border rounded-xl text-bone text-sm placeholder:text-muted/60 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all relative"
            />
            {query.length > 0 && (
              <button
                onClick={() => { setQuery(''); setFocused(false); }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-bone transition-colors z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted italic">Search for something worth passing on.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <span className="text-2xl block mb-2">🤷</span>
              <p className="text-sm text-muted">Couldn&apos;t find that one. Try another title?</p>
            </div>
          ) : (
            <div>
              <div className="divide-y divide-border/50">
                {results.map(title => {
                  const crewContext = getCrewContext(title.id);
                  return (
                    <Link
                      key={title.id}
                      href={`/title/${title.id}`}
                      onClick={() => { setFocused(false); setQuery(''); }}
                      className="flex items-center gap-4 p-4 hover:bg-ink/50 transition-colors group"
                    >
                      {/* Poster Thumbnail */}
                      <div className={`w-12 h-[72px] rounded-lg overflow-hidden shrink-0 border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                        {title.posterUrl && (
                          <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{title.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                          <span>{title.releaseYear}</span>
                          <span>·</span>
                          <span>{title.format || 'Movie'}</span>
                          <span>·</span>
                          <span>{title.genres.slice(0, 2).join(', ')}</span>
                          {title.runtime && (
                            <>
                              <span>·</span>
                              <span>{title.runtime}</span>
                            </>
                          )}
                        </div>
                        {title.externalRating && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold bg-[#f5c518] text-black px-1.5 py-0.5 rounded">IMDb</span>
                            <span className="text-xs font-bold text-bone/80">{title.externalRating}</span>
                          </div>
                        )}
                        {crewContext && (
                          <p className="text-[11px] text-cinema-red/80 font-medium mt-1 truncate">{crewContext}</p>
                        )}
                      </div>

                      {/* CTA */}
                      <span className="shrink-0 text-xs font-semibold text-cinema-red opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </Link>
                  );
                })}
              </div>
              {titles.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).length > 6 && (
                <Link
                  href={`/discover?q=${encodeURIComponent(query)}`}
                  onClick={() => { setFocused(false); setQuery(''); }}
                  className="block text-center py-3 border-t border-border text-xs font-semibold text-cinema-red hover:bg-ink/30 transition-colors"
                >
                  View all results →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
