'use client';

import VerdictCarousel from '@/components/VerdictCarousel';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import TasteScoreRing from '@/components/TasteScoreRing';
import HomeSearchModule from '@/components/HomeSearchModule';
import UserAvatar from '@/components/UserAvatar';
import InviteModal from '@/components/InviteModal';
import StarterActivationHub from '@/components/StarterActivationHub';
import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import type { Title } from '@/lib/types';
import LogMovieFlow from '@/components/LogMovieFlow';

/* ─── Icons ────────────────────────────────────────────────── */
const IconCrew = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);



export default function HomePage() {
  const { currentUser, userPreferences, tasteScore, activity, titles, recommendations, ratings, getUser, getTitle, crewConnections, watchlist, openRecommendModal } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [popularPicks, setPopularPicks] = useState<Title[]>([]);
  const [forceToggle, setForceToggle] = useState<null | boolean>(null);
  const [genreRows, setGenreRows] = useState<Record<string, Title[]>>({});
  const [platformRows, setPlatformRows] = useState<Record<string, Title[]>>({});
  const [layoutOrder, setLayoutOrder] = useState<{type: 'genre'|'platform', id: string}[]>([]);
  const [crewCollapsed, setCrewCollapsed] = useState(false);
  const [activityCollapsed, setActivityCollapsed] = useState(false);
  const [logMovieOpen, setLogMovieOpen] = useState(false);

  useEffect(() => {
    async function fetchPopular() {
      try {
        const res = await fetch('/api/tmdb/trending?region=IN');
        if (res.ok) {
          const data = await res.json();
          setPopularPicks(data.slice(0, 6));
        } else { setPopularPicks(titles.slice(0, 6)); }
      } catch { setPopularPicks(titles.slice(0, 6)); }
    }
    fetchPopular();
  }, []);

  useEffect(() => {
    // Only run if we have a user
    if (!currentUser) return;
    
    // Provide fallback mock data if preferences are empty (e.g. they skipped onboarding)
    const genres = userPreferences?.genres?.length > 0 
      ? [...userPreferences.genres]
          .sort((a, b) => (userPreferences.genrePreferences?.[b] || 3) - (userPreferences.genrePreferences?.[a] || 3))
          .slice(0, 3)
      : ['Drama', 'Comedy', 'Thriller'];
    let platforms = (userPreferences?.platforms?.length > 0 ? userPreferences.platforms : ['Netflix', 'Prime Video']).filter(p => p !== 'JioHotstar');
    if (!platforms.includes('Theatre')) platforms.push('Theatre');

    const newLayout: {type: 'genre'|'platform', id: string}[] = [];
    if (genres[0]) newLayout.push({ type: 'genre', id: genres[0] });
    if (genres[1]) newLayout.push({ type: 'genre', id: genres[1] });
    newLayout.push({ type: 'platform', id: 'Theatre' });
    if (genres[2]) newLayout.push({ type: 'genre', id: genres[2] });
    platforms.forEach(p => {
      if (p !== 'Theatre') newLayout.push({ type: 'platform', id: p });
    });
    setLayoutOrder(newLayout);

    genres.forEach(async (genre) => {
      try {
        const res = await fetch(`/api/tmdb/discover?genre=${encodeURIComponent(genre)}`);
        if (res.ok) {
          const data = await res.json();
          setGenreRows(prev => ({ ...prev, [genre]: data }));
        }
      } catch (e) { console.error('Failed to fetch genre', genre, e); }
    });

    platforms.forEach(async (platform) => {
      try {
        const res = await fetch(`/api/tmdb/discover?platform=${encodeURIComponent(platform)}`);
        if (res.ok) {
          const data = await res.json();
          setPlatformRows(prev => ({ ...prev, [platform]: data }));
        }
      } catch (e) { console.error('Failed to fetch platform', platform, e); }
    });
  }, [currentUser, userPreferences]);

  if (!currentUser) return null;

  /* ─── Derive User State ─────────────────────────────────── */
  const hasRecommendations = recommendations.some(r => 
    r.recommendedBy === currentUser.id || 
    r.recommendedToUserIds?.includes(currentUser.id)
  );
  
  // Final logic: Activation hub shows if user has NO recommendations
  // forceToggle allows user to override for testing
  const isFirstTimeUser = forceToggle !== null ? forceToggle : !hasRecommendations;

  const myRatedRecIds = new Set(ratings.filter(rat => rat.ratedBy === currentUser.id).map(rat => rat.recommendationId));

  const pendingVerdicts = recommendations.filter(r =>
    r.recommendedToUserIds?.includes(currentUser.id) && !myRatedRecIds.has(r.id)
  );
  const crewIds = crewConnections.map(c => c.crewMemberId);
  const crewRecommendations = recommendations.filter(r =>
    crewIds.includes(r.recommendedBy) && (r.recommendedToUserIds?.includes(currentUser.id) || r.recommendedToGroup) && !myRatedRecIds.has(r.id)
  );
  const percentile = Math.max(1, 100 - Math.floor(tasteScore.score / 1.1));

  /* ─── Sidebar ───────────────────── */
  const renderSidebar = () => (
    <div className="space-y-5 sticky top-24">
      {/* Taste Score Card */}
      {isFirstTimeUser ? (
        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <div className="w-[72px] h-[72px] mx-auto rounded-full border-[3px] border-dashed border-border/60 flex items-center justify-center mb-5">
            <span className="text-cinema-red opacity-60"><Search size={24} /></span>
          </div>
          <h3 className="text-[15px] font-bold text-bone mb-1.5">Your Taste Score is waiting</h3>
          <p className="text-xs text-muted leading-relaxed mb-5">Send or receive recommendations to start building your Taste Score.</p>
          <button onClick={() => openRecommendModal()} className="w-full py-2.5 bg-cinema-red text-bone text-sm font-semibold rounded-xl hover:bg-cinema-red/90 btn-press transition-colors shadow-lg shadow-cinema-red/15">Recommend something</button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-5">Your Taste Score</p>
          <TasteScoreRing score={tasteScore.score} size="lg" />
          <div className="mt-5 space-y-0.5">
            <p className="text-sm font-bold text-bone">Top {percentile}% of Rec&apos;d</p>
            <p className="text-xs text-muted">Your recommendations carry weight.</p>
          </div>
          <Link href="/profile" className="inline-block mt-4 text-xs font-semibold text-cinema-red hover:text-cinema-red/80 transition-colors">View score breakdown →</Link>
        </div>
      )}

      {/* Log Movie Card */}
      <div className="rounded-2xl bg-surface border border-border p-6 text-center">
        <h3 className="text-sm font-bold text-bone mb-2">Watched something?</h3>
        <p className="text-xs text-muted leading-relaxed mb-4">Log it in your Journal to build your Taste Profile.</p>
        <button onClick={() => setLogMovieOpen(true)} className="w-full py-2.5 bg-bone text-ink text-sm font-bold rounded-xl hover:bg-white btn-press transition-colors shadow-lg">
          Log to Journal
        </button>
      </div>

      {/* Expand Crew Card */}
      <div className="rounded-2xl bg-gradient-to-br from-cinema-red/8 via-surface to-surface border border-cinema-red/15 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cinema-red/8 blur-3xl rounded-full translate-x-8 -translate-y-8" />
        <div className="relative z-10">
          <div className="w-9 h-9 rounded-full bg-cinema-red/10 flex items-center justify-center mb-3 text-cinema-red"><IconCrew /></div>
          <h3 className="text-sm font-bold text-bone mb-1">Expand your crew</h3>
          <p className="text-xs text-muted mb-4 leading-relaxed">Invite friends to start sharing recommendations that actually feel personal.</p>
          <button onClick={() => setInviteOpen(true)} className="w-full py-2.5 bg-cinema-red text-bone text-sm font-semibold rounded-xl hover:bg-cinema-red/90 btn-press transition-colors flex items-center justify-center gap-2">
            <IconPlus /> Invite friends
          </button>
        </div>
      </div>

      {/* Actual Crew List */}
      {crewIds.length > 0 && (
        <div className="rounded-2xl bg-surface border border-border p-5">
          <button 
            onClick={() => setCrewCollapsed(!crewCollapsed)} 
            className="w-full flex items-center justify-between mb-4 group"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-bone transition-colors">Your Crew</p>
            <ChevronDown size={20} className={`text-muted transition-transform duration-300 ${crewCollapsed ? 'rotate-0' : '-rotate-180'}`} />
          </button>
          
          <div className={`space-y-3 transition-all duration-300 origin-top overflow-hidden ${crewCollapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100'}`}>
            {crewIds.slice(0, 4).map(id => {
              const friend = getUser(id);
              if (!friend) return null;
              return (
                <Link key={id} href={`/profile/${friend.username}`} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
                  <UserAvatar name={friend.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-bone group-hover:text-cinema-red transition-colors truncate">{friend.displayName}</p>
                    <p className="text-[10px] text-muted truncate">{friend.tasteArchetype}</p>
                  </div>
                </Link>
              );
            })}
            {crewIds.length > 4 && (
              <Link href="/explore" className="block text-center pt-2 text-[10px] font-bold text-muted hover:text-bone uppercase tracking-widest transition-colors">
                View entire crew ({crewIds.length})
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Crew Activity Card */}
      <div className="rounded-2xl bg-surface border border-border p-5">
        <button 
          onClick={() => setActivityCollapsed(!activityCollapsed)} 
          className="w-full flex items-center justify-between mb-4 group"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-bone transition-colors">Crew Activity</p>
          <ChevronDown size={20} className={`text-muted transition-transform duration-300 ${activityCollapsed ? 'rotate-0' : '-rotate-180'}`} />
        </button>
        <div className={`transition-all duration-300 origin-top overflow-hidden ${activityCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
          {activity.length > 0 ? (
            <div className="space-y-3.5">
              {activity.slice(0, 5).map(act => {
                const user = getUser(act.userId);
                const title = act.titleId ? getTitle(act.titleId) : undefined;
                return (
                  <div key={act.id} className="flex items-start gap-3 group">
                    <UserAvatar name={user?.displayName || 'U'} size="sm" />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[13px] text-bone/90 line-clamp-2 leading-snug font-medium">{act.message}</p>
                      <p className="text-[11px] text-muted mt-1" suppressHydrationWarning>{formatRelativeTime(act.createdAt)}</p>
                    </div>
                    {title && <div className={`w-7 h-11 shrink-0 rounded poster-gradient-${title.posterGradient}`} />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-bone font-medium mb-1">No crew activity yet.</p>
              <p className="text-xs text-muted mb-4">Invite friends or join a group to get things moving.</p>
              <Link href="/explore" className="inline-block px-5 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg hover:bg-surface transition-colors btn-press">Explore more picks</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 page-enter pb-12">
      {/* Search Module — Always visible */}
      <HomeSearchModule />

      {/* ═══════════════════ HOME PAGE ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

        {/* ── Main Column ── */}
        <div className="space-y-12 min-w-0">

          {/* Section 1: Premium Activation Hub (Only for new users with no recommendations) */}
          {isFirstTimeUser && <StarterActivationHub />}

          {/* Pending Verdicts (Contextual) */}
          {pendingVerdicts.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-bone">Pending Verdicts</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cinema-red/10 text-cinema-red border border-cinema-red/20 uppercase tracking-wider">Requires Action</span>
              </div>
              <VerdictCarousel recommendations={pendingVerdicts} />
            </section>
          )}

          {/* Personalized Dynamic Rows (Strictly Ordered) */}
          {layoutOrder.map((section, idx) => {
            if (section.type === 'genre') {
              const movies = genreRows[section.id];
              if (!movies || movies.length === 0) return null;
              return (
                <section key={`genre-${section.id}-${idx}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-bone">Because you like {section.id}</h2>
                    <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors font-medium">Explore all</Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {movies.map(movie => (
                      <div key={movie.id} className="w-[180px] shrink-0 snap-start">
                        <MovieCard title={movie} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            } else {
              const movies = platformRows[section.id];
              if (!movies || movies.length === 0) return null;
              return (
                <section key={`platform-${section.id}-${idx}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-bone">
                      {section.id === 'Theatre' ? 'In Theatres Now' : `Trending on ${section.id}`}
                    </h2>
                    <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors font-medium">Explore all</Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {movies.map(movie => (
                      <div key={movie.id} className="w-[180px] shrink-0 snap-start">
                        <MovieCard title={movie} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }
          })}

          {/* From Your Crew */}
          {crewRecommendations.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-bone">From Your Crew</h2>
                <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors font-medium">Explore all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {crewRecommendations.map(rec => {
                  const title = getTitle(rec.titleId);
                  if (!title) return null;
                  return (
                    <div key={rec.id} className="w-[220px] shrink-0 snap-start">
                      <MovieCard title={title} stamp={rec.primaryStamp} recommendedBy={rec.recommendedBy} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Continue Your Watchlist */}
          {watchlist && watchlist.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-bone">Continue your watchlist</h2>
                <Link href="/watchlist" className="text-xs text-muted hover:text-bone transition-colors font-medium">View all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {watchlist.slice(0, 8).map(item => {
                  const title = getTitle(item.titleId);
                  if (!title) return null;
                  return (
                    <div key={item.id} className="w-[180px] shrink-0 snap-start">
                      <MovieCard title={title} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Build Your Crew */}
          <section className="rounded-[24px] bg-gradient-to-br from-cinema-red/10 via-surface to-surface border border-cinema-red/20 p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cinema-red/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-cinema-red/10 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3" />
             
             <div className="relative z-10 flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-bone font-editorial mb-3 tracking-tight">Great taste is better together.</h2>
                <p className="text-sm text-muted max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
                  Rec'd is built for private circles. Invite your friends to start sharing and debating what's actually worth watching.
                </p>
                <button 
                  onClick={() => setInviteOpen(true)}
                  className="px-8 py-3.5 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-xl hover:bg-cinema-red/90 transition-all btn-press shadow-xl shadow-cinema-red/20 text-xs inline-flex items-center gap-2"
                >
                  <IconPlus />
                  Invite Friends
                </button>
             </div>

             <div className="relative z-10 w-full max-w-[240px] aspect-square flex items-center justify-center shrink-0">
               {/* Decorative Graphic */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cinema-red/20 via-transparent to-transparent opacity-80 blur-2xl" />
               
               <div className="absolute transform -translate-x-10 translate-y-8 z-10 animate-in fade-in zoom-in duration-700 delay-100 shadow-xl rounded-full ring-2 ring-surface">
                  <UserAvatar name="A" size="md" />
               </div>
               <div className="absolute transform z-30 animate-in fade-in zoom-in duration-700 shadow-2xl rounded-full ring-4 ring-surface">
                  <UserAvatar name="M" size="lg" />
               </div>
               <div className="absolute transform translate-x-12 -translate-y-10 z-20 animate-in fade-in zoom-in duration-700 delay-200 shadow-xl rounded-full ring-2 ring-surface">
                  <UserAvatar name="S" size="sm" />
               </div>
               
               {/* Floating Badges */}
               <div className="absolute transform -translate-x-16 -translate-y-6 bg-surface border border-white/10 rounded-full p-2 text-cinema-red shadow-lg animate-in fade-in zoom-in duration-700 delay-300 hover:scale-110 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
               </div>
               <div className="absolute transform translate-x-16 translate-y-6 bg-surface border border-white/10 rounded-full p-2 text-cinema-red shadow-lg animate-in fade-in zoom-in duration-700 delay-500 hover:scale-110 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
               </div>
             </div>
          </section>
        </div>

        {/* ── Right Sidebar ── */}
        {renderSidebar()}
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />

      {/* Dev Toggle (Hidden in bottom-left) */}
      <div className="fixed bottom-4 left-4 z-[100] opacity-5 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setForceToggle(forceToggle === null ? !isFirstTimeUser : !forceToggle)}
          className="bg-bone text-ink text-[8px] px-1.5 py-0.5 rounded font-bold uppercase"
        >
          Toggle View: {isFirstTimeUser ? 'Starter' : 'Active'}
        </button>
      </div>

      <LogMovieFlow isOpen={logMovieOpen} onClose={() => setLogMovieOpen(false)} />
    </div>
  );
}
