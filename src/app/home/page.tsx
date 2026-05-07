'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import TasteScoreRing from '@/components/TasteScoreRing';
import RecommendationCard from '@/components/RecommendationCard';
import HeroRecommendationCard from '@/components/HeroRecommendationCard';
import HomeSearchModule from '@/components/HomeSearchModule';
import MovieCard from '@/components/MovieCard';
import UserAvatar from '@/components/UserAvatar';
import InviteModal from '@/components/InviteModal';
import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';

export default function HomePage() {
  const { currentUser, tasteScore, getPendingForUser, activity, titles, recommendations, getUser, getTitle } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!currentUser) return null;

  const pendingRecs = recommendations.filter(r => r.recommendedToUserIds?.includes(currentUser.id) && (r.status === 'pending' || r.status === 'accepted'));
  const watchingRecs = recommendations.filter(r => r.recommendedToUserIds?.includes(currentUser.id) && r.status === 'watching');
  const heroRecs = recommendations.filter(r => r.recommendedToUserIds?.includes(currentUser.id) && r.primaryStamp).slice(0, 3);
  
  // Detect if the user is completely new (empty state)
  const isNewUser = pendingRecs.length === 0 && watchingRecs.length === 0;

  // Fallback if no hero recs (Starter Pack / Platform Picks)
  if (heroRecs.length === 0 && recommendations.length > 0) {
    const syntheticRecs = recommendations.slice(0, 3).map(r => ({ ...r, primaryStamp: 'Crew Pick' as any, recommendedBy: 'system' }));
    heroRecs.push(...syntheticRecs);
  }

  return (
    <div className="space-y-8 page-enter">
      {/* 1. Quick Search Module */}
      <HomeSearchModule />

      {/* 2. Header / Greeting */}
      <div className="flex items-center justify-between mb-8 mt-6">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-1">Good taste travels.</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-bone font-editorial tracking-tight">
            {pendingRecs.length > 0
              ? `${pendingRecs.length} verdicts pending.`
              : 'Your inbox is empty.'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: The Cinematic Galleries */}
        <div className="lg:col-span-2 space-y-10 min-w-0">
          
          {/* 3. Immersive Hero Feed */}
          {heroRecs.length > 0 && (
            <section className="-mx-4 sm:mx-0">
              <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 sm:px-0 gap-4">
                {heroRecs.map(rec => (
                  <div key={rec.id} className="w-full sm:w-full shrink-0 snap-center">
                    <HeroRecommendationCard recommendation={rec} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Needs Your Verdict / Pending Shelf (Option C) */}
          {(pendingRecs.length > 0 || watchingRecs.length > 0) ? (
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-base font-bold text-bone">Needs Your Verdict</h2>
                <span className="text-xs text-cinema-red font-medium">{pendingRecs.length + watchingRecs.length} total</span>
              </div>
              
              {/* Horizontal scroll for Pending items */}
              {pendingRecs.length > 0 && (
                <div className="flex overflow-x-auto hide-scrollbar snap-x pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4">
                  {pendingRecs.map(rec => (
                    <div key={rec.id} className="w-[90vw] sm:w-[600px] shrink-0 snap-start">
                      <RecommendationCard recommendation={rec} />
                    </div>
                  ))}
                </div>
              )}

              {/* Vertical stack for Collapsed Watching items */}
              {watchingRecs.length > 0 && (
                <div className="space-y-3 mt-2">
                  {watchingRecs.map(rec => (
                    <RecommendationCard key={rec.id} recommendation={rec} collapsed />
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* EMPTY STATE: Inbox Empty Widget */
            <section className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface/30">
              <span className="text-4xl mb-4 block">📭</span>
              <h2 className="text-xl font-bold text-bone font-editorial mb-2">No pending recommendations.</h2>
              <p className="text-sm text-muted max-w-sm mx-auto mb-6">Good taste is meant to be shared. Invite your friends to start building your network.</p>
              <button onClick={() => setInviteOpen(true)} className="px-6 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold hover:bg-cinema-red/90 transition-colors btn-press">
                Invite Friends
              </button>
            </section>
          )}

          {/* 3. From Your Crew OR Find Your Crew (Empty State) */}
          {isNewUser ? (
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-base font-bold text-bone">Find Your Crew</h2>
                <Link href="/groups" className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors">View all groups</Link>
              </div>
              <p className="text-sm text-muted mb-4 px-1">Join public groups to instantly start getting recommendations.</p>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* We just pull 3 mock titles for the UI, but link them to /groups to simulate group cards in the feed */}
                {titles.slice(0, 3).map((title, i) => (
                  <Link href="/groups" key={title.id} className="w-[280px] shrink-0 snap-start block">
                    <div className="rounded-2xl bg-surface border border-border p-5 h-full card-hover">
                      <div className={`w-12 h-12 rounded-xl mb-3 poster-gradient-${i + 2}`} />
                      <h3 className="font-bold text-bone text-base mb-1">Film Chaos Club</h3>
                      <p className="text-xs text-cinema-red mb-3">Movie chaos</p>
                      <button className="w-full py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg">Join Group</button>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-base font-bold text-bone">From Your Crew</h2>
                <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors">Explore all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {titles.slice(0, 8).map(title => {
                  const rec = recommendations.find(r => r.titleId === title.id);
                  const recommender = rec ? getUser(rec.recommendedBy) : undefined;
                  return (
                    <Link href={`/title/${title.id}${rec ? `?recId=${rec.id}` : ''}`} key={title.id} className="w-[240px] shrink-0 snap-start block">
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
            </section>
          )}

          {/* 4. Trending / Discover Shelf (Option C) */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-base font-bold text-bone">Trending on Rec&apos;d</h2>
              <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors">View top charts</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {titles.slice(8, 15).map(title => (
                <Link href={`/title/${title.id}`} key={title.id} className="w-[240px] shrink-0 snap-start block">
                  <div className={`aspect-[2/3] rounded-xl overflow-hidden relative group cursor-pointer card-hover border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                    {title.posterUrl && (
                      <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 poster-overlay-strong" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-lg font-bold text-bone drop-shadow-lg leading-tight line-clamp-2">{title.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: The Social Widgets */}
        <div className="space-y-6">
          
          {/* Taste Score Widget */}
          <div className="rounded-2xl bg-surface border border-border p-6 text-center shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-6">Your Taste Score</p>
            <TasteScoreRing score={tasteScore.score} size="lg" />
            <div className="mt-6 space-y-1">
              <p className="text-sm font-bold text-bone">Top 10% of Rec&apos;d</p>
              <p className="text-xs text-muted">Your recommendations carry weight.</p>
            </div>
            <Link href="/profile" className="inline-block mt-4 text-xs font-semibold text-cinema-red hover:text-cinema-red/80 transition-colors">
              View score breakdown →
            </Link>
          </div>

          {/* Invite Widget */}
          <div className="rounded-2xl bg-gradient-to-br from-cinema-red/10 to-surface border border-cinema-red/20 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-red/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <h3 className="text-sm font-bold text-bone mb-1 relative z-10">Expand your crew.</h3>
            <p className="text-xs text-muted mb-4 relative z-10 leading-relaxed">
              Invite friends to start getting recommendations that actually feel personal.
            </p>
            <button onClick={() => setInviteOpen(true)}
              className="w-full py-2.5 bg-cinema-red text-bone text-sm font-semibold rounded-xl hover:bg-cinema-red/90 btn-press transition-colors relative z-10 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Invite Friends
            </button>
          </div>

          {/* Activity Widget */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Crew Activity</p>
            </div>
            <div className="space-y-4">
              {activity.slice(0, 5).map(act => {
                const user = getUser(act.userId);
                const title = act.titleId ? getTitle(act.titleId) : undefined;
                return (
                  <div key={act.id} className="flex items-start gap-3 group">
                    <UserAvatar name={user?.displayName || 'U'} size="sm" />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-bone/90 line-clamp-2 leading-snug font-medium">{act.message}</p>
                      <p className="text-[11px] text-muted mt-1">{formatRelativeTime(act.createdAt)}</p>
                    </div>
                    {title && <div className={`w-8 h-12 shrink-0 rounded-md poster-gradient-${title.posterGradient} shadow-sm group-hover:scale-105 transition-transform duration-300`} />}
                  </div>
                );
              })}
            </div>
            <Link href="/explore" className="block text-center w-full py-2.5 mt-4 text-xs font-semibold text-bone bg-ink rounded-lg border border-border hover:border-border-strong transition-all btn-press">
              Explore more picks
            </Link>
          </div>

        </div>
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
