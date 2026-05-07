'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { MOOD_TAGS, RECOMMENDATION_REASONS, getConfidenceLabel, type MoodTag } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';
import StampBadge from '@/components/StampBadge';

function RecommendForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { titles, getTitle, currentUser, groupMembers, getUser, groups, addRecommendation } = useApp();

  const initTitleId = searchParams.get('titleId');
  const initGroupId = searchParams.get('groupId');

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  const [titleId, setTitleId] = useState<string | null>(initTitleId);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(initGroupId);
  const [isGroup, setIsGroup] = useState(!!initGroupId);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(75);
  const [moods, setMoods] = useState<MoodTag[]>([]);
  const [titleSearch, setTitleSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedTitle = titleId ? getTitle(titleId) : null;
  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser?.id).map(gm => gm.groupId);
  const friendIds = [...new Set(groupMembers.filter(gm => myGroupIds.includes(gm.groupId) && gm.userId !== currentUser?.id).map(gm => gm.userId))];
  const friends = friendIds.map(id => getUser(id)).filter(Boolean);
  const myGroups = myGroupIds.map(id => groups.find(g => g.id === id)).filter(Boolean);

  const filteredTitles = titleSearch
    ? titles.filter(t => t.title.toLowerCase().includes(titleSearch.toLowerCase()))
    : titles;

  const toggleMood = (tag: MoodTag) =>
    setMoods(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev);

  const canSubmit = titleId && (recipientId || isGroup) && reason.trim();

  const handleSubmit = () => {
    if (!currentUser || !titleId || !canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      addRecommendation({
        id: `rec-${Date.now()}`, titleId,
        groupId: groupId || undefined,
        recommendedBy: currentUser.id,
        recommendedToUserIds: isGroup ? [] : [recipientId!],
        recommendedToGroup: isGroup,
        reason: reason || RECOMMENDATION_REASONS[0],
        confidenceScore: confidence,
        moodTags: moods,
        tasteMatchScore: confidence,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    }, 800);
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto page-enter">
        <div className="w-16 h-16 rounded-full bg-cinema-red/15 border border-cinema-red/30 flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Recommendation sent.</h2>
        <p className="text-muted mb-8">Ego pending.</p>
        <div className="flex gap-3">
          <button onClick={() => { setSuccess(false); setStep(1); setTitleId(null); setReason(''); setMoods([]); }}
            className="px-5 py-2.5 bg-surface border border-border text-bone rounded-xl text-sm font-medium hover:bg-surface-hover btn-press transition-colors">
            Send another
          </button>
          <button onClick={() => router.push('/home')}
            className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold hover:bg-cinema-red/90 btn-press transition-colors">
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* Header & Progress */}
      <div className="mb-8">
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-1">Put your taste on the line.</p>
        <h1 className="text-2xl font-bold text-bone font-editorial mb-4">Recommend</h1>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              step > i ? 'bg-cinema-red' : 'bg-surface'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 min-h-[400px] flex flex-col">
        
        {/* STEP 1: Title Search */}
        {step === 1 && (
          <div className="flex-1 page-enter">
            <h2 className="text-sm font-semibold text-bone mb-1">1. What are you recommending?</h2>
            <p className="text-xs text-muted mb-4">Search for a movie or show to back.</p>

            {!selectedTitle ? (
              <>
                <div className="flex items-center bg-ink border border-border rounded-xl px-3 py-2.5 gap-2 mb-3 focus-within:border-cinema-red/50 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={titleSearch} onChange={e => setTitleSearch(e.target.value)}
                    placeholder="Search movies or shows…"
                    className="flex-1 bg-transparent border-none p-0 text-sm text-bone placeholder:text-muted/50 outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredTitles.slice(0, 16).map(t => (
                    <button key={t.id} onClick={() => setTitleId(t.id)}
                      className="flex items-center gap-3 p-2 rounded-xl bg-ink border border-border hover:border-cinema-red/40 text-left btn-press transition-all">
                      <div className={`w-10 h-14 rounded-lg poster-gradient-${t.posterGradient} shrink-0`} />
                      <div>
                        <p className="text-xs font-semibold text-bone line-clamp-1 leading-tight">{t.title}</p>
                        <p className="text-xs text-muted mt-0.5">{t.releaseYear}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 bg-ink border border-border p-3 rounded-xl">
                <div className={`w-16 h-24 rounded-lg poster-gradient-${selectedTitle.posterGradient} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base text-bone mb-1">{selectedTitle.title}</p>
                  <p className="text-xs text-muted mb-1">{selectedTitle.releaseYear} · {selectedTitle.format}</p>
                  <p className="text-xs text-muted">{selectedTitle.genres.join(', ')}</p>
                </div>
                <button onClick={() => setTitleId(null)} className="px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-hover text-bone rounded-lg border border-border transition-colors">
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Audience */}
        {step === 2 && (
          <div className="flex-1 page-enter">
            <h2 className="text-sm font-semibold text-bone mb-1">2. Who is this for?</h2>
            <p className="text-xs text-muted mb-4">Send it to a specific friend or share with a crew.</p>

            <div className="flex gap-1 p-1 bg-ink rounded-xl border border-border mb-4">
              <button onClick={() => { setIsGroup(false); setGroupId(null); }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${!isGroup ? 'bg-surface text-bone border border-border/50' : 'text-muted hover:text-bone'}`}>
                A Friend
              </button>
              <button onClick={() => { setIsGroup(true); setRecipientId(null); }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${isGroup ? 'bg-surface text-bone border border-border/50' : 'text-muted hover:text-bone'}`}>
                A Crew
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {!isGroup ? friends.map(f => f && (
                <button key={f.id} onClick={() => setRecipientId(f.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left btn-press transition-all ${
                    recipientId === f.id ? 'border-cinema-red/50 bg-cinema-red/8' : 'border-border bg-ink hover:border-border-strong'
                  }`}>
                  <UserAvatar name={f.displayName} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-bone">{f.displayName}</p>
                    <p className="text-xs text-muted">{f.tasteArchetype}</p>
                  </div>
                </button>
              )) : myGroups.map(g => g && (
                <button key={g.id} onClick={() => setGroupId(g.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left btn-press transition-all ${
                    groupId === g.id ? 'border-cinema-red/50 bg-cinema-red/8' : 'border-border bg-ink hover:border-border-strong'
                  }`}>
                  <div className={`w-10 h-10 rounded-lg poster-gradient-${g.avatarGradient} shrink-0`} />
                  <div>
                    <p className="text-sm font-semibold text-bone">{g.name}</p>
                    <p className="text-xs text-muted">{g.vibe}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Case */}
        {step === 3 && (
          <div className="flex-1 page-enter space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-bone mb-1">3. Make your case</h2>
              <p className="text-xs text-muted mb-4">Why are you putting your reputation on this?</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-bone mb-2">The Reason</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder={RECOMMENDATION_REASONS[Math.floor(Math.random() * RECOMMENDATION_REASONS.length)]}
                className="h-24 resize-none text-sm bg-ink" maxLength={200} />
              <div className="text-right text-xs text-muted mt-1">{reason.length}/200</div>
            </div>

            <div className="bg-ink border border-border p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-medium text-bone">Confidence</label>
                <span className="text-xs font-bold text-cinema-red">{getConfidenceLabel(confidence)}</span>
              </div>
              <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} />
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>Risky take</span><span>Certified good call</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-bone">Mood Tags</label>
                <span className="text-xs text-muted">{moods.length}/3 selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleMood(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all btn-press ${
                      moods.includes(tag)
                        ? 'bg-cinema-red border-cinema-red text-bone'
                        : moods.length >= 3 ? 'border-border bg-ink text-muted/40 cursor-not-allowed opacity-50'
                        : 'border-border bg-ink text-muted hover:text-bone hover:border-border-strong'
                    }`}
                    disabled={moods.length >= 3 && !moods.includes(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preview */}
        {step === 4 && (
          <div className="flex-1 page-enter">
            <h2 className="text-sm font-semibold text-bone mb-1">4. Review & Send</h2>
            <p className="text-xs text-muted mb-5">This is exactly how they will see it.</p>

            {selectedTitle && (
              <div className="rounded-2xl bg-elevated border border-border p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cinema-red/5 to-transparent pointer-events-none" />
                <p className="text-xs text-muted uppercase tracking-wider mb-4 relative z-10">
                  To: <span className="text-bone font-medium">{isGroup ? groups.find(g => g.id === groupId)?.name : friends.find(f => f?.id === recipientId)?.displayName}</span>
                </p>
                <div className="flex gap-4 relative z-10">
                  <div className={`w-16 h-24 rounded-xl shadow-lg poster-gradient-${selectedTitle.posterGradient} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-bone leading-tight mb-1">{selectedTitle.title}</p>
                    <p className="text-xs text-muted mb-2">{selectedTitle.releaseYear} · {selectedTitle.format}</p>
                    <div className="bg-ink/50 rounded-lg p-2.5 mb-2 border border-border/50">
                      <p className="text-xs text-bone/80 italic leading-snug">&ldquo;{reason}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cinema-red px-2 py-0.5 rounded border border-cinema-red/20 bg-cinema-red/10">
                        {confidence}% confident
                      </span>
                      {confidence >= 86 && <StampBadge stamp="Certified Good Call" size="xs" />}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-8 pt-4 border-t border-border flex justify-between items-center shrink-0">
          <button 
            onClick={prevStep} 
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${step === 1 ? 'invisible' : 'text-muted hover:text-bone hover:bg-surface-hover'}`}
          >
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <button 
              onClick={nextStep} 
              disabled={
                (step === 1 && !titleId) || 
                (step === 2 && !recipientId && !groupId) || 
                (step === 3 && !reason.trim())
              }
              className="px-6 py-2.5 bg-bone text-ink font-bold rounded-xl text-sm disabled:opacity-40 btn-press transition-colors hover:bg-bone/90"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={!canSubmit || submitting}
              className="px-8 py-2.5 bg-cinema-red text-bone font-bold rounded-xl text-sm disabled:opacity-40 btn-press transition-colors hover:bg-cinema-red/90 flex items-center gap-2"
            >
              {submitting && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
              Send Recommendation
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted text-sm">Loading…</div>}>
      <RecommendForm />
    </Suspense>
  );
}
