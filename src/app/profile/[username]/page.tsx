'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useState, useMemo } from 'react';
import UserAvatar from '@/components/UserAvatar';
import AddToCrewButton from '@/components/AddToCrewButton';
import StampBadge from '@/components/StampBadge';
import { getTasteLabel, ACHIEVEMENT_BADGE_DESCRIPTIONS } from '@/lib/types';
import Link from 'next/link';
import TasteScoreRing from '@/components/TasteScoreRing';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBackLink from '@/components/MobileBackLink';
import TasteProfileCard from '@/components/profile/TasteProfileCard';

export default function PublicProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { 
    getUserByUsername, currentUser, recommendations, ratings, getTitle, 
    getUser, getMutualGroups, watchlistLists, getUserBadges, openRecommendModal
  } = useApp();


  const profileUser = useMemo(() => getUserByUsername(username as string), [username, getUserByUsername]);

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-4xl font-bold text-bone font-editorial mb-4">User not found</h1>
        <p className="text-muted mb-8">This user doesn&apos;t exist or has changed their handle.</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-cinema-red text-bone font-bold rounded-xl">Go back</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  if (isOwnProfile) {
    router.replace('/profile');
    return null;
  }

  // Data processing for public profile
  const badges = getUserBadges(profileUser.id);
  const publicRecommendations = recommendations.filter(r => r.recommendedBy === profileUser.id);
  const publicLists = watchlistLists.filter(l => l.userId === profileUser.id && l.privacy !== 'private');
  const mutualGroups = getMutualGroups(profileUser.id);

  return (
    <div className="max-w-[1200px] mx-auto pb-24 lg:pb-12 page-enter">
      {/* Navigation Layer */}
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Profile', href: '/profile' },
          { label: profileUser.displayName, isCurrent: true }
        ]} />
        <MobileBackLink label="Profile" href="/profile" />
      </div>
      {/* 1. PROFILE HERO */}
      <div className="relative w-full rounded-b-[48px] overflow-hidden mb-12 border-b border-border bg-ink min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cinema-red/10 via-background to-background opacity-40 z-0" />
        
        <div className="relative z-10 px-8 py-16 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 w-full">
          <div className="shrink-0 p-1.5 rounded-full bg-surface border border-border/50 shadow-2xl scale-110">
            <UserAvatar name={profileUser.displayName} size="xl" />
          </div>
          
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-5xl md:text-6xl font-bold font-editorial text-bone tracking-tight mb-2">
              {profileUser.displayName}
            </h1>
            <p className="text-cinema-red font-medium text-lg mb-6">@{profileUser.username}</p>
            <p className="text-lg text-bone/90 max-w-2xl mx-auto md:mx-0 mb-8 leading-relaxed font-medium italic">
              &ldquo;{profileUser.bio}&rdquo;
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
              <span className="px-4 py-1.5 bg-cinema-red/10 border border-cinema-red/20 rounded-xl text-xs font-bold text-cinema-red uppercase tracking-widest">
                {profileUser.tasteArchetype}
              </span>
              {mutualGroups.length > 0 && (
                <span className="px-4 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-muted uppercase tracking-widest">
                  {mutualGroups.length} mutual crews
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <AddToCrewButton userId={profileUser.id} username={profileUser.username} className="text-sm px-10 py-4" />
              <button 
                onClick={() => openRecommendModal({ recipientId: profileUser.id })}
                className="px-10 py-4 bg-ink border border-border text-bone font-bold rounded-xl hover:bg-surface transition-all active:scale-95 shadow-xl"
              >
                Recommend something
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Public Lists */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Public Lists</h2>
            </div>
            {publicLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publicLists.map(list => (
                  <Link 
                    href={`/watchlist/${list.id}`} 
                    key={list.id}
                    className="bg-surface border border-border rounded-[32px] p-6 hover:border-border-strong transition-all group flex items-center gap-5"
                  >
                    <div className="w-20 h-28 bg-ink rounded-xl border border-border shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">📚</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-bone group-hover:text-cinema-red transition-colors truncate">{list.name}</h3>
                      <p className="text-xs text-muted mb-4 line-clamp-2">{list.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-bone/60 uppercase tracking-widest">{list.titleIds.length} titles</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[10px] font-bold text-cinema-red uppercase tracking-widest">Shared</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 px-8 bg-surface border border-border border-dashed rounded-[32px] text-center">
                <p className="text-muted text-sm italic">No public lists yet.</p>
              </div>
            )}
          </section>

          {/* Recent Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Recent Recommendations</h2>
            </div>
            <div className="space-y-4">
              {publicRecommendations.length > 0 ? (
                publicRecommendations.slice(0, 5).map(rec => {
                  const title = getTitle(rec.titleId);
                  if (!title) return null;
                  return (
                    <div key={rec.id} className="flex gap-6 p-6 rounded-[32px] bg-surface border border-border hover:border-border-strong transition-all">
                      <Link href={`/title/${title.id}`} className="w-20 h-32 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-ink">
                        {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <Link href={`/title/${title.id}`} className="font-bold text-xl text-bone hover:text-cinema-red transition-colors block truncate">
                               {title.title}
                             </Link>
                             <p className="text-xs text-muted uppercase font-bold tracking-widest mt-1">Rec&apos;d in {rec.groupId ? 'a Group' : 'Private'}</p>
                           </div>
                           {rec.primaryStamp && <StampBadge stamp={rec.primaryStamp} size="sm" />}
                         </div>
                         <p className="text-sm text-bone/80 italic line-clamp-2 mb-4 leading-relaxed">&ldquo;{rec.reason}&rdquo;</p>
                         <div className="mt-auto flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-ink rounded-lg border border-border text-muted">
                              Match Score: {rec.tasteMatchScore}%
                            </span>
                            <Link href={`/title/${title.id}`} className="text-xs font-bold text-bone hover:text-cinema-red transition-colors underline underline-offset-4">View Title</Link>
                         </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted italic text-center py-12">No public recommendations to show.</p>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Taste Snapshot */}
          <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-border text-center bg-gradient-to-b from-white/[0.02] to-transparent">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-6">Taste Snapshot</h3>
              <div className="flex flex-col items-center">
                <TasteScoreRing score={profileUser.tasteScore || 0} size="lg" />
                <h4 className="text-2xl font-bold font-editorial text-bone mt-6">{getTasteLabel(profileUser.tasteScore || 0)}</h4>
              </div>
            </div>
            <div className="p-8 space-y-6 bg-ink/30">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-muted font-bold uppercase tracking-widest">Best Genre</span>
                 <span className="text-sm font-bold text-bone">{profileUser.favoriteGenres?.[0] || 'Mystery'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-muted font-bold uppercase tracking-widest">Favorite Mood</span>
                 <span className="text-sm font-bold text-bone">{profileUser.favoriteMoods?.[0] || 'Slow Burn'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-muted font-bold uppercase tracking-widest">Trusted For</span>
                 <span className="text-sm font-bold text-cinema-red">Emotional Dramas</span>
               </div>
               <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-bone">{publicRecommendations.length}</p>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-tighter">Public Recs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-bone">{badges.length}</p>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-tighter">Badges</p>
                  </div>
               </div>
            </div>
          </div>


          {/* Badges Earned */}
          <div className="bg-surface border border-border rounded-[32px] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Badges Earned</h3>
              <span className="text-[10px] font-bold text-cinema-red">{badges.length}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {badges.map(badge => (
                <div key={badge.id} className="group relative">
                  <StampBadge stamp={badge.badgeType} size="xs" variant="filled" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-surface border border-border rounded-2xl shadow-2xl invisible group-hover:visible z-30 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-xs font-bold text-bone mb-1">{badge.badgeType}</p>
                    <p className="text-[10px] text-muted leading-relaxed">
                      {ACHIEVEMENT_BADGE_DESCRIPTIONS[badge.badgeType as keyof typeof ACHIEVEMENT_BADGE_DESCRIPTIONS]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mutual Crews */}
          <div className="bg-surface border border-border rounded-[32px] p-8">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-6">Mutual Crews</h3>
            {mutualGroups.length > 0 ? (
              <div className="space-y-4">
                {mutualGroups.map(g => (
                  <Link href={`/groups/${g.id}`} key={g.id} className="flex items-center gap-4 p-4 rounded-2xl bg-ink border border-border hover:border-border-strong transition-colors group">
                    <div className={`w-12 h-12 rounded-xl shrink-0 poster-gradient-${g.avatarGradient}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{g.name}</p>
                      <p className="text-[10px] text-muted uppercase tracking-widest font-medium">Mutual Group</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No mutual crews yet.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
