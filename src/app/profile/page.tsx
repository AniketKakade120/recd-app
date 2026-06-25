'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import TasteScoreRing from '@/components/TasteScoreRing';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { getTasteLabel, ACHIEVEMENT_BADGE_DESCRIPTIONS } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

import ProfileCrewTab from '@/components/ProfileCrewTab';
import EditProfileModal from '@/components/EditProfileModal';
import EditPreferencesModal from '@/components/EditPreferencesModal';
import InviteModal from '@/components/InviteModal';
import { useRouter } from 'next/navigation';
import VerdictModal from '@/components/VerdictModal';
import TasteProfileCard from '@/components/profile/TasteProfileCard';

type TabType = 'overview' | 'given' | 'received' | 'rated' | 'crew' | 'watchlist' | 'badges';

export default function ProfilePage() {
  const { 
    currentUser, tasteScore, getUserBadges, watchlist, recommendations, 
    ratings, groups, groupMembers, getTitle, getUser, getViewerContext, getActions,
    userPreferences, openGiveVerdictModal, logout, cancelRecommendation
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditPrefsModal, setShowEditPrefsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [recToRevoke, setRecToRevoke] = useState<string | null>(null);
  const router = useRouter();

  if (!currentUser) return null;

  // Data processing
  const badges = getUserBadges(currentUser.id);
  const given = recommendations.filter(r => r.recommendedBy === currentUser.id);
  const received = recommendations.filter(r => r.recommendedToUserIds?.includes(currentUser.id));
  const myRatedRecIds = new Set(ratings.filter(rat => rat.ratedBy === currentUser.id).map(rat => rat.recommendationId));
  const pending = received.filter(r => !myRatedRecIds.has(r.id));
  const givenVerdicts = received.filter(r => myRatedRecIds.has(r.id));
  const rated = ratings.filter(r => r.ratedBy === currentUser.id);
  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser.id).map(gm => gm.groupId);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));

  const openVerdict = (recId: string) => {
    setSelectedRecId(recId);
    setVerdictModalOpen(true);
  };
  
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
                {tasteScore.label}
              </span>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <Link 
              href="/journal"
              className="flex-1 md:flex-none px-6 py-2.5 bg-cinema-red text-bone font-bold rounded-xl btn-press hover:bg-cinema-red/90 text-sm flex items-center justify-center gap-2 shadow-lg shadow-cinema-red/20"
            >
              Verdict Journal
            </Link>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="flex-1 md:flex-none px-6 py-2.5 bg-surface border border-border text-bone font-bold rounded-xl btn-press hover:bg-surface-hover text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="flex-1 md:flex-none px-6 py-2.5 bg-ink border border-border text-muted hover:text-cinema-red transition-colors font-bold rounded-xl btn-press text-sm flex items-center justify-center"
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS STRIP (Mobile only, desktop moves to sidebar) */}
      <div className="md:hidden px-4 mb-8">
          <div className="grid grid-cols-3 gap-2 bg-surface border border-border rounded-2xl p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-bone">{tasteScore.score}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Score</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-bone">{given.length}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Picks</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-bone">{givenVerdicts.length}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Verdicts</p>
            </div>
          </div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 min-w-0">
          
          {/* TABS */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-border mb-8 pb-px gap-6">
            {(['overview', 'given', 'received', 'rated', 'crew'] as TabType[]).map(tab => (
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
                            {/* Recent Picks Given */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Picks</h2>
                  <button onClick={() => setActiveTab('given')} className="text-xs font-bold text-cinema-red hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {given.slice(0, 3).map(rec => {
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
                             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 bg-white/5 text-muted">
                               {rec.verdictState === 'verdict_given' ? 'Verdict Given' : 'Verdict Pending'}
                             </span>
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
                  {given.length === 0 && (
                    <div className="p-8 text-center bg-surface border border-border rounded-2xl">
                       <p className="text-muted text-sm mb-3">You haven&apos;t put your taste on the line yet.</p>
                       <Link href="/home" className="text-cinema-red font-bold text-sm">Recommend something</Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Verdicts Given */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Verdicts</h2>
                  <button onClick={() => setActiveTab('rated')} className="text-xs font-bold text-cinema-red hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {givenVerdicts.slice(0, 3).map(rec => {
                    const rating = ratings.find(rat => rat.recommendationId === rec.id);
                    const title = getTitle(rec.titleId);
                    const recommender = getUser(rec.recommendedBy);
                    if (!title) return null;
                    return (
                      <div key={rec.id} className="p-4 rounded-2xl bg-surface border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-bone text-sm">{title.title}</h3>
                            <p className="text-xs text-muted">from {recommender?.displayName || 'Unknown'}</p>
                          </div>
                          {rating && renderStars(rating.contentRating)}
                        </div>
                        {rating?.comment && (
                          <p className="text-sm text-bone/80 italic mb-3">&ldquo;{rating.comment}&rdquo;</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 bg-ink rounded border border-border text-muted">{rating?.recommendationResult || 'Rated'}</span>
                          {rating?.stamp && <StampBadge stamp={rating.stamp} size="xs" />}
                           <button 
                             onClick={(e) => { e.preventDefault(); openVerdict(rec.id); }}
                             className="text-[10px] font-bold text-cinema-red hover:underline uppercase tracking-widest ml-auto"
                           >
                             View Verdict
                           </button>
                         </div>
                      </div>
                    );
                  })}
                  {givenVerdicts.length === 0 && (
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
                   <p className="text-sm text-muted">Everything you&apos;ve recommended to your crew.</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {given.map(rec => {
                     const title = getTitle(rec.titleId);
                     const toUser = rec.recommendedToUserIds?.[0] ? getUser(rec.recommendedToUserIds[0]) : null;
                     const viewerContext = getViewerContext(rec);
                     if (!title) return null;

                     return (
                       <div key={rec.id} className="flex flex-col p-4 rounded-2xl bg-surface border border-border group relative">
                         <Link href={`/title/${rec.titleId}?recId=${rec.id}`} className="flex gap-4 mb-3">
                           <div className={`w-12 h-16 shrink-0 rounded overflow-hidden border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                             {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-bone truncate text-sm mb-1">{title.title}</h3>
                              <p className="text-xs text-muted truncate mb-1">{title.releaseYear} · {title.format}</p>
                              <p className="text-[10px] font-bold text-cinema-red">TO {toUser?.displayName?.toUpperCase() || 'GROUP'}</p>
                           </div>
                         </Link>
                         <p className="text-xs text-bone/80 italic line-clamp-2 mb-3 flex-1">&ldquo;{rec.reason}&rdquo;</p>
                         <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                             {viewerContext.verdictState === 'verdict_given' ? (
                               <button 
                                 onClick={() => openVerdict(rec.id)}
                                 className="w-full px-3 py-1.5 bg-white/5 border border-white/10 text-bone text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-white/10 transition-all text-center"
                               >
                                 View Verdict
                               </button>
                             ) : (
                               <div className="w-full flex items-center justify-between">
                                 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-white/5 bg-white/5 text-muted">
                                   Verdict Pending
                                 </span>
                                 <button 
                                   onClick={() => {
                                     setRecToRevoke(rec.id);
                                     setRevokeModalOpen(true);
                                   }}
                                   className="text-[10px] font-bold uppercase tracking-wider text-cinema-red hover:text-cinema-red/80 hover:underline px-2 py-1 transition-all"
                                 >
                                   Revoke
                                 </button>
                               </div>
                             )}
                         </div>
                       </div>
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
                     const actions = getActions(rec);
                     if (!title) return null;

                     return (
                       <div key={rec.id} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border group">
                         <Link href={`/title/${rec.titleId}?recId=${rec.id}`} className="w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-ink">
                           {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                         </Link>
                         <div className="flex-1 min-w-0 py-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <Link href={`/title/${rec.titleId}?recId=${rec.id}`} className="font-bold text-bone truncate pr-4 hover:text-cinema-red transition-colors block">
                                  {title.title}
                                </Link>
                                <p className="text-xs text-muted mb-2">from {fromUser?.displayName}</p>
                              </div>
                               <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 bg-white/5 text-muted">
                                 {myRatedRecIds.has(rec.id) ? 'Verdict Given' : 'Verdict Pending'}
                               </span>
                            </div>
                            <p className="text-sm text-bone/80 italic line-clamp-1 mb-auto leading-relaxed">&ldquo;{rec.reason}&rdquo;</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                               {actions.primary && (
                                 <button 
                                   onClick={() => {
                                     if (actions.primary?.action === 'view_verdict') openVerdict(rec.id);
                                     else openGiveVerdictModal(rec.id);
                                   }} 
                                   className="px-4 py-2 bg-cinema-red text-bone text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/10"
                                 >
                                   {actions.primary.label}
                                 </button>
                               )}
                               {actions.secondary && (
                                 <button 
                                   onClick={() => {
                                     if (actions.secondary?.action === 'view_verdict') openVerdict(rec.id);
                                     else if (actions.secondary?.action === 'edit_verdict') openGiveVerdictModal(rec.id, true);
                                     else router.push(`/title/${rec.titleId}?recId=${rec.id}`);
                                   }}
                                   className="px-4 py-2 bg-white/5 border border-white/10 text-bone/70 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                                 >
                                   {actions.secondary.label}
                                 </button>
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
                 <p className="text-sm text-muted">The social feedback you&apos;ve given to your crew.</p>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  {rated.map(rating => {
                     const rec = recommendations.find(r => r.id === rating.recommendationId);
                     const title = rec ? getTitle(rec.titleId) : null;
                     const fromUser = rec ? getUser(rec.recommendedBy) : null;
                     if (!title) return null;
                     return (
                       <div key={rating.id} className="p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row gap-5">
                          <Link href={`/title/${title.id}?recId=${rec?.id}`} className="w-12 h-16 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-ink">
                             {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                          </Link>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-bone text-base">{title.title}</h3>
                                <p className="text-xs text-muted mb-2">Rec&apos;d by {fromUser?.displayName}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {renderStars(rating.contentRating)}
                                 <button 
                                   onClick={() => openVerdict(rec!.id)}
                                   className="px-3 py-1 bg-white/5 border border-white/10 text-bone/60 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-white/10 transition-all"
                                 >
                                   View Verdict
                                 </button>
                              </div>
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

          {/* TAB CONTENT: CREW */}
          {activeTab === 'crew' && (
            <ProfileCrewTab />
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
          <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-border text-center flex flex-col items-center bg-gradient-to-b from-white/[0.02] to-transparent">
              <TasteScoreRing score={tasteScore.score} size="lg" />
              <h2 className="text-2xl font-bold font-editorial text-bone mt-4">{getTasteLabel(tasteScore.score)}</h2>
              <p className="text-sm text-muted mt-2 max-w-[240px]">
                Your recommendations usually land well with your crew.
              </p>
            </div>
            <div className="p-6 bg-ink/30 space-y-5">
              <div className="flex justify-between items-center group/stat">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted uppercase tracking-widest font-bold">Response Rate</span>
                  <div className="group relative">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/40 cursor-help"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface border border-border rounded-lg text-[10px] text-muted invisible group-hover:visible shadow-xl">
                      Percentage of your recommendations that actually received a verdict.
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-bone">{tasteScore.responseRate}%</span>
              </div>
              
              <div className="flex justify-between items-center group/stat">
                <span className="text-xs text-muted uppercase tracking-widest font-bold">Avg. Impact</span>
                <span className="text-sm font-bold text-bone">{tasteScore.averageImpactScore}</span>
              </div>

              <div className="flex justify-between items-center group/stat">
                <span className="text-xs text-muted uppercase tracking-widest font-bold">Most Trusted By</span>
                <span className="text-sm font-bold text-cinema-red">{tasteScore.mostTrustedBy || 'New Crew'}</span>
              </div>

              <div className="flex justify-between items-center group/stat">
                <span className="text-xs text-muted uppercase tracking-widest font-bold">Trend</span>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                  <span className="text-sm font-bold text-green-500">Up</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-cinema-red/5 border-t border-cinema-red/10">
               <p className="text-[10px] text-cinema-red/70 font-bold uppercase tracking-widest text-center">
                 Based on {tasteScore.totalRecommendationsRated} rated recommendations
               </p>
            </div>
          </div>

          {/* TASTE PROFILE */}
          <TasteProfileCard 
            user={currentUser} 
            preferences={userPreferences} 
            onEdit={() => setShowEditPrefsModal(true)} 
          />

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
            <Link href="/groups" className="block w-full mt-4 py-2.5 bg-surface-hover border border-border text-bone text-xs font-bold rounded-xl btn-press text-center hover:bg-warm-grey transition-colors">
              Explore Crews
            </Link>
          </div>

          {/* INVITE CTA */}
          <div className="rounded-2xl bg-cinema-red/10 border border-cinema-red/20 p-6 text-center">
            <h3 className="text-base font-bold text-bone mb-2">Bring your crew in.</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Rec&apos;d gets better when your friends start recommending too.
            </p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl text-sm hover:bg-cinema-red/90 transition-colors btn-press"
            >
              Invite friends
            </button>
          </div>

        </div>
      </div>

      <EditProfileModal 
        isOpen={showEditProfileModal} 
        onClose={() => setShowEditProfileModal(false)} 
      />
      
      <EditPreferencesModal 
        isOpen={showEditPrefsModal} 
        onClose={() => setShowEditPrefsModal(false)} 
      />
      
      <InviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />

       {selectedRecId && (
         <VerdictModal 
           recommendationId={selectedRecId}
           isOpen={verdictModalOpen}
           onClose={() => setVerdictModalOpen(false)}
         />
       )}

      {/* REVOKE MODAL */}
      {revokeModalOpen && recToRevoke && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-xl font-bold text-bone mb-2 font-editorial tracking-tight">Revoke Recommendation?</h3>
            <p className="text-sm text-muted mb-6">Are you sure you want to revoke this recommendation? It will be permanently removed from their pending queue.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRevokeModalOpen(false);
                  setRecToRevoke(null);
                }}
                className="flex-1 px-4 py-2 bg-ink border border-border text-bone font-bold rounded-xl hover:bg-surface-hover transition-colors text-sm btn-press"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cancelRecommendation(recToRevoke);
                  setRevokeModalOpen(false);
                  setRecToRevoke(null);
                }}
                className="flex-1 px-4 py-2 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-colors text-sm shadow-lg shadow-cinema-red/20 btn-press"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
