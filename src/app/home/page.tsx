'use client';

import VerdictCarousel from '@/components/VerdictCarousel';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import TasteScoreRing from '@/components/TasteScoreRing';
import HomeSearchModule from '@/components/HomeSearchModule';
import UserAvatar from '@/components/UserAvatar';
import InviteModal from '@/components/InviteModal';
import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import type { Title } from '@/lib/types';

export default function HomePage() {
  const { currentUser, tasteScore, activity, titles, recommendations, getUser, getTitle, userConnections, watchlist, openRecommendModal } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [popularPicks, setPopularPicks] = useState<Title[]>([]);

  // Fetch a generic popular picks shelf for the fallback state
  useEffect(() => {
    async function fetchPopular() {
      try {
        const res = await fetch('/api/tmdb/trending?region=IN');
        if (res.ok) {
          const data = await res.json();
          setPopularPicks(data.slice(0, 6));
        } else {
          setPopularPicks(titles.slice(0, 6));
        }
      } catch {
        setPopularPicks(titles.slice(0, 6));
      }
    }
    fetchPopular();
  }, []);

  if (!currentUser) return null;

  // Determine First-Time User State
  const hasReceivedRecs = recommendations.some(r => r.recommendedToUserIds?.includes(currentUser.id) || r.recommendedToGroup);
  const hasSentRecs = recommendations.some(r => r.recommendedBy === currentUser.id);
  const hasCrewMembers = userConnections.some(c => c.userId === currentUser.id && c.status === 'connected');
  const hasWatchlistItems = watchlist && watchlist.some(w => w.userId === currentUser.id);

  const isFirstTimeUser = !hasReceivedRecs && !hasSentRecs && !hasCrewMembers && !hasWatchlistItems;

  // Active User Data
  const pendingVerdicts = recommendations.filter(r => 
    r.recommendedToUserIds?.includes(currentUser.id) && 
    r.verdictState === 'verdict_pending'
  );

  const crewIds = userConnections
    .filter(c => c.userId === currentUser.id && c.status === 'connected')
    .map(c => c.connectedUserId);
  
  const crewRecommendations = recommendations.filter(r => 
    crewIds.includes(r.recommendedBy) && 
    (r.recommendedToUserIds?.includes(currentUser.id) || r.recommendedToGroup)
  );

  const percentile = Math.max(1, 100 - Math.floor(tasteScore.score / 1.1));

  return (
    <div className="space-y-12 page-enter pb-12">
      {/* 1. Quick Search Module (Always Visible) */}
      <HomeSearchModule />

      {isFirstTimeUser ? (
        /* ── FIRST-TIME USER STATE ────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mt-4">
          
          {/* LEFT COLUMN: Actions & Explainer */}
          <div className="lg:col-span-2 space-y-12 min-w-0">
            
            {/* Starter Hero & Action Cards */}
            <section>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-bone font-editorial mb-2">Start your Rec&apos;d Club.</h1>
                <p className="text-muted text-lg">Every rec gets a verdict. Start with one move.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Action 1 */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col items-start card-hover h-full">
                  <div className="w-10 h-10 rounded-full bg-cinema-red/10 flex items-center justify-center mb-4 text-cinema-red">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="font-bold text-bone mb-2">Recommend your first pick</h3>
                  <p className="text-sm text-muted mb-6 flex-1">Search a movie or show and send it to someone.</p>
                  <button onClick={() => openRecommendModal()} className="w-full py-2.5 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-colors btn-press text-sm shadow-lg shadow-cinema-red/20">
                    Recommend something
                  </button>
                </div>

                {/* Action 2 */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col items-start card-hover h-full">
                  <div className="w-10 h-10 rounded-full bg-bone/5 flex items-center justify-center mb-4 text-bone">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="font-bold text-bone mb-2">Build your crew</h3>
                  <p className="text-sm text-muted mb-6 flex-1">Add people whose taste you trust.</p>
                  <button onClick={() => setInviteOpen(true)} className="w-full py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-colors btn-press text-sm">
                    Add to Crew
                  </button>
                </div>

                {/* Action 3 */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col items-start card-hover h-full">
                  <div className="w-10 h-10 rounded-full bg-bone/5 flex items-center justify-center mb-4 text-bone">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="font-bold text-bone mb-2">Start your watchlist</h3>
                  <p className="text-sm text-muted mb-6 flex-1">Save movies and shows you want to come back to.</p>
                  <Link href="/explore" className="w-full text-center py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-colors btn-press text-sm block">
                    Explore picks
                  </Link>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="py-8 border-y border-border">
              <h2 className="text-lg font-bold text-bone mb-6">How Rec&apos;d Club works</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-cinema-red font-editorial text-xl mb-2">01</div>
                  <h4 className="text-sm font-bold text-bone mb-1">Recommend something</h4>
                  <p className="text-xs text-muted">Send a pick you love to your crew or a group.</p>
                </div>
                <div>
                  <div className="text-cinema-red font-editorial text-xl mb-2">02</div>
                  <h4 className="text-sm font-bold text-bone mb-1">Your crew watches</h4>
                  <p className="text-xs text-muted">They add it to their watchlist and hit play.</p>
                </div>
                <div>
                  <div className="text-cinema-red font-editorial text-xl mb-2">03</div>
                  <h4 className="text-sm font-bold text-bone mb-1">They give a verdict</h4>
                  <p className="text-xs text-muted">Certified, Mid, or Trash. The truth comes out.</p>
                </div>
                <div>
                  <div className="text-cinema-red font-editorial text-xl mb-2">04</div>
                  <h4 className="text-sm font-bold text-bone mb-1">Your Taste Score grows</h4>
                  <p className="text-xs text-muted">Good verdicts boost your score and standing.</p>
                </div>
              </div>
            </section>

            {/* Find Your Crew Mock Groups */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-base font-bold text-bone">Find Your Crew</h2>
                <Link href="/groups" className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors">View all groups</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Mock Group 1 */}
                <div className="rounded-2xl bg-surface border border-border p-5 h-full card-hover flex flex-col">
                  <div className="w-12 h-12 rounded-xl mb-3 poster-gradient-2" />
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-bone text-base">Film Chaos Club</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold bg-ink px-1.5 py-0.5 rounded">Public</span>
                  </div>
                  <p className="text-xs text-muted mb-4 flex-1">For loud opinions, risky picks, and messy verdicts.</p>
                  <p className="text-xs text-bone font-medium mb-4">42 Members</p>
                  <div className="flex gap-2">
                    <Link href="/groups" className="flex-1 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg text-center hover:bg-surface transition-colors btn-press">Join group</Link>
                    <Link href="/groups" className="py-2 px-3 text-muted text-xs font-medium hover:text-bone transition-colors">Preview</Link>
                  </div>
                </div>

                {/* Mock Group 2 */}
                <div className="rounded-2xl bg-surface border border-border p-5 h-full card-hover flex flex-col">
                  <div className="w-12 h-12 rounded-xl mb-3 poster-gradient-3" />
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-bone text-base">Slow Burn Club</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold bg-ink px-1.5 py-0.5 rounded">Public</span>
                  </div>
                  <p className="text-xs text-muted mb-4 flex-1">For patient stories that take their time.</p>
                  <p className="text-xs text-bone font-medium mb-4">18 Members</p>
                  <div className="flex gap-2">
                    <Link href="/groups" className="flex-1 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg text-center hover:bg-surface transition-colors btn-press">Join group</Link>
                    <Link href="/groups" className="py-2 px-3 text-muted text-xs font-medium hover:text-bone transition-colors">Preview</Link>
                  </div>
                </div>

                {/* Mock Group 3 */}
                <div className="rounded-2xl bg-surface border border-border p-5 h-full card-hover flex flex-col">
                  <div className="w-12 h-12 rounded-xl mb-3 poster-gradient-4" />
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-bone text-base">Comfort Watchers</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold bg-ink px-1.5 py-0.5 rounded">Public</span>
                  </div>
                  <p className="text-xs text-muted mb-4 flex-1">For easy rewatches and feel-good picks.</p>
                  <p className="text-xs text-bone font-medium mb-4">89 Members</p>
                  <div className="flex gap-2">
                    <Link href="/groups" className="flex-1 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg text-center hover:bg-surface transition-colors btn-press">Join group</Link>
                    <Link href="/groups" className="py-2 px-3 text-muted text-xs font-medium hover:text-bone transition-colors">Preview</Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Picks Fallback */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-base font-bold text-bone">Popular picks to start with</h2>
                  <p className="text-xs text-muted mt-0.5">Invite your crew to make this section personal.</p>
                </div>
                <Link href="/explore" className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors shrink-0 ml-4">Explore more</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {popularPicks.length > 0 ? popularPicks.map(title => (
                  <Link href={`/title/${title.id}?type=${title.type}`} key={title.id} className="w-[160px] shrink-0 snap-start block">
                    <div className={`aspect-[2/3] rounded-xl overflow-hidden relative group cursor-pointer card-hover border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                      {title.posterUrl && (
                        <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      )}
                    </div>
                  </Link>
                )) : (
                  [1,2,3,4,5].map(i => (
                    <div key={i} className="w-[160px] shrink-0 snap-start">
                      <div className="aspect-[2/3] rounded-xl bg-surface border border-border/50 animate-pulse" />
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Waiting State */}
          <div className="space-y-6">
            
            {/* Waiting Taste Score */}
            <div className="rounded-2xl bg-surface border border-border p-6 text-center shadow-xl">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-dashed border-border flex items-center justify-center mb-6">
                <span className="text-2xl opacity-30">🎯</span>
              </div>
              <h3 className="text-base font-bold text-bone mb-2">Your Taste Score is waiting.</h3>
              <p className="text-xs text-muted leading-relaxed mb-6">
                Send or receive recommendations to start building your score.
              </p>
              <button onClick={() => openRecommendModal()} className="w-full py-2.5 bg-cinema-red text-bone text-sm font-semibold rounded-xl hover:bg-cinema-red/90 btn-press transition-colors">
                Recommend something
              </button>
            </div>

            {/* Invite Widget */}
            <div className="rounded-2xl bg-gradient-to-br from-cinema-red/10 to-surface border border-cinema-red/20 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-red/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <h3 className="text-sm font-bold text-bone mb-1 relative z-10">Expand your crew.</h3>
              <p className="text-xs text-muted mb-4 relative z-10 leading-relaxed">
                Invite friends to start getting recommendations that actually feel personal.
              </p>
              <button onClick={() => setInviteOpen(true)}
                className="w-full py-2.5 bg-ink border border-border text-bone text-sm font-semibold rounded-xl hover:border-border-strong btn-press transition-colors relative z-10 flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Invite Friends
              </button>
            </div>

            {/* Empty Crew Activity */}
            <div className="rounded-2xl bg-surface border border-border p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Crew Activity</p>
              <p className="text-sm text-bone font-medium mb-1">No crew activity yet.</p>
              <p className="text-xs text-muted mb-6">Invite friends or join a group to get things moving.</p>
              <button onClick={() => setInviteOpen(true)} className="px-5 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg hover:bg-surface transition-colors btn-press">
                Invite friends
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* ── ACTIVE USER STATE ────────────────────────────────────────────── */
        <>
          {/* Pending Verdicts Carousel */}
          {pendingVerdicts.length > 0 && (
            <VerdictCarousel recommendations={pendingVerdicts} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mt-4">
            
            {/* LEFT COLUMN: Active Hub */}
            <div className="lg:col-span-2 space-y-12 min-w-0">
              
              {/* From Your Crew */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-base font-bold text-bone">From Your Crew</h2>
                  <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors">Explore all</Link>
                </div>
                {crewRecommendations.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                    {crewRecommendations.map(rec => {
                      const title = getTitle(rec.titleId);
                      const recommender = getUser(rec.recommendedBy);
                      if (!title) return null;
                      return (
                        <Link href={`/title/${title.id}${rec ? `?recId=${rec.id}` : ''}`} key={rec.id} className="w-[240px] shrink-0 snap-start block">
                          <div className={`aspect-[2/3] rounded-xl overflow-hidden relative group cursor-pointer card-hover border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                            {title.posterUrl && (
                              <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 poster-overlay-strong" />
                            <div className="absolute bottom-3 left-3 right-3">
                              {recommender && (
                                <p className="text-xs font-medium text-cinema-red/90 mb-1 drop-shadow-md truncate">Rec&apos;d by {recommender.displayName}</p>
                              )}
                              <p className="text-lg font-bold text-bone drop-shadow-lg leading-tight line-clamp-2">{title.title}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface/30">
                    <p className="text-sm text-muted">Your crew hasn't recommended anything recently.</p>
                    <button onClick={() => setInviteOpen(true)} className="mt-4 px-4 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg hover:bg-surface transition-colors btn-press">
                      Invite more friends
                    </button>
                  </div>
                )}
              </section>

              {/* Continue Your Watchlist (if active user has items) */}
              {watchlist && watchlist.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-base font-bold text-bone">Continue your watchlist</h2>
                    <Link href="/profile" className="text-xs text-muted hover:text-bone transition-colors">View all</Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                    {watchlist.slice(0, 5).map(item => {
                      const title = getTitle(item.titleId);
                      if (!title) return null;
                      return (
                        <Link href={`/title/${title.id}`} key={item.id} className="w-[160px] shrink-0 snap-start block">
                          <div className={`aspect-[2/3] rounded-xl overflow-hidden relative group cursor-pointer card-hover border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                            {title.posterUrl && (
                              <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

            </div>

            {/* RIGHT COLUMN: Active Socials */}
            <div className="space-y-6">
              
              {/* Active Taste Score */}
              <div className="rounded-2xl bg-surface border border-border p-6 text-center shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-6">Your Taste Score</p>
                <TasteScoreRing score={tasteScore.score} size="lg" />
                <div className="mt-6 space-y-1">
                  <p className="text-sm font-bold text-bone">Top {percentile}% of Rec&apos;d</p>
                  <p className="text-xs text-muted">Your recommendations carry weight.</p>
                </div>
                <Link href="/profile" className="inline-block mt-4 text-xs font-semibold text-cinema-red hover:text-cinema-red/80 transition-colors">
                  View score breakdown →
                </Link>
              </div>

              {/* Active Crew Activity */}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Crew Activity</p>
                </div>
                {activity.length > 0 ? (
                  <div className="space-y-4">
                    {activity.slice(0, 5).map(act => {
                      const user = getUser(act.userId);
                      const title = act.titleId ? getTitle(act.titleId) : undefined;
                      return (
                        <div key={act.id} className="flex items-start gap-3 group">
                          <UserAvatar name={user?.displayName || 'U'} size="sm" />
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm text-bone/90 line-clamp-2 leading-snug font-medium">{act.message}</p>
                            <p className="text-[11px] text-muted mt-1" suppressHydrationWarning>{formatRelativeTime(act.createdAt)}</p>
                          </div>
                          {title && <div className={`w-8 h-12 shrink-0 rounded-md poster-gradient-${title.posterGradient} shadow-sm group-hover:scale-105 transition-transform duration-300`} />}
                        </div>
                      );
                    })}
                    <Link href="/explore" className="block text-center w-full py-2.5 mt-4 text-xs font-semibold text-bone bg-ink rounded-lg border border-border hover:border-border-strong transition-all btn-press">
                      Explore more picks
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                     <p className="text-sm text-bone font-medium mb-1">It's quiet here.</p>
                     <p className="text-xs text-muted mb-4">Start recommending to wake up your crew.</p>
                     <button onClick={() => openRecommendModal()} className="px-4 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg hover:bg-surface transition-colors btn-press">
                        Recommend a pick
                     </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
