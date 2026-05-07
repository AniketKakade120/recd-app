'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import InviteModal from '@/components/InviteModal';

const FILTERS = ['All', 'Movies', 'Shows', 'Recommended', 'Saved'] as const;
type Filter = typeof FILTERS[number];

export default function WatchlistPage() {
  const { watchlist, getTitle, getUser, removeFromWatchlist } = useApp();
  const [filter, setFilter] = useState<Filter>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'priority'>('recent');
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = watchlist.filter(item => {
    const t = getTitle(item.titleId);
    if (!t) return false;
    if (filter === 'Movies') return t.type === 'movie';
    if (filter === 'Shows') return t.type === 'series' || t.type === 'limited_series';
    if (filter === 'Recommended') return item.status === 'recommended';
    if (filter === 'Saved') return item.status === 'saved';
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const movies = watchlist.filter(w => getTitle(w.titleId)?.type === 'movie').length;
  const shows = watchlist.length - movies;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-1">Your library</p>
          <h1 className="text-2xl font-bold text-bone font-editorial">My Watchlist</h1>
          <p className="text-xs text-muted mt-1">The stories you want to see, recommended by people you trust.</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-bone">{watchlist.length}</p>
          <p className="text-sm text-muted uppercase tracking-wider">Total picks</p>
        </div>
      </div>

      {/* Filters + sort */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors btn-press ${
                filter === f ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-surface border-border text-muted hover:text-bone'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filtered.length > 0 ? (
            <div className="space-y-5">
              {filtered.map(item => {
                const title = getTitle(item.titleId);
                const recommender = item.recommendedBy ? getUser(item.recommendedBy) : undefined;
                if (!title) return null;
                return (
                  <div key={item.id} className="rounded-2xl bg-surface border border-border p-5 flex items-center gap-5 card-hover group transition-all">
                    <div className={`w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-xl overflow-hidden relative shadow-md ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : 'bg-ink'}`}>
                      {title.posterUrl && (
                        <img src={title.posterUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-bold text-base sm:text-lg text-bone truncate">{title.title}</h3>
                        {item.stamp && <StampBadge stamp={item.stamp} size="sm" />}
                      </div>
                      <p className="text-xs sm:text-sm text-muted mt-1">
                        {title.releaseYear} · {title.genres.slice(0, 3).join(', ')}
                        {title.runtime && ` · ${title.runtime}`}
                      </p>
                      {recommender && (
                        <div className="flex items-center gap-2 mt-3">
                          <UserAvatar name={recommender.displayName} size="sm" />
                          <p className="text-sm text-muted font-medium">Rec&apos;d by <span className="text-bone/80">{recommender.displayName}</span></p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <button onClick={e => { e.stopPropagation(); removeFromWatchlist(item.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-cinema-red p-1 text-sm bg-ink rounded-lg border border-border">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-border bg-surface">
              <p className="text-3xl mb-3 opacity-20">✦</p>
              <h3 className="font-bold text-bone mb-1">Your watchlist is waiting for a good call.</h3>
              <p className="text-sm text-muted mb-4">Save recs from your crew to watch later.</p>
              <button onClick={() => setInviteOpen(true)}
                className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold btn-press hover:bg-cinema-red/90">
                Find picks
              </button>
            </div>
          )}
        </div>

        {/* Sidebar overview */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Overview</p>
            <div className="space-y-3">
              {[
                { label: 'Total picks', val: watchlist.length },
                { label: 'Movies', val: movies },
                { label: 'Shows', val: shows },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className="text-sm font-bold text-bone">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-cinema-red/8 border border-cinema-red/15 p-4">
            <p className="text-xs font-bold text-bone mb-1">From your crew</p>
            <p className="text-xs text-muted mb-3">Recs from people you actually trust.</p>
            <button onClick={() => setInviteOpen(true)}
              className="w-full py-2 bg-cinema-red text-bone text-xs font-semibold rounded-lg btn-press hover:bg-cinema-red/90 transition-colors">
              Invite more friends
            </button>
          </div>
        </div>
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
