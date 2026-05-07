'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { mockGroupVerdicts, mockGroupComments } from '@/lib/mock-data';
import type { StampType, RecAccuracy } from '@/lib/types';
import StampBadge from '@/components/StampBadge';
import UserAvatar from '@/components/UserAvatar';
import { formatRelativeTime } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGroupVerdict(stamps: (StampType | undefined)[]): string {
  const counts: Record<string, number> = {};
  stamps.filter(Boolean).forEach(s => { counts[s!] = (counts[s!] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : 'Pending';
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= rating ? 'text-cinema-red' : 'text-border'}`}>★</span>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GroupTitleDetailPage({ params }: { params: Promise<{ id: string; titleId: string }> }) {
  const { id: groupId, titleId } = use(params);
  const router = useRouter();
  const { getTitle, getGroup, getGroupMembers, getGroupRecommendations, getUser, currentUser, recommendations, titles } = useApp();

  const title = getTitle(titleId);
  const group = getGroup(groupId);
  const members = getGroupMembers(groupId);
  const groupRecs = getGroupRecommendations(groupId);
  const rec = groupRecs.find(r => r.titleId === titleId);
  const recommender = rec ? getUser(rec.recommendedBy) : null;

  // Verdicts for this title in this group
  const verdicts = rec ? mockGroupVerdicts.filter(v => v.recommendationId === rec.id) : [];
  const comments = mockGroupComments.filter(c => c.groupId === groupId && c.titleId === titleId);

  // Pending members (not yet rated)
  const ratedUserIds = verdicts.map(v => v.ratedBy);
  const pendingMembers = members.filter(m => !ratedUserIds.includes(m.id) && m.id !== rec?.recommendedBy);

  // Stats
  const avgRating = verdicts.length > 0 ? (verdicts.reduce((s, v) => s + v.contentRating, 0) / verdicts.length).toFixed(1) : '—';
  const resultCounts = { 'Nailed it': 0, 'Pretty close': 0, 'Not for me': 0 };
  verdicts.forEach(v => { if (v.recommendationResult in resultCounts) resultCounts[v.recommendationResult as RecAccuracy]++; });
  const topStamp = getGroupVerdict(verdicts.map(v => v.stamp));

  // Related group picks
  const relatedRecs = groupRecs.filter(r => r.titleId !== titleId).slice(0, 4);

  // Comment input
  const [newComment, setNewComment] = useState('');

  // User state for CTA
  const userVerdict = verdicts.find(v => v.ratedBy === currentUser?.id);
  const isRecommender = rec?.recommendedBy === currentUser?.id;

  if (!title || !group) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Title or group not found.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface text-bone rounded-lg text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-28 lg:pb-12">

      {/* ── 1. CINEMATIC TITLE HEADER ──────────────────────────────────────── */}
      <div className="relative w-full h-[50vh] min-h-[340px] lg:h-[55vh] flex items-end -mx-4 sm:-mx-6 lg:mx-0 mb-8">
        <div className="absolute inset-0 bg-ink z-0">
          {title.backdropUrl ? (
            <img src={title.backdropUrl} alt={title.title} className="w-full h-full object-cover opacity-35" />
          ) : (
            <div className={`w-full h-full poster-gradient-${title.posterGradient} opacity-25`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 px-6 pb-8 w-full flex flex-col sm:flex-row items-end gap-6">
          {/* Poster */}
          <div className={`w-28 h-[168px] rounded-xl overflow-hidden border border-border/50 shrink-0 shadow-2xl hidden sm:block ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
            {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
          </div>

          <div className="flex-1 min-w-0">
            {/* Back + Group breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => router.back()} className="text-muted hover:text-bone text-xs transition-colors">← Back</button>
              <span className="text-border">·</span>
              <Link href={`/groups/${groupId}`} className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors font-medium">{group.name}</Link>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-bone font-editorial tracking-tight mb-2">{title.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mb-3">
              <span>{title.releaseYear}</span>
              <span>·</span>
              <span>{title.format || 'Movie'}</span>
              <span>·</span>
              <span>{title.genres.slice(0, 3).join(', ')}</span>
              {title.runtime && <><span>·</span><span>{title.runtime}</span></>}
              {title.externalRating && <><span>·</span><span className="text-cinema-red font-semibold">★ {title.externalRating}</span></>}
            </div>
            <StampBadge stamp={topStamp as StampType} size="md" />
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* ── 2. RECOMMENDATION ORIGIN ────────────────────────────────────── */}
          {rec && recommender && (
            <section className="rounded-2xl bg-surface border border-border p-5">
              <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">This movie entered the group</p>
              <div className="flex items-start gap-3">
                <UserAvatar name={recommender.displayName} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-bone">{recommender.displayName}</p>
                  <p className="text-xs text-muted mb-2">{recommender.tasteArchetype} · {formatRelativeTime(rec.createdAt)}</p>
                  <p className="text-sm text-bone/80 italic mb-3">&ldquo;{rec.reason}&rdquo;</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span>Confidence: <span className="text-cinema-red font-semibold">{rec.confidenceScore}%</span></span>
                    <span>·</span>
                    <span>{rec.recommendedToGroup ? 'Sent to whole group' : `Sent to ${rec.recommendedToUserIds?.length || 0} member${(rec.recommendedToUserIds?.length || 0) !== 1 ? 's' : ''}`}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 4. INDIVIDUAL VERDICTS ──────────────────────────────────────── */}
          <section>
            <h2 className="text-base font-bold text-bone mb-4">Verdicts ({verdicts.length})</h2>
            <div className="space-y-3">
              {verdicts.map(v => {
                const user = getUser(v.ratedBy);
                if (!user) return null;
                return (
                  <div key={v.id} className="rounded-2xl bg-surface border border-border p-4 card-hover">
                    <div className="flex items-start gap-3">
                      <UserAvatar name={user.displayName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-bone">{user.displayName}</p>
                          <span className="text-xs text-muted">{formatRelativeTime(v.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <Stars rating={v.contentRating} />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            v.recommendationResult === 'Nailed it' ? 'text-green-400 border-green-400/30 bg-green-400/10'
                            : v.recommendationResult === 'Pretty close' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                            : 'text-red-400 border-red-400/30 bg-red-400/10'
                          }`}>{v.recommendationResult}</span>
                        </div>
                        {v.comment && <p className="text-sm text-bone/70 italic mb-2">&ldquo;{v.comment}&rdquo;</p>}
                        {v.stamp && <StampBadge stamp={v.stamp} size="xs" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {verdicts.length === 0 && (
                <div className="py-10 text-center rounded-2xl border border-dashed border-border">
                  <p className="text-muted text-sm">No verdicts yet. Be the first to rate.</p>
                </div>
              )}
            </div>
          </section>

          {/* ── 6. CREW DISCUSSION ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-base font-bold text-bone mb-4">Crew Discussion ({comments.length})</h2>
            <div className="space-y-3">
              {comments.map(c => {
                const user = getUser(c.userId);
                if (!user) return null;
                return (
                  <div key={c.id} className="flex items-start gap-3">
                    <UserAvatar name={user.displayName} size="sm" />
                    <div className="flex-1 min-w-0 rounded-xl bg-surface border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-bone">{user.displayName}</p>
                        <span className="text-xs text-muted">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-bone/70">{c.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Comment input */}
            <div className="flex items-center gap-3 mt-4">
              <UserAvatar name={currentUser?.displayName || 'You'} size="sm" />
              <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 focus-within:border-cinema-red/50 transition-colors">
                <input
                  type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Add to the discussion…"
                  className="flex-1 bg-transparent text-sm text-bone placeholder:text-muted/50 outline-none"
                />
                <button disabled={!newComment.trim()} className="text-xs font-semibold text-cinema-red disabled:text-muted/30 transition-colors">Send</button>
              </div>
            </div>
          </section>

          {/* ── 8. RELATED GROUP PICKS ─────────────────────────────────────── */}
          {relatedRecs.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-bone mb-4">More from this crew</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar snap-x">
                {relatedRecs.map(r => {
                  const t = getTitle(r.titleId);
                  const sender = getUser(r.recommendedBy);
                  if (!t) return null;
                  return (
                    <Link key={r.id} href={`/groups/${groupId}/titles/${t.id}`} className="w-[140px] shrink-0 snap-start block group">
                      <div className={`aspect-[2/3] rounded-xl overflow-hidden relative border border-border/50 mb-2 ${!t.posterUrl ? `poster-gradient-${t.posterGradient}` : 'bg-surface'}`}>
                        {t.posterUrl && <img src={t.posterUrl} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 poster-overlay-strong" />
                        {r.primaryStamp && (
                          <div className="absolute bottom-2 left-2"><StampBadge stamp={r.primaryStamp} size="xs" /></div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-bone truncate">{t.title}</p>
                      {sender && <p className="text-xs text-muted truncate">Rec&apos;d by {sender.displayName}</p>}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* ── 3. GROUP VERDICT SUMMARY ────────────────────────────────────── */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">Group Verdict</p>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-bone font-editorial">{avgRating}</p>
              <p className="text-xs text-muted mt-1">avg rating · {verdicts.length} watched</p>
            </div>
            <div className="flex justify-center mb-4"><StampBadge stamp={topStamp as StampType} size="md" /></div>

            {/* Result breakdown */}
            <div className="space-y-2">
              {(['Nailed it', 'Pretty close', 'Not for me'] as RecAccuracy[]).map(result => {
                const count = resultCounts[result];
                const pct = verdicts.length > 0 ? (count / verdicts.length) * 100 : 0;
                return (
                  <div key={result}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-bone/70">{result}</span>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        result === 'Nailed it' ? 'bg-green-500' : result === 'Pretty close' ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending count */}
            {pendingMembers.length > 0 && (
              <p className="text-xs text-muted mt-4 text-center">{pendingMembers.length} member{pendingMembers.length !== 1 ? 's' : ''} haven&apos;t watched yet</p>
            )}
          </div>

          {/* ── 5. PENDING MEMBERS ─────────────────────────────────────────── */}
          {pendingMembers.length > 0 && (
            <div className="rounded-2xl bg-surface border border-border p-5">
              <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-3">Still Pending</p>
              <div className="space-y-3">
                {pendingMembers.map(m => {
                  const statuses = ['Not started', 'Saved', 'Watching', 'Maybe later'];
                  const mockStatus = statuses[Math.floor(Math.random() * 1000) % statuses.length];
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <UserAvatar name={m.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-bone">{m.displayName}</p>
                        <p className="text-xs text-muted">{mockStatus}</p>
                      </div>
                      <button className="text-xs text-cinema-red hover:text-cinema-red/80 font-medium transition-colors">Nudge</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 7. USER ACTION PANEL ───────────────────────────────────────── */}
          <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2">Your Actions</p>
            {isRecommender ? (
              <>
                <button className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl text-sm hover:bg-cinema-red/90 transition-colors btn-press">View Verdicts</button>
                {pendingMembers.length > 0 && (
                  <button className="w-full py-3 bg-surface border border-border text-bone font-semibold rounded-xl text-sm hover:bg-surface-hover transition-colors btn-press">Nudge Pending ({pendingMembers.length})</button>
                )}
              </>
            ) : userVerdict ? (
              <>
                <button className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl text-sm hover:bg-cinema-red/90 transition-colors btn-press">Edit Verdict</button>
                <button className="w-full py-3 bg-surface border border-border text-bone font-semibold rounded-xl text-sm hover:bg-surface-hover transition-colors btn-press">View Group Verdict</button>
              </>
            ) : (
              <>
                <Link href={`/title/${titleId}${rec ? `?recId=${rec.id}` : ''}`} className="w-full py-3 bg-cinema-red text-bone font-bold rounded-xl text-sm hover:bg-cinema-red/90 transition-colors btn-press text-center block">Rate Rec</Link>
                <button className="w-full py-3 bg-surface border border-border text-bone font-semibold rounded-xl text-sm hover:bg-surface-hover transition-colors btn-press">Add to Watchlist</button>
                <button className="w-full py-3 bg-surface border border-border text-muted font-medium rounded-xl text-sm hover:bg-surface-hover transition-colors btn-press">Not my vibe</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
