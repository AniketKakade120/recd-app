'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import MovieCard from '@/components/MovieCard';
import { ALL_GENRES } from '@/lib/mock-data';
import { MOODS, Title, PLATFORMS, FORMATS, LANGUAGES } from '@/lib/types';

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

const LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Malayalam': 'ml',
  'Kannada': 'kn',
  'Bengali': 'bn',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Punjabi': 'pa',
  'Korean': 'ko',
  'Japanese': 'ja',
};

export default function ExplorePage() {
  const { titles, recommendations, currentUser, userPreferences } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState('');
  
  // Filters
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [activeMoods, setActiveMoods] = useState<string[]>([]);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const clearFilters = () => {
    setActiveGenres([]);
    setActiveMoods([]);
    setActivePlatforms([]);
    setActiveLanguages([]);
  };

  const isFiltering = search || activeGenres.length > 0 || activeMoods.length > 0 || activePlatforms.length > 0 || activeLanguages.length > 0;

  const [searchResults, setSearchResults] = useState<Title[]>([]);
  const [trendingTmdb, setTrendingTmdb] = useState<Title[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Discovery Shelves Data
  const [curatedGenreTitles, setCuratedGenreTitles] = useState<Title[]>([]);
  const [curatedPlatformTitles, setCuratedPlatformTitles] = useState<Title[]>([]);
  const [curatedLanguageTitles, setCuratedLanguageTitles] = useState<Title[]>([]);
  const [theatricalTitles, setTheatricalTitles] = useState<Title[]>([]);
  const [upcomingTitles, setUpcomingTitles] = useState<Title[]>([]);
  const [bollywoodTitles, setBollywoodTitles] = useState<Title[]>([]);
  const [regionalTitles, setRegionalTitles] = useState<Title[]>([]);
  const [topGenre, setTopGenre] = useState<string>('');
  const [topPlatform, setTopPlatform] = useState<string>('');
  const [topLanguage, setTopLanguage] = useState<string>('');

  // Fetch Trending and Discovery Shelves on mount
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/tmdb/trending?region=IN');
        if (res.ok) {
          const data = await res.json();
          setTrendingTmdb(data.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchCurated() {
      // 1. Fetch based on top genre
      const genre = userPreferences?.genres?.[0] || currentUser?.favoriteGenres?.[0] || 'Drama';
      if (genre) {
        setTopGenre(genre);
        try {
          const res = await fetch(`/api/tmdb/discover?genre=${encodeURIComponent(genre)}`);
          if (res.ok) setCuratedGenreTitles((await res.json()).slice(0, 10));
        } catch (e) { console.error(e); }
      }

      // 2. Fetch based on top platform
      const platform = userPreferences?.platforms?.[0] || 'Netflix';
      if (platform) {
        setTopPlatform(platform);
        try {
          const res = await fetch(`/api/tmdb/discover?platform=${encodeURIComponent(platform)}`);
          if (res.ok) setCuratedPlatformTitles((await res.json()).slice(0, 10));
        } catch (e) { console.error(e); }
      }

      // 3. Fetch based on top language
      const language = userPreferences?.languages?.[0] || 'English';
      if (language) {
        setTopLanguage(language);
        try {
          const res = await fetch(`/api/tmdb/discover?language=${encodeURIComponent(language)}`);
          if (res.ok) setCuratedLanguageTitles((await res.json()).slice(0, 10));
        } catch (e) { console.error(e); }
      }

      // 4. Fetch Theatrical releases
      try {
        const res = await fetch(`/api/tmdb/discover?platform=Theatre&origin_country=IN&original_language=hi|ta|te|ml|kn|bn|mr|pa|gu`);
        if (res.ok) setTheatricalTitles((await res.json()).slice(0, 10));
      } catch (e) { console.error(e); }

      // 5. Fetch Upcoming releases
      try {
        const res = await fetch(`/api/tmdb/discover?upcoming=true&origin_country=IN&original_language=hi|ta|te|ml|kn|bn|mr|pa|gu`);
        if (res.ok) setUpcomingTitles((await res.json()).slice(0, 10));
      } catch (e) { console.error(e); }

      // 6. Bollywood Hits
      try {
        const res = await fetch(`/api/tmdb/discover?origin_country=IN&original_language=hi`);
        if (res.ok) setBollywoodTitles((await res.json()).slice(0, 10));
      } catch (e) { console.error(e); }

      // 7. Regional Cinema (South & others)
      try {
        const res = await fetch(`/api/tmdb/discover?origin_country=IN&original_language=ta|te|ml|kn`);
        if (res.ok) setRegionalTitles((await res.json()).slice(0, 10));
      } catch (e) { console.error(e); }
    }

    fetchTrending();
    fetchCurated();
  }, [userPreferences, currentUser]);

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

  // Real-time Discover based on Filters
  const [discoverResults, setDiscoverResults] = useState<Title[]>([]);
  useEffect(() => {
    if (!isFiltering || search) {
      setDiscoverResults([]);
      return;
    }

    const genre = activeGenres[0]; // TMDB API takes single genre/platform in my current simple discover route
    const platform = activePlatforms[0];
    const language = activeLanguages[0];

    if (!genre && !platform && !language) {
      setDiscoverResults([]);
      return;
    }

    setIsSearching(true);
    let url = `/api/tmdb/discover?`;
    if (genre) url += `genre=${encodeURIComponent(genre)}&`;
    if (platform) url += `platform=${encodeURIComponent(platform)}&`;
    if (language) url += `language=${encodeURIComponent(language)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDiscoverResults(data);
        setIsSearching(false);
      })
      .catch(err => {
        console.error(err);
        setIsSearching(false);
      });
  }, [activeGenres, activePlatforms, activeLanguages, isFiltering, search]);

  // Search & Filter Logic
  const filteredTitles = useMemo(() => {
    if (!isFiltering) return [];
    
    // Priority: 1. Search Results (if searching) 2. Discover Results (if filtering) 3. Local titles
    let sourceTitles = titles;
    if (search) {
      sourceTitles = searchResults;
    } else if (discoverResults.length > 0) {
      sourceTitles = discoverResults;
    }
    
    return sourceTitles.filter((t: Title) => {
      const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = activeGenres.length === 0 || t.genres.some((g: string) => activeGenres.includes(g));
      const matchesPlatform = activePlatforms.length === 0 || t.platforms?.some((p: string) => activePlatforms.includes(p));
      const targetLangCode = activeLanguages.length > 0 ? LANGUAGE_NAME_TO_CODE[activeLanguages[0]] : null;
      const matchesLanguage = !targetLangCode || t.language === targetLangCode;
      const matchesMood = activeMoods.length === 0 || recommendations.some(r => r.titleId === t.id && r.moodTags?.some((m: string) => activeMoods.includes(m)));
      
      return matchesSearch && matchesGenre && matchesPlatform && matchesMood && matchesLanguage;
    });
  }, [titles, searchResults, discoverResults, search, activeGenres, activeMoods, activePlatforms, activeLanguages, recommendations, isFiltering]);

  // --- Static Shelves Data Generation (Fallbacks) ---
  const trendingTitles = trendingTmdb.length > 0 ? trendingTmdb : [...titles].sort((a, b) => (b.externalRating || 0) - (a.externalRating || 0)).slice(0, 10);

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
    { title: 'Cult Picks', titles: getTitlesByMood('Cult pick') },
  ].filter(s => s.titles.length > 0);

  const getCrewPicks = () => {
    const titleIds = recommendations.filter(r => r.groupId).map(r => r.titleId);
    const uniqueIds = Array.from(new Set(titleIds));
    return titles.filter(t => uniqueIds.includes(t.id)).slice(0, 5);
  };

  const getTrustedPicks = () => {
    const titleIds = recommendations.filter(r => r.primaryStamp === 'Certified Good Call' || r.primaryStamp === 'Crew Pick').map(r => r.titleId);
    return titles.filter(t => Array.from(new Set(titleIds)).includes(t.id)).slice(0, 5);
  };

  const crewShelves = [
    { title: 'From Your Crew', titles: getCrewPicks() },
    { title: 'Stamped by People You Trust', titles: getTrustedPicks() },
  ].filter(s => s.titles.length > 0);

  // Activation Logic (matches Home)
  const hasRecommendations = recommendations.some(r => 
    r.recommendedBy === currentUser?.id || 
    r.recommendedToUserIds?.includes(currentUser?.id || '')
  );
  const isFirstTimeUser = !hasRecommendations;


  return (
    <div className="space-y-10 page-enter">
      
      {/* ── 1. SEARCH-FIRST HERO ─────────────────────────────────────────── */}
      <section className="text-center pt-4 pb-6 border-b border-border">
        <h1 className="text-3xl md:text-4xl font-bold text-bone font-editorial tracking-tight mb-2">Find something worth passing on.</h1>
        <p className="text-sm text-muted max-w-md mx-auto mb-8">Search movies and shows, then recommend them straight from the detail page.</p>

        <div className="relative max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cinema-red pointer-events-none z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search movies, shows, hidden gems…"
              className="w-full bg-surface border border-border rounded-2xl !pl-14 !pr-12 py-4 text-base text-bone placeholder:text-muted/50 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/30 transition-all shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-bone p-1 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button onClick={() => setFilterDrawerOpen(!filterDrawerOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-ink text-muted hover:text-bone transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
              Filters {(activeGenres.length + activeMoods.length + activePlatforms.length + activeLanguages.length) > 0 && `(${activeGenres.length + activeMoods.length + activePlatforms.length + activeLanguages.length})`}
            </button>
            {['Drama', 'Thriller', 'Comedy'].map(g => (
              <FilterChip key={g} label={g} active={activeGenres.includes(g)} onClick={() => toggleFilter(activeGenres, setActiveGenres, g)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE FILTERS DRAWER ────────────────────────────────────────── */}
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
            <div>
              <p className="text-xs text-muted mb-2">Regions / Languages</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => <FilterChip key={l} label={l} active={activeLanguages.includes(l)} onClick={() => toggleFilter(activeLanguages, setActiveLanguages, l)} />)}
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
        /* ── DISCOVERY SHELVES ──────────────────────────────────────────── */
        <div className="space-y-12 pb-10">
          
          {/* Trending in India */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Trending in <span className="text-cinema-red">India</span></h2>
              <Link href="/explore" className="text-xs font-bold text-cinema-red uppercase tracking-widest hover:opacity-80 transition-opacity">View All</Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {trendingTitles.length > 0 ? trendingTitles.map(t => {
                const rec = recommendations.find(r => r.titleId === t.id);
                return (
                  <div key={t.id} className="w-[220px] shrink-0 snap-start">
                    <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                  </div>
                );
              }) : (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-[220px] shrink-0 snap-start">
                    <div className="aspect-[2/3] rounded-[24px] bg-surface border border-border/20 animate-pulse relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Crew Powered Discovery - Only show if not a first-time user OR if there is actual crew content */}
          {!isFirstTimeUser && crewShelves.length > 0 && (
            <div className="py-12 px-6 -mx-6 sm:px-10 sm:-mx-8 rounded-[40px] bg-cinema-red/[0.03] border border-cinema-red/10 my-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cinema-red/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-1.5 h-6 rounded-full bg-cinema-red" />
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Crew-Powered Discovery</h2>
              </div>
              
              <div className="space-y-10 relative z-10">
                {crewShelves.map(shelf => (
                  <div key={shelf.title}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-bone uppercase tracking-widest opacity-60">{shelf.title}</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
                      {shelf.titles.map(t => {
                        const rec = recommendations.find(r => r.titleId === t.id);
                        return (
                          <div key={t.id} className="w-[220px] shrink-0 snap-start">
                            <MovieCard title={t} stamp={rec?.primaryStamp || 'Crew Pick'} showRecommendAction />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated by User's Top Platform */}
          {curatedPlatformTitles.length > 0 && topPlatform && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Top on <span className="text-cinema-red">{topPlatform}</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {curatedPlatformTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Curated by User's Top Language */}
          {curatedLanguageTitles.length > 0 && topLanguage && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Trending in <span className="text-cinema-red">{topLanguage}</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {curatedLanguageTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Curated by User's Top Genre */}
          {curatedGenreTitles.length > 0 && topGenre && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Because you love <span className="text-cinema-red">{topGenre}</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {curatedGenreTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Theatrical Releases */}
          {theatricalTitles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Now in <span className="text-cinema-red">Theatres</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {theatricalTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming Indian Cinema */}
          {upcomingTitles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Upcoming <span className="text-cinema-red">Cinema</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {upcomingTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bollywood Hits */}
          {bollywoodTitles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Bollywood <span className="text-cinema-red">Hits</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {bollywoodTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Regional Gems */}
          {regionalTitles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Regional <span className="text-cinema-red">Gems</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {regionalTitles.map(t => {
                  const rec = recommendations.find(r => r.titleId === t.id);
                  return (
                    <div key={t.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={t} stamp={rec?.primaryStamp} showRecommendAction />
                    </div>
                  );
                })}
              </div>
            </section>
          )}



        </div>
      )}
    </div>
  );
}
