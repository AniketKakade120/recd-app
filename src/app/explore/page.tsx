'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import MovieCard from '@/components/MovieCard';
import { ALL_GENRES } from '@/lib/mock-data';
import { MOODS, Title, PLATFORMS, FORMATS } from '@/lib/types';

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all btn-press shrink-0 ${
        active ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-surface border-border text-muted hover:text-bone hover:border-border-strong'
      }`}>
      {label}
    </button>
  );
}

export default function ExplorePage() {
  const { titles, recommendations, currentUser, getGroupRecommendations, getGroupMembers } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState('');
  
  // Filters
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [activeMoods, setActiveMoods] = useState<string[]>([]);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const clearFilters = () => {
    setActiveGenres([]);
    setActiveMoods([]);
    setActivePlatforms([]);
  };

  const isFiltering = search || activeGenres.length > 0 || activeMoods.length > 0 || activePlatforms.length > 0;

  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [trendingTmdb, setTrendingTmdb] = useState<Title[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch Trending from TMDB on mount
  useEffect(() => {
    fetch('/api/tmdb/trending')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTrendingTmdb(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Debounced Search from TMDB
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/tmdb/search?q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSearchResults(data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error(err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Search & Filter Logic
  const filteredTitles = useMemo(() => {
    if (!isFiltering) return [];
    
    // If we have TMDB search results, apply local filters to them
    const sourceTitles = searchResults.length > 0 ? searchResults : titles;
    
    return sourceTitles.filter((t: Title) => {
      const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = activeGenres.length === 0 || t.genres.some((g: string) => activeGenres.includes(g));
      const matchesPlatform = activePlatforms.length === 0 || t.platforms?.some((p: string) => activePlatforms.includes(p));
      const matchesMood = activeMoods.length === 0 || recommendations.some(r => r.titleId === t.id && r.moodTags?.some((m: string) => activeMoods.includes(m)));
      
      return matchesSearch && matchesGenre && matchesPlatform && matchesMood;
    });
  }, [titles, searchResults, search, activeGenres, activeMoods, activePlatforms, recommendations, isFiltering]);

  // --- Shelves Data Generation ---
  
  // 1. Trending Now (Live TMDB or fallback)
  const trendingTitles = trendingTmdb.length > 0 ? trendingTmdb.slice(0, 10) : [...titles].sort((a, b) => (b.externalRating || 0) - (a.externalRating || 0)).slice(0, 6);

  // 2. Platform Shelves
  const platformShelves = [
    { title: 'Popular on Netflix', filter: (t: Title) => t.platforms?.includes('Netflix') },
    { title: 'Prime Video Picks', filter: (t: Title) => t.platforms?.includes('Prime Video') },
    { title: 'MUBI Mood', filter: (t: Title) => t.platforms?.includes('MUBI') },
    { title: 'Apple TV Essentials', filter: (t: Title) => t.platforms?.includes('Apple TV') },
  ].map(shelf => ({
    title: shelf.title,
    titles: titles.filter(shelf.filter as (t: Title) => boolean).slice(0, 5)
  })).filter(s => s.titles.length > 0);

  // 3. Genre & Mood Shelves
  const getTitlesByMood = (mood: string) => {
    const titleIds = recommendations.filter(r => r.moodTags?.includes(mood as any)).map(r => r.titleId);
    return titles.filter(t => titleIds.includes(t.id)).slice(0, 5);
  };

  const getTitlesByStamp = (stamp: string) => {
    const titleIds = recommendations.filter(r => r.primaryStamp === stamp).map(r => r.titleId);
    return titles.filter(t => titleIds.includes(t.id)).slice(0, 5);
  };

  const moodShelves = [
    { title: 'Slow Burns', titles: getTitlesByMood('Slow burn') },
    { title: 'Comfort Watches', titles: getTitlesByMood('Comfort watch') },
    { title: 'Mind-Bending Picks', titles: getTitlesByMood('Mind-bending') },
    { title: 'Emotional Dramas', titles: getTitlesByMood('Emotional') },
    { title: 'Risky But Worth It', titles: getTitlesByStamp('Risky But Worth It') },
    { title: 'Cult Picks', titles: getTitlesByMood('Cult pick') },
  ].filter(s => s.titles.length > 0);

  // 4. Crew-powered discovery
  const getCrewPicks = () => {
    // Mock logic: return titles recommended to groups the user is in
    const titleIds = recommendations.filter(r => r.groupId).map(r => r.titleId);
    // Deduplicate
    const uniqueIds = Array.from(new Set(titleIds));
    return titles.filter(t => uniqueIds.includes(t.id)).slice(0, 5);
  };

  const getTrustedPicks = () => {
    // Mock logic: return 'Certified Good Call' or 'Crew Pick'
    const titleIds = recommendations.filter(r => r.primaryStamp === 'Certified Good Call' || r.primaryStamp === 'Crew Pick').map(r => r.titleId);
    return titles.filter(t => Array.from(new Set(titleIds)).includes(t.id)).slice(0, 5);
  };

  const crewShelves = [
    { title: 'From Your Crew', titles: getCrewPicks() },
    { title: 'Stamped by People You Trust', titles: getTrustedPicks() },
  ].filter(s => s.titles.length > 0);


  return (
    <div className="space-y-10">
      
      {/* ── 1. SEARCH-FIRST HERO ─────────────────────────────────────────── */}
      <section className="text-center pt-4 pb-6 border-b border-border">
        <h1 className="text-3xl md:text-4xl font-bold text-bone font-editorial tracking-tight mb-2">Find something worth passing on.</h1>
        <p className="text-sm text-muted max-w-md mx-auto mb-8">Search movies and shows, then recommend them straight from the detail page.</p>

        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-surface border border-border rounded-2xl px-5 py-4 gap-3 focus-within:border-cinema-red/50 focus-within:ring-1 focus-within:ring-cinema-red/30 transition-all shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cinema-red shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search movies, shows, hidden gems…"
              className="flex-1 bg-transparent border-none p-0 text-base text-bone placeholder:text-muted/50 outline-none"
            />
            {search && <button onClick={() => setSearch('')} className="text-muted hover:text-bone text-sm">✕</button>}
          </div>

          {/* Quick Filters below search */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button onClick={() => setFilterDrawerOpen(!filterDrawerOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-ink text-muted hover:text-bone transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
              Filters {(activeGenres.length + activeMoods.length + activePlatforms.length) > 0 && `(${activeGenres.length + activeMoods.length + activePlatforms.length})`}
            </button>
            {['Drama', 'Thriller', 'Comedy'].map(g => (
              <FilterChip key={g} label={g} active={activeGenres.includes(g)} onClick={() => toggleFilter(activeGenres, setActiveGenres, g)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE FILTERS DRAWER (Inline for mock) ──────────────────────── */}
      {filterDrawerOpen && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-8 page-enter">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-bone">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-xs text-cinema-red hover:text-cinema-red/80 font-medium">Clear all</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => <FilterChip key={p} label={p} active={activePlatforms.includes(p)} onClick={() => toggleFilter(activePlatforms, setActivePlatforms, p)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.slice(0, 10).map(g => <FilterChip key={g} label={g} active={activeGenres.includes(g)} onClick={() => toggleFilter(activeGenres, setActiveGenres, g)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Moods</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => <FilterChip key={m} label={m} active={activeMoods.includes(m)} onClick={() => toggleFilter(activeMoods, setActiveMoods, m)} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH RESULTS ────────────────────────────────────────────────── */}
      {isFiltering ? (
        <section className="page-enter">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-bold text-bone">Search Results ({filteredTitles.length})</h2>
            {isSearching && <span className="w-4 h-4 border-2 border-cinema-red border-t-transparent rounded-full animate-spin"></span>}
          </div>
          {filteredTitles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredTitles.map(t => {
                const rec = recommendations.find(r => r.titleId === t.id);
                return <MovieCard key={t.id} title={t} stamp={rec?.primaryStamp} showRecommendAction />;
              })}
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3 className="font-bold text-bone mb-1">No titles found</h3>
              <p className="text-sm text-muted mb-4">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="px-4 py-2 bg-surface text-bone rounded-lg text-sm btn-press hover:bg-surface-hover">Clear Filters</button>
            </div>
          )}
        </section>
      ) : (
        /* ── DEFAULT EXPLORE SHELVES ────────────────────────────────────── */
        <div className="space-y-12 pb-10">
          
          {/* Trending */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-bone font-editorial">Trending Now</h2>
              <button className="text-xs text-cinema-red hover:text-cinema-red/80 font-medium transition-colors">View top 50 →</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {trendingTitles.map(t => {
                const rec = recommendations.find(r => r.titleId === t.id);
                return (
                  <div key={t.id} className="w-[240px] shrink-0 snap-start">
                    <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Crew Powered */}
          <div className="py-8 px-6 -mx-6 sm:px-8 sm:-mx-8 rounded-3xl bg-cinema-red/5 border border-cinema-red/10 my-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-cinema-red animate-pulse" />
              <h2 className="text-lg font-bold text-bone font-editorial">Crew-Powered Discovery</h2>
            </div>
            
            {crewShelves.length > 0 ? (
              <div className="space-y-8">
                {crewShelves.map(shelf => (
                  <div key={shelf.title}>
                    <h3 className="text-sm font-semibold text-bone/90 mb-3">{shelf.title}</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
                      {shelf.titles.map(t => {
                        const rec = recommendations.find(r => r.titleId === t.id);
                        return (
                          <div key={t.id} className="w-[240px] shrink-0 snap-start">
                            <MovieCard title={t} stamp={rec?.primaryStamp || 'Crew Pick'} showRecommendAction />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-2xl mb-3 opacity-30">✦</p>
                <h3 className="font-bold text-bone mb-1">Your Explore gets sharper with your people.</h3>
                <p className="text-sm text-muted mb-4">Invite friends to start getting crew-powered recommendations.</p>
                <button className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold btn-press hover:bg-cinema-red/90">
                  Invite friends
                </button>
              </div>
            )}
          </div>

          {/* Platform Shelves */}
          {platformShelves.map(shelf => (
            <section key={shelf.title}>
              <h2 className="text-base font-bold text-bone mb-4">{shelf.title}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {shelf.titles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[240px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Mood Shelves */}
          {moodShelves.map(shelf => (
            <section key={shelf.title}>
              <h2 className="text-base font-bold text-bone mb-4">{shelf.title}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {shelf.titles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[240px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

        </div>
      )}
    </div>
  );
}
