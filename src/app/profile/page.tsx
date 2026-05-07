'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import TasteScoreRing from '@/components/TasteScoreRing';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { getTasteLabel, ACHIEVEMENT_BADGE_DESCRIPTIONS } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

type TabType = 'overview' | 'given' | 'received' | 'rated' | 'watchlist' | 'badges';

export default function ProfilePage() {
  const { 
    currentUser, tasteScore, getUserBadges, watchlist, recommendations, 
    ratings, groups, groupMembers, getTitle, getUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!currentUser) return null;

  // Data processing
  const badges = getUserBadges(currentUser.id);
  const sent = recommendations.filter(r => r.recommendedBy === currentUser.id);
  const received = recommendations.filter(r => r.recommendedToUserIds?.includes(currentUser.id));
  const myRatings = ratings.filter(r => r.ratedBy === currentUser.id);
  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser.id).map(gm => gm.groupId);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));
  
  // Helpers
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-cinema-red text-sm">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'opacity-100' : 'opacity-30'}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-24 lg:pb-12 page-enter">
      {/* 1. PROFILE HERO */}
      <div className="relative w-full rounded-b-3xl overflow-hidden mb-8 border-b border-border bg-ink">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cinema-red/20 via-background to-background opacity-60" />
        
        <div className="relative z-10 px-4 sm:px-8 pt-12 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          <div className="shrink-0 p-1 rounded-full bg-surface border border-border/50 shadow-2xl">
            <UserAvatar name={currentUser.displayName} size="xl" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold font-editorial text-bone tracking-tight mb-1">
              {currentUser.displayName}
            </h1>
            <p className="text-cinema-red font-medium mb-3">@{currentUser.username}</p>
            <p className="text-sm text-bone/80 max-w-lg mx-auto md:mx-0 mb-4 leading-relaxed">
              &ldquo;{currentUser.bio}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center px-3 py-1 bg-cinema-red/10 border border-cinema-red/20 rounded-lg text-xs font-bold text-cinema-red uppercase tracking-widest">
                {currentUser.tasteArchetype}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-surface border border-border rounded-lg text-xs font-bold text-bone uppercase tracking-widest">
                {getTasteLabel(tasteScore.score)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-surface border border-border text-bone font-bold rounded-xl btn-press hover:bg-surface-hover text-sm">
              Edit Profile
            </button>
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-cinema-red text-bone font-bold rounded-xl btn-press hover:bg-cinema-red/90 text-sm">
              Invite Crew
            </button>
          </div>
        </div>
      </div>

      {/* STATS STRIP (Mobile only, desktop moves to sidebar) */}
      <div className="md:hidden px-4 mb-8">
         <div className="grid grid-cols-4 gap-2 bg-surface border border-border rounded-2xl p-4">
           <div className="text-center">
             <p className="text-xl font-bold text-bone">{tasteScore.score}</p>
             <p className="text-[10px] text-muted uppercase tracking-wider">Score</p>
           </div>
           <div className="text-center">
             <p className="text-xl font-bold text-bone">{sent.length}</p>
             <p className="text-[10px] text-muted uppercase tracking-wider">Given</p>
           </div>
           <div className="text-center">
             <p className="text-xl font-bold text-bone">{myRatings.length}</p>
             <p className="text-[10px] text-muted uppercase tracking-wider">Rated</p>
           </div>
           <div className="text-center">
             <p className="text-xl font-bold text-bone">{badges.length}</p>
             <p className="text-[10px] text-muted uppercase tracking-wider">Badges</p>
           </div>
         </div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 min-w-0">
          
          {/* TABS */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-border mb-8 pb-px gap-6">
            {(['overview', 'given', 'received', 'rated', 'watchlist', 'badges'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab ? 'text-bone' : 'text-muted hover:text-bone/80'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              
              {/* Recent Given */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Recs Given</h2>
                  <button onClick={() => setActiveTab('given')} className="text-xs font-bold text-cinema-red hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {sent.slice(0, 3).map(rec => {
                    const title = getTitle(rec.titleId);
                    const toUser = rec.recommendedToUserIds?.[0] ? getUser(rec.recommendedToUserIds[0]) : null;
                    if (!title) return null;
                    return (
                      <div key={rec.id} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border">
                        <div className={`w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                          {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col">
                           <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-bone truncate pr-4">{title.title}</h3>
                             <StatusBadge status={rec.status} />
                           </div>
                           <p className="text-xs text-muted mb-2">Recommended to {toUser?.displayName || 'Group'}</p>
                           <p className="text-sm text-bone/80 italic line-clamp-2 mb-auto">&ldquo;{rec.reason}&rdquo;</p>
                           {rec.primaryStamp && (
                             <div className="mt-2">
                               <StampBadge stamp={rec.primaryStamp} size="xs" variant="filled" />
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                  {sent.length === 0 && (
                    <div className="p-8 text-center bg-surface border border-border rounded-2xl">
                       <p className="text-muted text-sm mb-3">You haven&apos;t put your taste on the line yet.</p>
                       <Link href="/home" className="text-cinema-red font-bold text-sm">Recommend something</Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Rated */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Ratings</h2>
                  <button onClick={() => setActiveTab('rated')} className="text-xs font-bold text-cinema-red hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {myRatings.slice(0, 3).map(rating => {
                    const rec = recommendations.find(r => r.id === rating.recommendationId);
                    const title = rec ? getTitle(rec.titleId) : null;
                    const recommender = rec ? getUser(rec.recommendedBy) : null;
                    if (!title) return null;
                    return (
                      <div key={rating.id} className="p-4 rounded-2xl bg-surface border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-bone text-sm">{title.title}</h3>
                            <p className="text-xs text-muted">from {recommender?.displayName || 'Unknown'}</p>
                          </div>
                          {renderStars(rating.contentRating)}
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-bone/80 italic mb-3">&ldquo;{rating.comment}&rdquo;</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 bg-ink rounded border border-border text-muted">{rating.recommendationResult}</span>
                          {rating.stamp && <StampBadge stamp={rating.stamp} size="xs" />}
                        </div>
                      </div>
                    );
                  })}
                  {myRatings.length === 0 && (
                    <div className="p-8 text-center bg-surface border border-border rounded-2xl">
                       <p className="text-muted text-sm">No verdicts given yet.</p>
                    </div>
                  )}
                </div>
              </section>
              
            </div>
          )}

          {/* TAB CONTENT: GIVEN */}
          {activeTab === 'given' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-lg font-bold text-bone">Recommendations Given</h2>
                   <p className="text-sm text-muted">Everything you&apos;ve put your taste on the line for.</p>
                 </div>
                 <div className="flex gap-2">
                   {/* Placeholder for filters */}
                   <select className="bg-surface border border-border text-bone text-xs rounded-lg px-3 py-2 outline-none focus:border-cinema-red">
                     <option>All Statuses</option>
                     <option>Pending</option>
                     <option>Rated</option>
                   </select>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {sent.map(rec => {
                    const title = getTitle(rec.titleId);
                    const toUser = rec.recommendedToUserIds?.[0] ? getUser(rec.recommendedToUserIds[0]) : null;
                    if (!title) return null;
                    return (
                      <Link href={`/recommend/${rec.id}`} key={rec.id} className="flex flex-col p-4 rounded-2xl bg-surface border border-border hover:border-border-strong transition-colors group">
                        <div className="flex gap-4 mb-3">
                          <div className={`w-12 h-16 shrink-0 rounded overflow-hidden border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-bone truncate text-sm mb-1">{title.title}</h3>
                             <p className="text-xs text-muted truncate mb-1">{title.releaseYear} · {title.format}</p>
                             <p className="text-[10px] font-bold text-cinema-red">TO {toUser?.displayName?.toUpperCase() || 'GROUP'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-bone/80 italic line-clamp-2 mb-3 flex-1">&ldquo;{rec.reason}&rdquo;</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                           <StatusBadge status={rec.status} />
                           {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="xs" variant="filled" />}
                        </div>
                      </Link>
                    );
                 })}
               </div>
            </div>
          )}

          {/* TAB CONTENT: RECEIVED */}
          {activeTab === 'received' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="mb-6">
                 <h2 className="text-lg font-bold text-bone">Recommendations Received</h2>
                 <p className="text-sm text-muted">Picks your crew thought were worth your time.</p>
               </div>
               
               <div className="space-y-3">
                 {received.map(rec => {
                    const title = getTitle(rec.titleId);
                    const fromUser = getUser(rec.recommendedBy);
                    if (!title) return null;
                    return (
                      <div key={rec.id} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border">
                        <div className={`w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                          {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col">
                           <div className="flex justify-between items-start mb-1">
                             <div>
                               <h3 className="font-bold text-bone truncate pr-4">{title.title}</h3>
                               <p className="text-xs text-muted mb-2">from {fromUser?.displayName}</p>
                             </div>
                             <StatusBadge status={rec.status} />
                           </div>
                           <p className="text-sm text-bone/80 italic line-clamp-1 mb-auto">&ldquo;{rec.reason}&rdquo;</p>
                           <div className="mt-3 flex gap-2">
                             {rec.status === 'pending' && (
                               <Link href={`/recommend/${rec.id}`} className="px-4 py-1.5 bg-cinema-red text-bone text-xs font-bold rounded-lg hover:bg-cinema-red/90">View Rec</Link>
                             )}
                             {rec.status === 'watched' && (
                               <Link href={`/recommend/${rec.id}`} className="px-4 py-1.5 bg-cinema-red text-bone text-xs font-bold rounded-lg hover:bg-cinema-red/90">Rate It</Link>
                             )}
                             {rec.status === 'rated' && rec.primaryStamp && (
                               <StampBadge stamp={rec.primaryStamp} size="xs" />
                             )}
                           </div>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}

          {/* TAB CONTENT: RATED */}
          {activeTab === 'rated' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="mb-6">
                 <h2 className="text-lg font-bold text-bone">Ratings Given</h2>
                 <p className="text-sm text-muted">The verdicts you&apos;ve handed out.</p>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                 {myRatings.map(rating => {
                    const rec = recommendations.find(r => r.id === rating.recommendationId);
                    const title = rec ? getTitle(rec.titleId) : null;
                    const fromUser = rec ? getUser(rec.recommendedBy) : null;
                    if (!title) return null;
                    return (
                      <div key={rating.id} className="p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row gap-5">
                         <div className={`w-12 h-16 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                         </div>
                         <div className="flex-1">
                           <div className="flex justify-between items-start mb-2">
                             <div>
                               <h3 className="font-bold text-bone text-base">{title.title}</h3>
                               <p className="text-xs text-muted mb-2">Rec&apos;d by {fromUser?.displayName}</p>
                             </div>
                             {renderStars(rating.contentRating)}
                           </div>
                           <div className="flex flex-wrap items-center gap-2 mb-3">
                             <span className="text-xs font-bold px-2 py-1 bg-ink rounded border border-border text-muted">{rating.recommendationResult}</span>
                             {rating.stamp && <StampBadge stamp={rating.stamp} size="xs" />}
                           </div>
                           {rating.comment && (
                             <div className="bg-ink p-3 rounded-xl border border-border/50 relative">
                               <span className="text-cinema-red text-xl absolute top-2 left-2 font-serif opacity-30">"</span>
                               <p className="text-sm text-bone/90 italic relative z-10 pl-4">&nbsp;{rating.comment}</p>
                             </div>
                           )}
                         </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}

          {/* TAB CONTENT: WATCHLIST */}
          {activeTab === 'watchlist' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="mb-6">
                 <h2 className="text-lg font-bold text-bone">Watchlist</h2>
                 <p className="text-sm text-muted">Saved for later.</p>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {watchlist.map(item => {
                    const title = getTitle(item.titleId);
                    if (!title) return null;
                    return (
                      <Link href={`/title/${title.id}`} key={item.id} className="group cursor-pointer">
                        <div className={`aspect-[2/3] w-full rounded-xl overflow-hidden relative border border-border/50 group-hover:border-border-strong mb-2 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                          {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                          {item.stamp && (
                            <div className="absolute top-2 left-2">
                              <StampBadge stamp={item.stamp} size="xs" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-bone truncate">{title.title}</h3>
                        {item.recommendedBy && (
                          <p className="text-[10px] text-cinema-red truncate">Rec&apos;d by {getUser(item.recommendedBy)?.displayName}</p>
                        )}
                      </Link>
                    );
                 })}
               </div>
            </div>
          )}

          {/* TAB CONTENT: BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="mb-6">
                 <h2 className="text-lg font-bold text-bone">Badges Earned</h2>
                 <p className="text-sm text-muted">Receipts for your good taste.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {badges.map(badge => (
                   <div key={badge.id} className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-4">
                     <div className="shrink-0 mt-1">
                       <StampBadge stamp={badge.badgeType} size="md" variant="filled" />
                     </div>
                     <div>
                       <h3 className="font-bold text-bone text-sm mb-1">{badge.badgeType}</h3>
                       <p className="text-xs text-muted leading-relaxed">
                         {ACHIEVEMENT_BADGE_DESCRIPTIONS[badge.badgeType as keyof typeof ACHIEVEMENT_BADGE_DESCRIPTIONS] || 'An achievement badge.'}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>

        {/* SIDEBAR (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-8">
          
          {/* TASTE SCORE CARD */}
          <div className="rounded-3xl bg-surface border border-border overflow-hidden">
            <div className="p-6 border-b border-border text-center flex flex-col items-center">
              <TasteScoreRing score={tasteScore.score} size="lg" />
              <h2 className="text-xl font-bold font-editorial text-bone mt-4">{getTasteLabel(tasteScore.score)}</h2>
              <p className="text-sm text-muted mt-1">Your recommendations usually land.</p>
            </div>
            <div className="p-6 bg-ink/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted uppercase tracking-widest font-semibold">Best Category</span>
                <span className="text-sm font-bold text-bone">Psychological Thrillers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted uppercase tracking-widest font-semibold">Most Trusted By</span>
                <span className="text-sm font-bold text-cinema-red">{tasteScore.mostTrustedBy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted uppercase tracking-widest font-semibold">Recent Trend</span>
                <span className="text-sm font-bold text-green-500">+8 this month</span>
              </div>
            </div>
          </div>

          {/* FAVORITE CATEGORIES */}
          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Favorite Categories</h3>
              <button className="text-[10px] font-bold text-cinema-red">EDIT</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted mb-2 uppercase">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {['Mystery', 'Thriller', 'Drama', 'Sci-fi'].map(g => (
                    <span key={g} className="px-2.5 py-1 bg-ink border border-border rounded text-xs text-bone/80">{g}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted mb-2 uppercase">Moods</p>
                <div className="flex flex-wrap gap-2">
                  {['Slow burn', 'Emotional', 'Mind-bending'].map(g => (
                    <span key={g} className="px-2.5 py-1 bg-ink border border-border rounded text-xs text-bone/80">{g}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted mb-2 uppercase">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {['Netflix', 'MUBI', 'Prime Video'].map(g => (
                    <span key={g} className="px-2.5 py-1 bg-ink border border-border rounded text-xs text-bone/80">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BADGES (Compact Sidebar view) */}
          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Badges</h3>
              <button onClick={() => setActiveTab('badges')} className="text-[10px] font-bold text-cinema-red">VIEW ALL</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map(b => (
                <StampBadge key={b.id} stamp={b.badgeType} size="xs" variant="outline" />
              ))}
            </div>
          </div>

          {/* CREWS */}
          <div className="rounded-2xl bg-surface border border-border p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Crews</h3>
            <div className="space-y-3">
              {myGroups.map(g => (
                <Link href={`/groups/${g.id}`} key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink border border-border hover:border-border-strong transition-colors">
                  <div className={`w-10 h-10 rounded-lg shrink-0 poster-gradient-${g.avatarGradient}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-bone truncate">{g.name}</p>
                    <p className="text-[10px] text-muted uppercase">{g.vibe}</p>
                  </div>
                </Link>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 bg-surface-hover border border-border text-bone text-xs font-bold rounded-xl btn-press">
              Explore Crews
            </button>
          </div>

          {/* INVITE CTA */}
          <div className="rounded-2xl bg-cinema-red/10 border border-cinema-red/20 p-6 text-center">
            <h3 className="text-base font-bold text-bone mb-2">Bring your crew in.</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Rec&apos;d gets better when your friends start recommending too.
            </p>
            <button className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl text-sm hover:bg-cinema-red/90 transition-colors btn-press">
              Invite friends
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
