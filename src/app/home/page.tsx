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

/* ─── Icons ────────────────────────────────────────────────── */
const IconMessage = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const IconCrew = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconBookmark = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

/* ─── Mock Groups ──────────────────────────────────────────── */
const MOCK_GROUPS = [
  { name: 'Film Chaos Club', desc: 'Unpredictable picks. Great conversations.', members: '12.4k', gradient: 'poster-gradient-2', emoji: '🎬' },
  { name: 'Slow Burn Club', desc: 'Deep stories. Strong characters. No rush.', members: '8.7k', gradient: 'poster-gradient-3', emoji: '🕯️' },
  { name: 'Comfort Watchers', desc: 'Feel-good picks for every mood.', members: '15.2k', gradient: 'poster-gradient-4', emoji: '☕' },
];

/* ─── How It Works Steps ───────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Recommend something', desc: 'Share a movie or show you think is worth it.' },
  { num: '02', title: 'Your crew watches', desc: 'They check it out at their own pace.' },
  { num: '03', title: 'They give a verdict', desc: 'They rate it and share their thoughts.' },
  { num: '04', title: 'Your Taste Score grows', desc: 'Better recs, stronger connections, smarter picks.' },
];

export default function HomePage() {
  const { currentUser, tasteScore, activity, titles, recommendations, getUser, getTitle, userConnections, watchlist, openRecommendModal } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [popularPicks, setPopularPicks] = useState<Title[]>([]);

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

  if (!currentUser) return null;

  /* ─── Derive User State ─────────────────────────────────── */
  const hasReceivedRecs = recommendations.some(r => r.recommendedToUserIds?.includes(currentUser.id) || r.recommendedToGroup);
  const hasSentRecs = recommendations.some(r => r.recommendedBy === currentUser.id);
  const hasCrewMembers = userConnections.some(c => c.userId === currentUser.id && c.status === 'connected');
  const hasWatchlistItems = watchlist?.some(w => w.userId === currentUser.id);
  const isFirstTimeUser = !hasReceivedRecs && !hasSentRecs && !hasCrewMembers && !hasWatchlistItems;

  const pendingVerdicts = recommendations.filter(r =>
    r.recommendedToUserIds?.includes(currentUser.id) && r.verdictState === 'verdict_pending'
  );
  const crewIds = userConnections.filter(c => c.userId === currentUser.id && c.status === 'connected').map(c => c.connectedUserId);
  const crewRecommendations = recommendations.filter(r =>
    crewIds.includes(r.recommendedBy) && (r.recommendedToUserIds?.includes(currentUser.id) || r.recommendedToGroup)
  );
  const percentile = Math.max(1, 100 - Math.floor(tasteScore.score / 1.1));

  /* ─── Sidebar (shared between states) ───────────────────── */
  const renderSidebar = () => (
    <div className="space-y-5">
      {/* Taste Score Card */}
      {isFirstTimeUser ? (
        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <div className="w-[72px] h-[72px] mx-auto rounded-full border-[3px] border-dashed border-border/60 flex items-center justify-center mb-5">
            <span className="text-cinema-red opacity-60"><IconStar /></span>
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

      {/* Crew Activity Card */}
      <div className="rounded-2xl bg-surface border border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Crew Activity</p>
        {activity.length > 0 && !isFirstTimeUser ? (
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
  );

  return (
    <div className="space-y-10 page-enter pb-12">
      {/* Search Module — Always visible */}
      <HomeSearchModule />

      {isFirstTimeUser ? (
        /* ═══════════════════ FIRST-TIME USER STATE ═══════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

          {/* ── Main Column ── */}
          <div className="space-y-10 min-w-0">

            {/* Section 2: Starter Activation Card */}
            <section>
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-bone font-editorial mb-2 tracking-tight">Start your Rec&apos;d Club.</h1>
                <p className="text-muted text-base sm:text-lg">Every rec gets a verdict. Start with one move.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Recommend */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col card-hover group">
                  <div className="w-10 h-10 rounded-xl bg-cinema-red/10 flex items-center justify-center mb-4 text-cinema-red group-hover:bg-cinema-red/15 transition-colors"><IconMessage /></div>
                  <h3 className="font-bold text-bone text-[15px] mb-1.5">Recommend your first pick</h3>
                  <p className="text-xs text-muted mb-5 flex-1 leading-relaxed">Share a movie or show with your crew and get the conversation rolling.</p>
                  <button onClick={() => openRecommendModal()} className="w-full py-2.5 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-colors btn-press text-sm shadow-lg shadow-cinema-red/15">Recommend something</button>
                </div>
                {/* Card 2: Crew */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col card-hover group">
                  <div className="w-10 h-10 rounded-xl bg-bone/5 flex items-center justify-center mb-4 text-bone/70 group-hover:bg-bone/8 transition-colors"><IconCrew /></div>
                  <h3 className="font-bold text-bone text-[15px] mb-1.5">Build your crew</h3>
                  <p className="text-xs text-muted mb-5 flex-1 leading-relaxed">Add friends or join groups with similar taste and start sharing together.</p>
                  <button onClick={() => setInviteOpen(true)} className="w-full py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-colors btn-press text-sm">Add to Crew</button>
                </div>
                {/* Card 3: Watchlist */}
                <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col card-hover group">
                  <div className="w-10 h-10 rounded-xl bg-bone/5 flex items-center justify-center mb-4 text-bone/70 group-hover:bg-bone/8 transition-colors"><IconBookmark /></div>
                  <h3 className="font-bold text-bone text-[15px] mb-1.5">Start your watchlist</h3>
                  <p className="text-xs text-muted mb-5 flex-1 leading-relaxed">Save picks, build your list, and never forget what to watch next.</p>
                  <Link href="/explore" className="w-full text-center py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-colors btn-press text-sm block">Explore picks</Link>
                </div>
              </div>
            </section>

            {/* Section 3: How It Works */}
            <section className="py-8 border-y border-border/60">
              <h2 className="text-base font-bold text-bone mb-6">How it works</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
                {STEPS.map((s, i) => (
                  <div key={s.num} className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-cinema-red/30 bg-cinema-red/5 flex items-center justify-center mb-3">
                      <span className="text-cinema-red font-bold text-xs">{s.num}</span>
                    </div>
                    <h4 className="text-sm font-bold text-bone mb-1">{s.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                    {/* Connecting line */}
                    {i < STEPS.length - 1 && (
                      <div className="hidden sm:block absolute top-4 left-10 w-[calc(100%-16px)] border-t border-dashed border-border/40" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Find Your Crew */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-bone">Find Your Crew</h2>
                  <p className="text-xs text-muted mt-0.5">Join groups, meet your people, and start sharing great picks.</p>
                </div>
                <Link href="/groups" className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors shrink-0 ml-4 font-medium">View all groups →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MOCK_GROUPS.map(g => (
                  <div key={g.name} className="rounded-2xl bg-surface border border-border overflow-hidden card-hover flex flex-col group">
                    {/* Group header with gradient */}
                    <div className={`h-20 ${g.gradient} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                      <div className="absolute bottom-0 left-4 translate-y-1/2 w-11 h-11 rounded-xl bg-ink border-2 border-surface flex items-center justify-center text-lg shadow-lg z-10">{g.emoji}</div>
                    </div>
                    <div className="p-5 pt-8 flex flex-col flex-1">
                      <h3 className="font-bold text-bone text-[15px] mb-1">{g.name}</h3>
                      <p className="text-xs text-muted mb-3 flex-1 leading-relaxed">{g.desc}</p>
                      <p className="text-[11px] text-bone/60 font-medium mb-3">{g.members} members</p>
                      <div className="flex gap-2">
                        <Link href="/groups" className="flex-1 py-2 bg-cinema-red/10 border border-cinema-red/20 text-cinema-red text-xs font-bold rounded-lg text-center hover:bg-cinema-red/15 transition-colors btn-press">Join group</Link>
                        <Link href="/groups" className="py-2 px-3 text-muted text-xs font-medium hover:text-bone transition-colors">Preview</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Popular Picks */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-bone">Popular picks to start with</h2>
                  <p className="text-xs text-muted mt-0.5">Invite your crew to make this section personal.</p>
                </div>
                <Link href="/explore" className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors shrink-0 ml-4 font-medium">See all picks →</Link>
              </div>
              <div className="flex gap-3.5 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {popularPicks.length > 0 ? popularPicks.map(title => (
                  <Link href={`/title/${title.id}?type=${title.type}`} key={title.id} className="w-[140px] sm:w-[155px] shrink-0 snap-start block group">
                    <div className={`aspect-[2/3] rounded-xl overflow-hidden relative cursor-pointer border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                      {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                    </div>
                    <p className="text-xs text-bone font-medium mt-2 truncate">{title.title}</p>
                    <p className="text-[10px] text-muted">{title.releaseYear} · {title.type === 'movie' ? 'Movie' : 'Series'}</p>
                  </Link>
                )) : (
                  [1,2,3,4,5,6].map(i => (
                    <div key={i} className="w-[140px] sm:w-[155px] shrink-0 snap-start">
                      <div className="aspect-[2/3] rounded-xl bg-surface border border-border/50 animate-pulse" />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── Right Sidebar ── */}
          {renderSidebar()}
        </div>

      ) : (
        /* ═══════════════════ ACTIVE USER STATE ═══════════════════ */
        <>
          {pendingVerdicts.length > 0 && <VerdictCarousel recommendations={pendingVerdicts} />}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

            {/* ── Main Column ── */}
            <div className="space-y-10 min-w-0">

              {/* From Your Crew */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-bone">From Your Crew</h2>
                  <Link href="/explore" className="text-xs text-muted hover:text-bone transition-colors font-medium">Explore all</Link>
                </div>
                {crewRecommendations.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                    {crewRecommendations.map(rec => {
                      const title = getTitle(rec.titleId);
                      const recommender = getUser(rec.recommendedBy);
                      if (!title) return null;
                      return (
                        <Link href={`/title/${title.id}?recId=${rec.id}`} key={rec.id} className="w-[220px] shrink-0 snap-start block group">
                          <div className={`aspect-[2/3] rounded-xl overflow-hidden relative cursor-pointer border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 poster-overlay-strong" />
                            <div className="absolute bottom-3 left-3 right-3">
                              {recommender && <p className="text-[10px] font-semibold text-cinema-red/90 mb-1 drop-shadow-md truncate">Rec&apos;d by {recommender.displayName}</p>}
                              <p className="text-base font-bold text-bone drop-shadow-lg leading-tight line-clamp-2">{title.title}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface/30">
                    <p className="text-sm text-muted">Your crew hasn&apos;t recommended anything recently.</p>
                    <button onClick={() => setInviteOpen(true)} className="mt-4 px-4 py-2 bg-ink border border-border text-bone text-xs font-semibold rounded-lg hover:bg-surface transition-colors btn-press">Invite more friends</button>
                  </div>
                )}
              </section>

              {/* Continue Your Watchlist */}
              {watchlist && watchlist.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-bone">Continue your watchlist</h2>
                    <Link href="/watchlist" className="text-xs text-muted hover:text-bone transition-colors font-medium">View all</Link>
                  </div>
                  <div className="flex gap-3.5 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                    {watchlist.slice(0, 6).map(item => {
                      const title = getTitle(item.titleId);
                      if (!title) return null;
                      return (
                        <Link href={`/title/${title.id}`} key={item.id} className="w-[140px] shrink-0 snap-start block group">
                          <div className={`aspect-[2/3] rounded-xl overflow-hidden relative cursor-pointer border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-surface'}`}>
                            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            {renderSidebar()}
          </div>
        </>
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
