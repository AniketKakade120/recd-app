'use client';

import { use, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { REC_ACCURACY_OPTIONS, type RecAccuracy, CORE_STAMPS, type StampType, type Title } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import AddToListModal from '@/components/AddToListModal';
import ClickableUserAvatar from '@/components/ClickableUserAvatar';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBackLink from '@/components/MobileBackLink';
import Link from 'next/link';
import VerdictModal from '@/components/VerdictModal';
import PlatformLogo from '@/components/PlatformLogo';
import InviteModal from '@/components/InviteModal';
import RecommendationCard from '@/components/RecommendationCard';
import MovieCard from '@/components/MovieCard';

export default function TitleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const recId = searchParams.get('recId');
  const source = searchParams.get('source');
  const listId = searchParams.get('listId');
  const groupId = searchParams.get('groupId');
  const router = useRouter();
  
  const { 
    getTitle, addTitle, getUser, recommendations, watchlist, currentUser, addRating,
    addToWatchlist, removeFromWatchlist, updateVerdictState,
    getViewerContext, getActions, crewConnections, ratings, addToast,
    groups, watchlistLists, openRecommendModal, openGiveVerdictModal
  } = useApp();

  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState(false);
  const [similarTitles, setSimilarTitles] = useState<Title[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Fetch from TMDB if this is a tmdb-prefixed ID and not in context yet
  useEffect(() => {
    const existingTitle = getTitle(id);
    const tmdbId = id.replace('tmdb-', '');
    const typeHint = searchParams.get('type') || existingTitle?.type; // 'movie' or 'series'

    async function fetchWithRetry(url: string, retries = 2): Promise<Response | null> {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(url);
          if (res.ok) return res;
          if (res.status === 400) return null; // Bad request, don't retry
          // For 500s, retry after a brief delay
          if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
        } catch {
          if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
        }
      }
      return null;
    }

    async function fetchSimilar(type: string) {
      setSimilarLoading(true);
      const res = await fetchWithRetry(`/api/tmdb/similar?tmdbId=${tmdbId}&type=${type}`);
      if (res) {
        const data = await res.json();
        setSimilarTitles(data);
      }
      setSimilarLoading(false);
    }

    async function fetchDetails() {
      if (!existingTitle && id.startsWith('tmdb-')) {
        setTmdbLoading(true);
        setTmdbError(false);
        
        // If we know the type, try that first
        const primaryType = typeHint === 'series' ? 'series' : 'movie';
        const fallbackType = primaryType === 'movie' ? 'series' : 'movie';

        let res = await fetchWithRetry(`/api/tmdb/details?tmdbId=${tmdbId}&type=${primaryType}`);
        if (res) {
          const data: Title = await res.json();
          addTitle(data);
          setTmdbLoading(false);
          fetchSimilar(primaryType);
          return;
        }

        // Fallback to other type
        res = await fetchWithRetry(`/api/tmdb/details?tmdbId=${tmdbId}&type=${fallbackType}`);
        if (res) {
          const data: Title = await res.json();
          addTitle(data);
          setTmdbLoading(false);
          fetchSimilar(fallbackType);
          return;
        }

        setTmdbError(true);
        setTmdbLoading(false);
      } else if (existingTitle && existingTitle.id.startsWith('tmdb-')) {
        // We already have the title details, just fetch similar
        fetchSimilar(existingTitle.type);
      }
    }

    fetchDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = getTitle(id);
  const recommendation = recId ? recommendations.find(r => r.id === recId) : null;
  const recommender = recommendation ? getUser(recommendation.recommendedBy) : null;
  const watchlistItem = watchlist.find(w => w.titleId === id);
  const isSaved = !!watchlistItem;

  // Breadcrumb Logic
  const breadcrumbItems = (() => {
    const items = [];
    
    if (source === 'watchlist') {
      items.push({ label: 'Watchlist', href: '/watchlist' });
      if (listId) {
        const list = watchlistLists.find(l => l.id === listId);
        if (list) items.push({ label: list.name, href: `/watchlist/${list.id}` });
      }
    } else if (source === 'groups') {
      items.push({ label: 'Groups', href: '/groups' });
      if (groupId) {
        const group = groups.find(g => g.id === groupId);
        if (group) items.push({ label: group.name, href: `/groups/${group.id}` });
      }
    } else if (source === 'profile') {
      items.push({ label: 'Profile', href: '/profile' });
      const tab = searchParams.get('tab');
      if (tab === 'recs_given') items.push({ label: 'Recommendations Given', href: '/profile?tab=recs_given' });
      if (tab === 'recs_received') items.push({ label: 'Recommendations Received', href: '/profile?tab=recs_received' });
      if (tab === 'rated') items.push({ label: 'Rated', href: '/profile?tab=rated' });
    } else {
      items.push({ label: 'Explore', href: '/explore' });
    }
    
    items.push({ label: title?.title || 'Title', isCurrent: true });
    return items;
  })();

  const mobileBackLabel = (() => {
    if (source === 'watchlist') {
      if (listId) {
        const list = watchlistLists.find(l => l.id === listId);
        return list ? list.name : 'Watchlist';
      }
      return 'Watchlist';
    }
    if (source === 'groups') {
      if (groupId) {
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : 'Groups';
      }
      return 'Groups';
    }
    if (source === 'profile') {
      const tab = searchParams.get('tab');
      if (tab === 'recs_given') return 'Recs Given';
      if (tab === 'recs_received') return 'Recs Received';
      if (tab === 'rated') return 'Rated';
      return 'Profile';
    }
    return 'Explore';
  })();

  const mobileBackHref = (() => {
    if (source === 'watchlist') return listId ? `/watchlist/${listId}` : '/watchlist';
    if (source === 'groups') return groupId ? `/groups/${groupId}` : '/groups';
    if (source === 'profile') {
      const tab = searchParams.get('tab');
      return tab ? `/profile?tab=${tab}` : '/profile';
    }
    return '/explore';
  })();
  
  // Auto-open modal if intent is 'rate'
  useEffect(() => {
    const intent = searchParams.get('intent');
    const isEdit = searchParams.get('edit') === 'true';
    if (intent === 'rate' && recommendation) {
      openGiveVerdictModal(recommendation.id, isEdit);
    }
  }, [searchParams, recommendation, openGiveVerdictModal]);

  // Unified logic for actions
  const viewerContext = recommendation ? getViewerContext(recommendation) : null;
  const actions = recommendation ? getActions(recommendation) : null;

  const [addToListOpen, setAddToListOpen] = useState(false);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const [posterImageError, setPosterImageError] = useState(false);

  if (tmdbLoading) {
    return (
      <div className="max-w-[1440px] mx-auto pb-24 lg:pb-12 animate-pulse">
        <div className="px-4 sm:px-6 lg:px-12 py-4">
          <div className="h-4 w-32 bg-surface rounded" />
        </div>
        <div className="relative w-full h-[50vh] min-h-[350px] flex items-end">
          <div className="absolute inset-0 bg-surface/30" />
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
            <div className="shrink-0 w-32 md:w-48 lg:w-64 aspect-[2/3] rounded-xl bg-surface border border-border/50" />
            <div className="flex-1 space-y-4 pb-2">
              <div className="h-10 w-3/4 bg-surface rounded-lg" />
              <div className="h-5 w-1/2 bg-surface/60 rounded" />
              <div className="flex gap-3">
                <div className="h-12 w-40 bg-cinema-red/20 rounded-xl" />
                <div className="h-12 w-36 bg-surface rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-12 pt-8 space-y-8">
          <div className="space-y-3">
            <div className="h-3 w-16 bg-surface rounded" />
            <div className="h-5 w-full bg-surface/60 rounded" />
            <div className="h-5 w-3/4 bg-surface/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="py-20 text-center">
        {tmdbError ? (
          <>
            <p className="text-muted text-lg mb-2">Couldn&apos;t load this title.</p>
            <p className="text-muted/60 text-sm mb-6">There was an issue fetching from TMDB.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-cinema-red text-bone rounded-xl font-bold btn-press">Try again</button>
              <button onClick={() => router.back()} className="px-6 py-2.5 bg-surface text-bone rounded-xl border border-border">Go back</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted">Title not found.</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface text-bone rounded-lg">Go back</button>
          </>
        )}
      </div>
    );
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'save':
        toggleWatchlist();
        break;
      case 'rate':
        if (recommendation) openGiveVerdictModal(recommendation.id);
        break;
      case 'edit_verdict':
        if (recommendation) openGiveVerdictModal(recommendation.id, true);
        break;
      case 'view_verdict':
        setVerdictModalOpen(true);
        break;
      default:
        console.log('Action not handled:', action);
    }
  };

  const toggleWatchlist = () => {
    setAddToListOpen(true);
  };


  const extRatings = title.externalRatings || { 
    imdb: title.externalRating, 
    tmdb: title.externalRating ? parseFloat((title.externalRating - 0.4).toFixed(1)) : undefined 
  };
  const mockSynopsis = title.overview || "A remote harbor town becomes the center of a quiet mystery after a stranger arrives with a secret that changes everyone around him.";

  return (
    <div className="max-w-[1440px] mx-auto pb-24 lg:pb-12">
      
      {/* Navigation Layer */}
      <div className="px-4 sm:px-6 lg:px-12 py-4 flex items-center relative z-20">
        <Breadcrumbs items={breadcrumbItems} />
        <MobileBackLink label={mobileBackLabel} href={mobileBackHref} />
      </div>

      <div className="relative w-full h-[50vh] min-h-[350px] lg:h-[60vh] flex items-end -mt-6 md:-mt-10 overflow-hidden">
        <div className="absolute inset-0 bg-ink z-0">
          <div className={`absolute inset-0 poster-gradient-${title.posterGradient || '1'} opacity-30`} />
          {title.backdropUrl && !heroImageError && (
            <img 
              src={title.backdropUrl} 
              alt={title.title} 
              className="w-full h-full object-cover opacity-40 transition-opacity duration-1000" 
              onError={() => setHeroImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
          <div className="shrink-0 w-32 md:w-48 lg:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-bone/10 relative bg-surface">
             <div className={`absolute inset-0 poster-gradient-${title.posterGradient || '1'} opacity-60`} />
             {title.posterUrl && !posterImageError && (
               <img 
                src={title.posterUrl} 
                alt={title.title} 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" 
                onError={() => setPosterImageError(true)}
               />
             )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {viewerContext?.verdictState && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded border border-white/10 bg-white/5 text-bone/70">
                  {viewerContext.verdictState === 'verdict_given' ? 'Verdict Given' : 'Verdict Pending'}
                </span>
              )}
              {recommendation?.primaryStamp && <StampBadge stamp={recommendation.primaryStamp} size="sm" />}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-editorial text-bone leading-tight tracking-tight mb-3">
              {title.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-bone/70 mb-6 font-medium">
              <span>{title.releaseYear || '2024'}</span>
              <span>·</span>
              <span>{title.format || (title.type === 'movie' ? 'Movie' : 'Series')}</span>
              {title.language && (
                <>
                  <span>·</span>
                  <span className="uppercase tracking-widest">{title.language}</span>
                </>
              )}
              <span>·</span>
              <span>{title.genres.slice(0, 3).join(' / ')}</span>
              {title.runtime && (
                <>
                  <span>·</span>
                  <span>{title.runtime}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {actions ? (
                <>
                  {actions.primary && (
                    <button
                      onClick={() => handleAction(actions.primary!.action)}
                      className="px-8 py-3.5 bg-cinema-red text-bone rounded-xl font-bold btn-press hover:bg-cinema-red/90 transition-all shadow-lg shadow-cinema-red/20"
                    >
                      {actions.primary.label}
                    </button>
                  )}
                  {actions.secondary && (
                    <button 
                      onClick={() => handleAction(actions.secondary!.action)}
                      className="px-6 py-3.5 bg-surface border border-border text-bone rounded-xl font-bold btn-press hover:bg-surface-hover transition-all"
                    >
                      {actions.secondary.label}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => openRecommendModal({ titleId: id })}
                    className="px-8 py-3.5 bg-cinema-red text-bone rounded-xl font-bold btn-press hover:bg-cinema-red/90 transition-colors flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Recommend this
                  </button>
                  <button 
                    onClick={toggleWatchlist}
                    className={`px-6 py-3.5 rounded-xl font-bold btn-press border transition-colors ${
                      isSaved ? 'bg-surface border-border text-bone' : 'bg-bone text-ink border-bone hover:bg-bone/90'
                    }`}
                  >
                    {isSaved ? '✓ In Watchlist' : 'Add to Watchlist'}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Link copied!', { type: 'success' });
                }}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface/50 border border-border/50 text-bone hover:bg-surface transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-8">
        
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* SECTION: ABOUT */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted/60">About</h2>
            <p className="text-bone/90 text-xl font-editorial leading-relaxed max-w-3xl">
              {title.overview || "No description available for this title."}
            </p>
          </div>

          {/* SECTION: DIRECTOR / CREATOR */}
          {title.directorOrCreatorProfile?.name && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted/60">{title.directorOrCreatorProfile.role}</h2>
              <div className="flex items-center gap-5 p-5 bg-surface border border-white/5 rounded-[32px] w-fit hover:border-white/10 transition-colors group cursor-default">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-ink border border-white/10 shrink-0 shadow-2xl">
                  {title.directorOrCreatorProfile.profileImageUrl ? (
                    <img src={title.directorOrCreatorProfile.profileImageUrl} alt={title.directorOrCreatorProfile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-black text-muted bg-white/5">
                      {title.directorOrCreatorProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="pr-4">
                  <p className="text-bone text-lg font-bold tracking-tight">{title.directorOrCreatorProfile.name}</p>
                  <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-0.5">{title.directorOrCreatorProfile.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CAST */}
          {title.cast && title.cast.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted/60">Cast</h2>
              <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-5 snap-x scrollbar-hide">
                {title.cast.map((actor) => (
                  <div key={actor.id} className="shrink-0 w-36 sm:w-40 rounded-[32px] bg-surface border border-white/5 p-4 snap-start group hover:border-white/10 transition-all shadow-lg hover:shadow-cinema-red/5">
                    <div className="aspect-square w-full rounded-full overflow-hidden mb-4 bg-ink border border-white/10 shadow-inner">
                      {actor.profileImageUrl ? (
                        <img src={actor.profileImageUrl} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-black text-muted/40 bg-white/5">
                          {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="px-1 text-center">
                      <p className="text-sm font-bold text-bone leading-tight mb-1 group-hover:text-cinema-red transition-colors line-clamp-1">{actor.name}</p>
                      <p className="text-[10px] text-muted font-medium line-clamp-1 italic">{actor.characterName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: RECOMMENDATION CONTEXT */}
          {recommendation && recommender && (
            <div className="space-y-6 pt-8 border-t border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted/60">Recommended by your crew</h2>
              <div className="rounded-[40px] bg-surface border border-white/5 p-8 flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21M14.017 21H21.017M14.017 21V18M7 21L7 18C7 16.8954 7.89543 16 9 16H12C13.1046 16 14 16.8954 14 18V21M7 21H14M7 21V18M3 21L3 18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 16.8954 10 18V21M3 21H10M3 21V18"/></svg>
                </div>
                <ClickableUserAvatar 
                  userId={recommender.id} 
                  username={recommender.username} 
                  name={recommender.displayName} 
                  size="lg" 
                />
                <div className="flex-1 relative z-10">
                  <p className="text-bone font-bold text-lg mb-3">
                    <Link href={`/profile/${recommender.username}`} className="hover:text-cinema-red transition-colors">{recommender.displayName}</Link> 
                    <span className="font-normal text-muted"> shares their take</span>
                  </p>
                  {recommendation.reason && (
                    <p className="text-bone text-2xl font-editorial italic leading-relaxed mb-6">
                      &ldquo;{recommendation.reason}&rdquo;
                    </p>
                  )}
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-ink/50 rounded-full border border-white/10 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-cinema-red animate-pulse shadow-[0_0_8px_rgba(234,51,51,0.6)]" />
                    <span className="text-xs font-black uppercase tracking-widest text-bone/80">{recommendation.confidenceScore || 92}% Taste Match</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted/60">What your crew thinks</h2>
            {(() => {
              // 1. Get IDs of people in user's crew
              const crewIds = crewConnections.map(c => c.crewMemberId);
              
              // 2. Find all recommendations for this title by crew members
              const crewRecs = recommendations.filter(r => r.titleId === id && crewIds.includes(r.recommendedBy));
              
              // 3. Find ratings (verdicts) for these recommendations
              const crewVerdicts = ratings.filter(r => crewRecs.some(cr => cr.id === r.recommendationId));

              if (crewVerdicts.length > 0) {
                return (
                  <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-5 snap-x scrollbar-hide">
                    {crewVerdicts.map((verdict) => {
                      const reviewer = getUser(verdict.ratedBy);
                      if (!reviewer) return null;
                      return (
                        <div key={verdict.id} className="shrink-0 w-80 rounded-[32px] bg-surface border border-white/5 p-6 snap-start flex flex-col h-full hover:border-white/10 transition-all shadow-lg">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <ClickableUserAvatar 
                                userId={reviewer.id} 
                                username={reviewer.username} 
                                name={reviewer.displayName} 
                                size="sm" 
                              />
                              <Link href={`/profile/${reviewer.username}`} className="font-bold text-bone hover:text-cinema-red transition-colors">{reviewer.displayName}</Link>
                            </div>
                            <div className="px-2.5 py-1 bg-cinema-red/10 text-cinema-red font-black text-[10px] rounded-lg tracking-widest uppercase">
                              {verdict.contentRating}/5
                            </div>
                          </div>
                          <div className="mb-5">
                             {verdict.stamp && <StampBadge stamp={verdict.stamp as any} size="xs" variant="filled" />}
                          </div>
                          {verdict.comment && (
                            <p className="text-bone/80 text-sm leading-relaxed italic">&ldquo;{verdict.comment}&rdquo;</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div className="rounded-[40px] border-2 border-dashed border-white/5 p-12 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-bone font-editorial">No crew verdicts yet.</h3>
                    <p className="text-sm text-muted">Recommend this to your crew and see what they think.</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/recommend?titleId=${id}`)}
                    className="px-8 py-3.5 bg-bone text-ink rounded-2xl font-bold btn-press hover:bg-white transition-colors"
                  >
                    Recommend this
                  </button>
                </div>
              );
            })()}
          </div>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* SECTION: TASTE MATCH */}
          <div className="rounded-[32px] bg-surface border border-white/5 p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-red/5 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cinema-red/10 transition-colors" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 mb-6">Taste Match</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-bold font-editorial text-bone tracking-tighter leading-none">{recommendation?.tasteMatchScore || 85}%</span>
              <span className="text-[10px] text-cinema-red font-black uppercase tracking-[0.2em] mb-2">Signal</span>
            </div>
            <p className="text-sm text-bone/70 leading-relaxed mb-6">
              {recommendation ? (
                <>Strong alignment with your preference for <span className="text-bone font-bold">{recommendation.moodTags?.[0] || title.genres[0]}</span> and <span className="text-bone font-bold">{recommendation.moodTags?.[1] || title.genres[1] || 'atmospheric'}</span> content.</>
              ) : (
                <>Add this to your watchlist to see how it aligns with your taste.</>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {(recommendation?.moodTags || title.genres.slice(0, 3)).map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-ink/50 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-bone/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION: WHERE TO WATCH */}
          <div className="rounded-[32px] bg-[#151515] p-6 sm:p-8 shadow-xl flex flex-col">
             <h3 className="text-xl font-bold text-bone mb-5">Available on</h3>
            <div className="flex flex-col gap-3">
              {title.platformAvailability && title.platformAvailability.length > 0 ? (
                title.platformAvailability.map((platform, i) => (
                  <a 
                    key={i}
                    href={platform.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors group/link"
                  >
                    <div className="flex items-center gap-4">
                      {/* We use a container for the logo to make it a consistent squircle shape like the mockup */}
                      <div className="w-12 h-12 bg-ink border border-white/5 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        <PlatformLogo platformName={platform.platformName} logoUrl={platform.logoUrl} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-bone font-bold text-[15px]">{platform.platformName}</span>
                        <span className="text-muted/80 text-[13px] font-medium">Subscription</span>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted/50 group-hover/link:text-bone mr-2 transition-colors">
                      <path d="M7 17l9.2-9.2M17 17V7H7"/>
                    </svg>
                  </a>
                ))
              ) : (
                <p className="text-[13px] text-muted italic font-medium px-2">Not available right now.</p>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <button className="text-[13px] text-muted/80 hover:text-bone font-semibold transition-colors">
                Broken Link? Report
              </button>
            </div>
          </div>

          {/* SECTION: PUBLIC SIGNAL */}
          <div className="rounded-[32px] bg-surface border border-white/5 p-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 mb-8">Public Signal</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center group">
                <div className="px-3 py-1.5 bg-[#f5c518] text-black text-[11px] font-black rounded-lg tracking-widest">IMDB</div>
                <span className="text-4xl font-bold font-editorial text-bone leading-none">{extRatings.imdb || '6.7'}</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="px-3 py-1.5 bg-[#01b4e4] text-white text-[11px] font-black rounded-lg tracking-widest uppercase">TMDB</div>
                <span className="text-4xl font-bold font-editorial text-bone leading-none">{extRatings.tmdb || '6.4'}</span>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-white/5">
               <p className="text-[11px] text-muted italic font-medium leading-relaxed">Public ratings help. Your crew&apos;s taste decides.</p>
            </div>
          </div>

          {/* SECTION: INVITE FRIENDS */}
          <div className="rounded-[32px] bg-cinema-red/5 border border-cinema-red/10 p-8 shadow-lg relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-y-1/4 translate-x-1/4 group-hover:scale-110 transition-transform duration-700">
               <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-bone tracking-tight mb-2">Want more opinions?</h3>
            <p className="text-sm text-muted leading-relaxed mb-6">Invite your crew to stamp this pick and boost the signal.</p>
            <button 
              onClick={() => setInviteModalOpen(true)}
              className="w-full py-4 bg-cinema-red/20 text-cinema-red font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-cinema-red hover:text-bone transition-all shadow-lg active:scale-95"
            >
              Invite crew
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 9 & 10: RELATED CONTENT */}
      <div className="px-4 sm:px-6 lg:px-12 mt-16 space-y-12">
        {/* SECTION 9: MORE FROM YOUR CREW */}
        {(() => {
          const crewIds = crewConnections.map(c => c.crewMemberId);
          const crewRecs = recommendations.filter(r => 
            r.id !== recId && 
            r.titleId !== id && 
            crewIds.includes(r.recommendedBy)
          );

          if (crewRecs.length === 0) return null;

          return (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted">More from your crew</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {crewRecs.slice(0, 6).map(rec => {
                  const recTitle = getTitle(rec.titleId);
                  if (!recTitle) return null;
                  return (
                    <div key={rec.id} className="w-[200px] shrink-0 snap-start">
                      <MovieCard title={recTitle} stamp={rec.primaryStamp} recommendedBy={rec.recommendedBy} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* SECTION 10: SIMILAR PICKS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">More like this</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
             {similarLoading ? (
               Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="w-[200px] shrink-0 snap-start animate-pulse">
                   <div className="aspect-[2/3] rounded-2xl bg-surface border border-border/20" />
                 </div>
               ))
             ) : similarTitles.length > 0 ? (
               similarTitles.map(simTitle => (
                 <div key={simTitle.id} className="w-[200px] shrink-0 snap-start">
                   <MovieCard title={simTitle} />
                 </div>
               ))
             ) : (
               <p className="text-xs text-muted col-span-full">No similar titles found.</p>
             )}
          </div>
        </div>
      </div>
      

      {/* STICKY MOBILE BOTTOM CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/95 backdrop-blur-md border-t border-border p-3 flex gap-3 safe-area-bottom">
        <button
          onClick={() => router.push(`/recommend?titleId=${id}`)}
          className="flex-1 py-3 bg-cinema-red text-bone rounded-xl font-bold btn-press hover:bg-cinema-red/90 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Recommend
        </button>
        <button
          onClick={toggleWatchlist}
          className={`px-5 py-3 rounded-xl font-bold btn-press border transition-colors text-sm ${
            isSaved ? 'bg-surface border-border text-bone' : 'bg-bone text-ink border-bone'
          }`}
        >
          {isSaved ? '✓ Saved' : '+ Watchlist'}
        </button>
      </div>


      {/* ADD TO LIST MODAL */}
      <AddToListModal isOpen={addToListOpen} onClose={() => setAddToListOpen(false)} titleId={title.id} />

      {/* VERDICT MODAL */}
      {recommendation && (
        <VerdictModal recommendationId={recommendation.id} isOpen={verdictModalOpen} onClose={() => setVerdictModalOpen(false)} />
      )}

      {/* INVITE MODAL */}
      <InviteModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />

    </div>
  );
}
