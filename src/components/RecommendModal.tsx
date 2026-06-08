'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { MOOD_TAGS, RECOMMENDATION_REASONS, getConfidenceLabel, type MoodTag } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';
import StampBadge from '@/components/StampBadge';
import MovieSearch from '@/components/MovieSearch';
import { ensureTitleExistsInDb } from '@/lib/supabase/actions';
import type { Title } from '@/lib/types';
import ModalBase from '@/components/ModalBase';

export default function RecommendModal() {
  const { 
    recommendModalOpen, 
    recommendModalData, 
    closeRecommendModal,
    titles, getTitle, addTitle, currentUser, groupMembers, users, crewConnections, toasts, addToast, getUser, groups, addRecommendation 
  } = useApp();

  const initTitleId = recommendModalData?.titleId || null;
  const initGroupId = recommendModalData?.groupId || null;
  const initRecipientId = recommendModalData?.recipientId || null;

  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [selectedTitleState, setSelectedTitleState] = useState<Title | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(75);
  const [moods, setMoods] = useState<MoodTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (recommendModalOpen) {
      setTitleId(initTitleId);
      setSelectedTitleState(initTitleId ? getTitle(initTitleId) || null : null);
      setRecipientId(initRecipientId);
      setGroupId(initGroupId);
      setIsGroup(!!initGroupId);
      setStep(initTitleId ? 2 : 1);
      setReason('');
      setConfidence(75);
      setMoods([]);
      setSuccess(false);
      setSubmitting(false);
      setSearchQuery('');
    }
  }, [recommendModalOpen]); // Only run when modal is opened/closed

  if (!recommendModalOpen) return null;

  const selectedTitle = selectedTitleState;
  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser?.id).map(gm => gm.groupId);
  const groupFriendIds = groupMembers.filter(gm => myGroupIds.includes(gm.groupId) && gm.userId !== currentUser?.id).map(gm => gm.userId);
  const crewIds = crewConnections.map(c => c.crewMemberId);
  
  const friendIds = [...new Set([...groupFriendIds, ...crewIds])];
  const friends = friendIds.map(id => getUser(id)).filter(Boolean);
  const myGroups = myGroupIds.map(id => groups.find(g => g.id === id)).filter(Boolean);

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
        verdictState: 'verdict_pending',
        createdAt: new Date().toISOString(),
      });
      addToast('Recommendation sent!', { type: 'success' });
      setSuccess(true);
      setSubmitting(false);
    }, 800);
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <ModalBase
      isOpen={recommendModalOpen}
      onClose={closeRecommendModal}
      title="Recommend"
      subtitle="Put your taste on the line"
      maxWidth="max-w-2xl"
      noPadding={true}
    >

        {/* Success State */}
        {success ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-cinema-red/15 border border-cinema-red/30 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Recommendation sent.</h2>
            <p className="text-muted mb-8">Ego pending.</p>
            <div className="flex gap-3">
              <button onClick={() => { setSuccess(false); setStep(1); setTitleId(null); setSelectedTitleState(null); setReason(''); setMoods([]); }}
                className="px-5 py-2.5 bg-surface border border-border text-bone rounded-xl text-sm font-medium hover:bg-surface-hover btn-press transition-colors">
                Send another
              </button>
              <button onClick={closeRecommendModal}
                className="px-5 py-2.5 bg-cinema-red text-bone rounded-xl text-sm font-semibold hover:bg-cinema-red/90 btn-press transition-colors">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Stepper */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    step > i ? 'bg-cinema-red shadow-[0_0_8px_rgba(234,51,51,0.5)]' : 'bg-border'
                  }`} />
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
              
              {/* STEP 1: Title Search */}
              {step === 1 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-sm font-semibold text-bone mb-1">1. What are you recommending?</h2>
                  <p className="text-xs text-muted mb-4">Search for a movie or show to back.</p>

                  {!selectedTitle ? (
                    <MovieSearch 
                      onSelect={async (title) => {
                        setTitleId(title.id);
                        setSelectedTitleState(title);
                        addTitle(title);
                        // Sync to DB immediately to ensure full details are cached
                        const res = await ensureTitleExistsInDb(title);
                        if (res.success && res.title) {
                          setSelectedTitleState(res.title);
                          addTitle(res.title);
                        }
                        nextStep();
                      }} 
                    />
                  ) : (
                    <div className="flex items-center gap-4 bg-ink border border-border p-3 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                      <div className={`w-16 h-24 rounded-lg shrink-0 overflow-hidden border border-border/30 bg-ink ${!selectedTitle.posterUrl ? `poster-gradient-${selectedTitle.posterGradient}` : ''}`}>
                        {selectedTitle.posterUrl && (
                          <img src={selectedTitle.posterUrl} alt={selectedTitle.title} className="w-full h-full object-cover" />
                        )}
                      </div>
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
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-sm font-semibold text-bone mb-1">2. Who is this for?</h2>
                  <p className="text-xs text-muted mb-4">Send it to a specific friend or share with a crew.</p>

                  <div className="flex gap-1 p-1 bg-ink rounded-xl border border-border mb-4">
                    <button onClick={() => { setIsGroup(false); setGroupId(null); }}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${!isGroup ? 'bg-surface text-bone border border-border/50 shadow-sm' : 'text-muted hover:text-bone'}`}>
                      A Friend
                    </button>
                    <button onClick={() => { setIsGroup(true); setRecipientId(null); }}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${isGroup ? 'bg-surface text-bone border border-border/50 shadow-sm' : 'text-muted hover:text-bone'}`}>
                      A Crew
                    </button>
                  </div>

                  <div className="mb-4 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
                    <input 
                      type="text"
                      placeholder={isGroup ? "Search crews..." : "Search friends..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-ink border border-border rounded-xl py-2 pl-9 pr-3 text-sm text-bone placeholder:text-muted/60 focus:border-white/20 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {!isGroup ? friends.filter(f => f && (f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || f.username.toLowerCase().includes(searchQuery.toLowerCase()))).map(f => f && (
                      <button key={f.id} onClick={() => setRecipientId(f.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left btn-press transition-all ${
                          recipientId === f.id 
                            ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30' 
                            : 'border-border bg-ink hover:border-border-strong'
                        }`}>
                        <UserAvatar name={f.displayName} size="md" />
                        <div>
                          <p className="text-sm font-semibold text-bone">{f.displayName}</p>
                          <p className="text-xs text-muted">{f.tasteArchetype}</p>
                        </div>
                      </button>
                    )) : myGroups.filter(g => g && g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => g && (
                      <button key={g.id} onClick={() => setGroupId(g.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left btn-press transition-all ${
                          groupId === g.id 
                            ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30' 
                            : 'border-border bg-ink hover:border-border-strong'
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
                <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-bone mb-1">3. Make your case</h2>
                    <p className="text-xs text-muted mb-4">Why are you putting your reputation on this?</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-bone mb-2">The Reason</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)}
                      placeholder={RECOMMENDATION_REASONS[Math.floor(Math.random() * RECOMMENDATION_REASONS.length)]}
                      className="w-full h-24 resize-none text-sm bg-ink border border-border rounded-xl p-3 focus:border-cinema-red focus:ring-1 focus:ring-cinema-red outline-none transition-all" maxLength={200} />
                    <div className="text-right text-xs text-muted mt-1">{reason.length}/200</div>
                  </div>

                  <div className="bg-ink border border-border p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-medium text-bone">Confidence</label>
                      <span className="text-xs font-bold text-cinema-red">{getConfidenceLabel(confidence)}</span>
                    </div>
                    <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full" />
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
                              ? 'bg-cinema-red/10 border-cinema-red/50 text-bone shadow-[0_0_20px_rgba(234,51,51,0.15)] ring-1 ring-cinema-red/30'
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
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-sm font-semibold text-bone mb-1">4. Review & Send</h2>
                  <p className="text-xs text-muted mb-5">This is exactly how they will see it.</p>

                  {selectedTitle && (
                    <div className="rounded-2xl bg-elevated border border-border p-5 relative overflow-hidden shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-cinema-red/10 to-transparent pointer-events-none" />
                      <p className="text-xs text-muted uppercase tracking-wider mb-4 relative z-10">
                        To: <span className="text-bone font-medium">{isGroup ? groups.find(g => g.id === groupId)?.name : friends.find(f => f?.id === recipientId)?.displayName}</span>
                      </p>
                      <div className="flex gap-4 relative z-10">
                        <div className={`w-20 h-28 rounded-xl shadow-lg shrink-0 overflow-hidden border border-border/50 bg-ink ${!selectedTitle.posterUrl ? `poster-gradient-${selectedTitle.posterGradient}` : ''}`}>
                          {selectedTitle.posterUrl && (
                            <img src={selectedTitle.posterUrl} alt={selectedTitle.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg text-bone leading-tight mb-1">{selectedTitle.title}</p>
                          <p className="text-xs text-muted mb-2">{selectedTitle.releaseYear} · {selectedTitle.format}</p>
                          <div className="bg-ink/60 rounded-lg p-3 mb-2 border border-border/50 shadow-inner">
                            <p className="text-xs text-bone/90 italic leading-relaxed">&ldquo;{reason}&rdquo;</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs font-bold text-cinema-red px-2 py-1 rounded border border-cinema-red/30 bg-cinema-red/10">
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

            </div>

            {/* Navigation Controls */}
            <div className="p-5 border-t border-border bg-ink/50 flex justify-between items-center shrink-0">
              <button 
                onClick={prevStep} 
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${step === 1 ? 'invisible' : 'text-muted hover:text-bone hover:bg-surface-hover border border-transparent hover:border-border'}`}
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
                  className="px-6 py-2.5 bg-bone text-ink font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed btn-press transition-colors hover:bg-bone/90 shadow-md"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={!canSubmit || submitting}
                  className="px-8 py-2.5 bg-cinema-red text-bone font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed btn-press transition-colors hover:bg-cinema-red/90 flex items-center gap-2 shadow-[0_0_15px_rgba(234,51,51,0.4)]"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
                  {submitting ? 'Sending...' : 'Send Recommendation'}
                </button>
              )}
            </div>
          </div>
        )}
    </ModalBase>
  );
}
