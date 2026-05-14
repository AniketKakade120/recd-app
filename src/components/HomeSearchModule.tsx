'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import type { Title } from '@/lib/types';

export default function HomeSearchModule() {
  const { recommendations, getUser, users, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [tmdbResults, setTmdbResults] = useState<Title[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Live TMDB search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.trim().length < 2) {
      setTmdbResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}&region=IN`);
        if (res.ok) {
          const data = await res.json();
          setTmdbResults(data.slice(0, 6));
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // People search (from local users)
  const peopleResults = query.trim().length >= 2
    ? users.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.displayName.toLowerCase().includes(query.toLowerCase())
      ).filter(u => u.id !== currentUser?.id).slice(0, 3)
    : [];

  const hasResults = tmdbResults.length > 0 || peopleResults.length > 0;

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
          <p className="text-sm text-muted mb-4">Search movies, shows, or people you trust.</p>
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted z-10">
              {searching ? (
                <div className="w-5 h-5 border-2 border-muted/40 border-t-cinema-red rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search titles or people..."
              className="w-full py-3.5 !pl-14 !pr-12 bg-ink border border-border rounded-xl text-bone text-sm placeholder:text-muted/60 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all relative"
            />
            {query.length > 0 && (
              <button
                onClick={() => { setQuery(''); setFocused(false); setTmdbResults([]); }}
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
          ) : searching ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-muted/30 border-t-cinema-red rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted">Searching...</p>
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center">
              <span className="text-2xl block mb-2">🤷</span>
              <p className="text-sm text-muted">Couldn&apos;t find that one. Try another search?</p>
            </div>
          ) : (
            <div>
              <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                {/* Titles Section (from TMDB) */}
                {tmdbResults.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-widest">Movies & Shows</p>
                    {tmdbResults.map(title => {
                      const crewContext = getCrewContext(title.id);
                      return (
                        <Link
                          key={title.id}
                          href={`/title/${title.id}?type=${title.type}`}
                          onClick={() => { setFocused(false); setQuery(''); }}
                          className="flex items-center gap-4 p-3 hover:bg-ink/50 transition-colors group rounded-xl"
                        >
                          <div className={`w-10 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                            {title.posterUrl && (
                              <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{title.title}</h4>
                            <p className="text-[10px] text-muted mt-0.5">{title.releaseYear} · {title.format}</p>
                            {crewContext && <p className="text-[10px] text-cinema-red mt-1 font-medium">{crewContext}</p>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* People Section */}
                {peopleResults.length > 0 && (
                  <div className="p-2 bg-ink/20">
                    <p className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-widest">People</p>
                    {peopleResults.map(user => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.username}`}
                        onClick={() => { setFocused(false); setQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-ink/50 transition-colors group rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface border border-border shrink-0 overflow-hidden">
                          {user.avatarUrl && <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{user.displayName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-muted truncate">@{user.username}</p>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <p className="text-[10px] text-cinema-red font-bold">{user.tasteScore || 0} Taste</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Profile →</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/discover?q=${encodeURIComponent(query)}`}
                onClick={() => { setFocused(false); setQuery(''); }}
                className="block text-center py-3 border-t border-border text-xs font-semibold text-cinema-red hover:bg-ink/30 transition-colors"
              >
                View all results →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
